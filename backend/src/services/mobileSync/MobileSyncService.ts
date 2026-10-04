import { validateSyncEnvelope, validateSyncItem } from "./mobileSyncValidator";
import {
  MOBILE_SYNC_ERROR_CODES,
  MobileExpenseSyncItem,
  MobileExpenseSyncResult,
  MobileSyncStore,
  SyncErrorLogEntry,
} from "./mobileSyncTypes";

/** Per-item work unit that remembers its position in the request. */
type PendingItem = { index: number; raw: unknown; item: MobileExpenseSyncItem };

/**
 * Extracts a driver error code/message from an unknown error.
 * @param error Any thrown value.
 * @returns Code (e.g. `ER_NO_REFERENCED_ROW_2`) and message.
 */
export const describeDatabaseError = (error: unknown): { code: string; message: string } => {
  const e = error as {
    code?: unknown;
    errno?: unknown;
    sqlMessage?: unknown;
    message?: unknown;
    driverError?: unknown;
  } | null;
  // TypeORM wraps driver errors in QueryFailedError; prefer the driver's fields.
  const source = (e?.driverError ?? e) as typeof e;
  const code =
    typeof source?.code === "string"
      ? source.code
      : typeof source?.errno === "number"
        ? String(source.errno)
        : "UNKNOWN";
  const message =
    typeof source?.sqlMessage === "string"
      ? source.sqlMessage
      : typeof source?.message === "string"
        ? source.message
        : String(error);
  return { code, message };
};

/**
 * Idempotent batch insertion of mobile expenses.
 *
 * - Every item carries a stable `syncKey`; a key that already exists returns
 *   the existing expense id and never inserts a second expense.
 * - Valid items are inserted in one transaction. If the transaction fails it
 *   is rolled back and one error-log row per item is written independently.
 * - Items that fail validation are reported (and logged) individually and do
 *   not block the remaining items.
 */
export class MobileSyncService {
  constructor(private readonly store: MobileSyncStore) {}

  /**
   * Processes a sync request.
   * @param body The raw request body (`{ expenses: [...] }`).
   * @returns One result per request item, in request order.
   * @throws {Exception} With status 400 when the envelope is invalid.
   */
  async syncExpenses(body: unknown): Promise<MobileExpenseSyncResult[]> {
    const rawItems = validateSyncEnvelope(body);
    const results: MobileExpenseSyncResult[] = new Array(rawItems.length);
    const pending: PendingItem[] = [];
    const errorLogs: SyncErrorLogEntry[] = [];

    rawItems.forEach((raw, index) => {
      const validation = validateSyncItem(raw);
      if (validation.valid) {
        pending.push({ index, raw, item: validation.item });
        return;
      }
      results[index] = {
        syncKey: validation.syncKey,
        success: false,
        errorCode: MOBILE_SYNC_ERROR_CODES.VALIDATION_ERROR,
        message: validation.message,
      };
      errorLogs.push({
        syncKey: validation.syncKey,
        requestBody: raw,
        errorCode: MOBILE_SYNC_ERROR_CODES.VALIDATION_ERROR,
        errorMessage: validation.message,
      });
    });

    if (pending.length > 0) {
      try {
        const committed = await this.insertWithRetryOnKeyRace(pending);
        committed.forEach((result, i) => (results[pending[i].index] = result));
      } catch (error) {
        const { code, message } = describeDatabaseError(error);
        console.error("[MobileSyncService] batch rolled back", code, message);
        for (const p of pending) {
          results[p.index] = {
            syncKey: p.item.syncKey,
            success: false,
            errorCode: MOBILE_SYNC_ERROR_CODES.BATCH_FAILED,
            databaseErrorCode: code,
            message,
          };
          errorLogs.push({
            syncKey: p.item.syncKey,
            requestBody: p.raw,
            errorCode: code,
            errorMessage: message,
          });
        }
      }
    }

    if (errorLogs.length > 0) {
      try {
        await this.store.writeErrorLogs(errorLogs);
      } catch (logError) {
        // The log is diagnostic only; never hide the sync outcome because of it.
        console.error("[MobileSyncService] could not write sync error log", logError);
      }
    }
    return results;
  }

  /**
   * Runs the batch transaction. A concurrent request carrying the same key can
   * make our insert hit the unique constraint; the transaction is then rolled
   * back and run once more, which finds the key committed by the other request.
   */
  private async insertWithRetryOnKeyRace(pending: PendingItem[]): Promise<MobileExpenseSyncResult[]> {
    try {
      return await this.insertBatch(pending);
    } catch (error) {
      if (!this.store.isDuplicateSyncKeyError(error)) throw error;
      return this.insertBatch(pending);
    }
  }

  /** Inserts every new item and resolves existing keys inside one transaction. */
  private insertBatch(pending: PendingItem[]): Promise<MobileExpenseSyncResult[]> {
    return this.store.runInTransaction(async (tx) => {
      const existing = await tx.findExpenseIdsBySyncKeys(pending.map((p) => p.item.syncKey));
      const results: MobileExpenseSyncResult[] = [];
      for (const { item } of pending) {
        const existingId = existing.get(item.syncKey);
        if (existingId !== undefined) {
          results.push({ syncKey: item.syncKey, success: true, remoteId: existingId, alreadySynced: true });
          continue;
        }
        const remoteId = await tx.insertExpense(item);
        await tx.insertSyncKey(item.syncKey, remoteId);
        results.push({ syncKey: item.syncKey, success: true, remoteId, alreadySynced: false });
      }
      return results;
    });
  }
}
