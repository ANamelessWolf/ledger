import { DataSource, EntityManager, In, QueryFailedError } from "typeorm";
import { Expense, ExpenseSyncErrorLog, ExpenseSyncKey } from "../../models/expenses";
import {
  MobileExpenseSyncItem,
  MobileSyncStore,
  MobileSyncTransaction,
  SyncErrorLogEntry,
} from "./mobileSyncTypes";

/** {@link MobileSyncTransaction} bound to a TypeORM transactional entity manager. */
class TypeOrmMobileSyncTransaction implements MobileSyncTransaction {
  constructor(private readonly manager: EntityManager) {}

  async findExpenseIdsBySyncKeys(syncKeys: string[]): Promise<Map<string, number>> {
    if (syncKeys.length === 0) return new Map();
    const rows = await this.manager.find(ExpenseSyncKey, { where: { syncKey: In(syncKeys) } });
    return new Map(rows.map((row) => [row.syncKey, row.expenseId]));
  }

  async insertExpense(item: MobileExpenseSyncItem): Promise<number> {
    const result = await this.manager.insert(Expense, {
      walletId: item.walletId,
      expenseTypeId: item.expenseTypeId,
      vendorId: item.vendorId,
      description: item.description,
      total: item.total,
      currencyFactor: item.currencyFactor,
      // Date-only string; MySQL DATE stores it without timezone conversion.
      buyDate: item.buyDate as unknown as Date,
      sortId: 0,
    });
    return Number(result.identifiers[0].id);
  }

  async insertSyncKey(syncKey: string, expenseId: number): Promise<void> {
    await this.manager.insert(ExpenseSyncKey, { syncKey, expenseId });
  }
}

/** MySQL/TypeORM implementation of {@link MobileSyncStore}. */
export class TypeOrmMobileSyncStore implements MobileSyncStore {
  constructor(private readonly dataSource: DataSource) {}

  runInTransaction<T>(work: (tx: MobileSyncTransaction) => Promise<T>): Promise<T> {
    return this.dataSource.transaction((manager) => work(new TypeOrmMobileSyncTransaction(manager)));
  }

  async writeErrorLogs(entries: SyncErrorLogEntry[]): Promise<void> {
    // Uses the default manager: an auto-committed statement that is independent
    // from the rolled-back batch transaction.
    await this.dataSource.manager.insert(
      ExpenseSyncErrorLog,
      entries.map((e) => ({
        syncKey: e.syncKey,
        requestBody: JSON.stringify(e.requestBody ?? null),
        errorCode: e.errorCode?.slice(0, 64) ?? null,
        errorMessage: e.errorMessage,
      }))
    );
  }

  isDuplicateSyncKeyError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;
    const driverError = error.driverError as { code?: string; sqlMessage?: string } | undefined;
    return (
      driverError?.code === "ER_DUP_ENTRY" &&
      (driverError.sqlMessage ?? "").includes("expense_sync_key")
    );
  }
}
