import {
  MobileExpenseSyncItem,
  MobileSyncStore,
  MobileSyncTransaction,
  SyncErrorLogEntry,
} from "../../src/services/mobileSync/mobileSyncTypes";

/** Error shaped like a mysql2 driver error. */
export class FakeDriverError extends Error {
  constructor(public code: string, public sqlMessage: string) {
    super(sqlMessage);
  }
}

/**
 * In-memory {@link MobileSyncStore} with real transaction semantics: writes are
 * buffered and only become visible when the unit of work completes, and a
 * thrown error discards them (rollback). Mirrors the unique constraint on
 * `expense_sync_key.sync_key` and the expense foreign keys.
 */
export class InMemoryMobileSyncStore implements MobileSyncStore {
  expenses = new Map<number, MobileExpenseSyncItem>();
  syncKeys = new Map<string, number>();
  errorLogs: SyncErrorLogEntry[] = [];
  /** Wallet ids accepted by the fake foreign key. */
  validWalletIds = new Set<number>([1, 2, 3]);
  private nextId = 123;
  transactionCount = 0;
  /** Optional hook run right before commit (e.g. to simulate a concurrent writer). */
  beforeCommit: (() => void) | null = null;

  async runInTransaction<T>(work: (tx: MobileSyncTransaction) => Promise<T>): Promise<T> {
    this.transactionCount++;
    const stagedExpenses = new Map<number, MobileExpenseSyncItem>();
    const stagedKeys = new Map<string, number>();
    let nextId = this.nextId;

    const tx: MobileSyncTransaction = {
      findExpenseIdsBySyncKeys: async (keys) => {
        const found = new Map<string, number>();
        for (const k of keys) {
          const id = stagedKeys.get(k) ?? this.syncKeys.get(k);
          if (id !== undefined) found.set(k, id);
        }
        return found;
      },
      insertExpense: async (item) => {
        if (!this.validWalletIds.has(item.walletId)) {
          throw new FakeDriverError(
            "ER_NO_REFERENCED_ROW_2",
            "Cannot add or update a child row: a foreign key constraint fails (fk_expense_wallet)"
          );
        }
        const id = nextId++;
        stagedExpenses.set(id, item);
        return id;
      },
      insertSyncKey: async (key, expenseId) => {
        if (stagedKeys.has(key) || this.syncKeys.has(key)) {
          throw new FakeDriverError("ER_DUP_ENTRY", `Duplicate entry '${key}' for key 'expense_sync_key.PRIMARY'`);
        }
        stagedKeys.set(key, expenseId);
      },
    };

    const result = await work(tx); // throwing here discards staged writes (rollback)
    this.beforeCommit?.();
    for (const key of stagedKeys.keys()) {
      if (this.syncKeys.has(key)) {
        throw new FakeDriverError("ER_DUP_ENTRY", `Duplicate entry '${key}' for key 'expense_sync_key.PRIMARY'`);
      }
    }
    stagedExpenses.forEach((v, k) => this.expenses.set(k, v));
    stagedKeys.forEach((v, k) => this.syncKeys.set(k, v));
    this.nextId = nextId;
    return result;
  }

  async writeErrorLogs(entries: SyncErrorLogEntry[]): Promise<void> {
    this.errorLogs.push(...entries);
  }

  isDuplicateSyncKeyError(error: unknown): boolean {
    return error instanceof FakeDriverError && error.code === "ER_DUP_ENTRY";
  }

  /** Simulates another request committing a key/expense directly. */
  commitExternally(key: string, item: MobileExpenseSyncItem): number {
    const id = this.nextId++;
    this.expenses.set(id, item);
    this.syncKeys.set(key, id);
    return id;
  }
}
