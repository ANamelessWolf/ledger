/**
 * Contracts for the idempotent mobile batch-sync endpoint (`POST /expenses/sync`).
 */

/** Maximum number of expenses accepted in a single sync batch. */
export const MOBILE_SYNC_MAX_BATCH_SIZE = 10;

/** Maximum length of an expense description (`expense.description VARCHAR(120)`). */
export const EXPENSE_DESCRIPTION_MAX_LENGTH = 120;

/** Machine-readable error codes returned per item. */
export const MOBILE_SYNC_ERROR_CODES = {
  /** The item failed request validation; it was not sent to the database. */
  VALIDATION_ERROR: "VALIDATION_ERROR",
  /** The batch transaction failed and was rolled back; the item may be retried. */
  BATCH_FAILED: "BATCH_FAILED",
} as const;

/** One expense as sent by the mobile app. */
export type MobileExpenseSyncItem = {
  /** Stable client-generated idempotency key (UUID). */
  syncKey: string;
  walletId: number;
  expenseTypeId: number;
  vendorId: number;
  description: string;
  total: number;
  /** Optional expense-specific conversion factor to the default currency. */
  currencyFactor: number | null;
  /** Date-only purchase date, `YYYY-MM-DD`. */
  buyDate: string;
};

/** Successful per-item outcome. */
export type MobileExpenseSyncSuccess = {
  syncKey: string;
  success: true;
  /** Id of the expense in Ledger. */
  remoteId: number;
  /** True when the key had already been synchronized by an earlier request. */
  alreadySynced: boolean;
};

/** Failed per-item outcome. */
export type MobileExpenseSyncFailure = {
  syncKey: string | null;
  success: false;
  /** One of {@link MOBILE_SYNC_ERROR_CODES}. */
  errorCode: string;
  /** Database/driver error code when the failure came from the database. */
  databaseErrorCode?: string;
  message: string;
};

export type MobileExpenseSyncResult = MobileExpenseSyncSuccess | MobileExpenseSyncFailure;

/** Diagnostic entry persisted for a failed request item. */
export type SyncErrorLogEntry = {
  syncKey: string | null;
  requestBody: unknown;
  errorCode: string | null;
  errorMessage: string | null;
};

/** Operations available inside the batch database transaction. */
export interface MobileSyncTransaction {
  /** Returns the expense ids already associated with the given keys. */
  findExpenseIdsBySyncKeys(syncKeys: string[]): Promise<Map<string, number>>;
  /** Inserts the expense and returns its generated id. */
  insertExpense(item: MobileExpenseSyncItem): Promise<number>;
  /** Persists the idempotency key for a newly inserted expense. */
  insertSyncKey(syncKey: string, expenseId: number): Promise<void>;
}

/** Persistence port used by `MobileSyncService`. */
export interface MobileSyncStore {
  /**
   * Runs `work` in a single database transaction. Any thrown error must roll
   * back every write performed through the transaction.
   */
  runInTransaction<T>(work: (tx: MobileSyncTransaction) => Promise<T>): Promise<T>;
  /** Writes error-log rows independently of any (failed) batch transaction. */
  writeErrorLogs(entries: SyncErrorLogEntry[]): Promise<void>;
  /** True when `error` is a unique-constraint violation on the sync key. */
  isDuplicateSyncKeyError(error: unknown): boolean;
}
