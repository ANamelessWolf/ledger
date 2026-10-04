import { MobileSyncService } from "../../src/services/mobileSync/MobileSyncService";
import {
  MOBILE_SYNC_ERROR_CODES,
  MobileExpenseSyncItem,
} from "../../src/services/mobileSync/mobileSyncTypes";
import { Exception } from "../../src/common";
import { InMemoryMobileSyncStore } from "./inMemoryMobileSyncStore";

const item = (syncKey: string, overrides: Partial<MobileExpenseSyncItem> = {}): MobileExpenseSyncItem => ({
  syncKey,
  walletId: 1,
  expenseTypeId: 3,
  vendorId: 23,
  description: "Groceries",
  total: 1250.5,
  currencyFactor: null,
  buyDate: "2026-10-03",
  ...overrides,
});

describe("MobileSyncService", () => {
  let store: InMemoryMobileSyncStore;
  let service: MobileSyncService;

  beforeEach(() => {
    store = new InMemoryMobileSyncStore();
    service = new MobileSyncService(store);
  });

  it("inserts new expenses and returns their remote ids", async () => {
    const results = await service.syncExpenses({ expenses: [item("key-aaaa-1"), item("key-aaaa-2")] });

    expect(results).toEqual([
      { syncKey: "key-aaaa-1", success: true, remoteId: 123, alreadySynced: false },
      { syncKey: "key-aaaa-2", success: true, remoteId: 124, alreadySynced: false },
    ]);
    expect(store.expenses.size).toBe(2);
    expect(store.errorLogs).toHaveLength(0);
  });

  it("CRITICAL: a retry after a lost response returns the same id and never inserts a duplicate", async () => {
    // First request: the server inserts the expense, but the client never sees the response.
    const first = await service.syncExpenses({ expenses: [item("ABC-0000-key")] });
    expect(first[0]).toMatchObject({ success: true, remoteId: 123 });

    // Client retries with the same syncKey.
    const retry = await service.syncExpenses({ expenses: [item("ABC-0000-key")] });

    expect(retry[0]).toEqual({ syncKey: "ABC-0000-key", success: true, remoteId: 123, alreadySynced: true });
    expect(store.expenses.size).toBe(1);
    expect([...store.expenses.keys()]).toEqual([123]); // no 124
  });

  it("mixes already-synced and new keys in one batch", async () => {
    await service.syncExpenses({ expenses: [item("key-old-0001")] });
    const results = await service.syncExpenses({ expenses: [item("key-old-0001"), item("key-new-0001")] });

    expect(results[0]).toMatchObject({ remoteId: 123, alreadySynced: true });
    expect(results[1]).toMatchObject({ remoteId: 124, alreadySynced: false });
    expect(store.expenses.size).toBe(2);
  });

  it("rolls back the whole batch on a database error and logs every row", async () => {
    const results = await service.syncExpenses({
      expenses: [item("key-good-001"), item("key-bad-0001", { walletId: 999 }), item("key-good-002")],
    });

    expect(store.expenses.size).toBe(0); // rollback: the first good insert is gone too
    expect(store.syncKeys.size).toBe(0);
    for (const r of results) {
      expect(r).toMatchObject({
        success: false,
        errorCode: MOBILE_SYNC_ERROR_CODES.BATCH_FAILED,
        databaseErrorCode: "ER_NO_REFERENCED_ROW_2",
      });
    }
    expect(store.errorLogs).toHaveLength(3);
    expect(store.errorLogs.map((l) => l.syncKey)).toEqual(["key-good-001", "key-bad-0001", "key-good-002"]);
    expect(store.errorLogs[1]).toMatchObject({
      errorCode: "ER_NO_REFERENCED_ROW_2",
      requestBody: item("key-bad-0001", { walletId: 999 }),
    });
  });

  it("allows retrying a failed batch once the cause is fixed", async () => {
    await service.syncExpenses({ expenses: [item("key-retry-01", { walletId: 999 })] });
    store.validWalletIds.add(999);

    const retry = await service.syncExpenses({ expenses: [item("key-retry-01", { walletId: 999 })] });
    expect(retry[0]).toMatchObject({ success: true, alreadySynced: false });
    expect(store.expenses.size).toBe(1);
  });

  it("reports validation failures per item without blocking valid items", async () => {
    const results = await service.syncExpenses({
      expenses: [item("key-valid-01"), item("key-invalid1", { description: "  " })],
    });

    expect(results[0]).toMatchObject({ success: true, remoteId: 123 });
    expect(results[1]).toMatchObject({
      syncKey: "key-invalid1",
      success: false,
      errorCode: MOBILE_SYNC_ERROR_CODES.VALIDATION_ERROR,
    });
    expect(store.expenses.size).toBe(1);
    expect(store.errorLogs).toHaveLength(1);
  });

  it.each([
    ["description > 120", { description: "x".repeat(121) }],
    ["total <= 0", { total: 0 }],
    ["negative total", { total: -5 }],
    ["missing wallet", { walletId: undefined }],
    ["missing vendor", { vendorId: undefined }],
    ["missing expense type", { expenseTypeId: undefined }],
    ["invalid date", { buyDate: "2026-02-30" }],
    ["localized date", { buyDate: "October 3, 2026" }],
    ["zero currency factor", { currencyFactor: 0 }],
  ])("rejects %s", async (_label, overrides) => {
    const results = await service.syncExpenses({
      expenses: [item("key-check-01", overrides as Partial<MobileExpenseSyncItem>)],
    });
    expect(results[0]).toMatchObject({ success: false, errorCode: MOBILE_SYNC_ERROR_CODES.VALIDATION_ERROR });
    expect(store.expenses.size).toBe(0);
  });

  it("stores the optional currency factor", async () => {
    await service.syncExpenses({ expenses: [item("key-factor-1", { currencyFactor: 17.31 })] });
    expect(store.expenses.get(123)?.currencyFactor).toBe(17.31);
  });

  it("resolves a concurrent insert of the same key by retrying the transaction", async () => {
    // Another request commits the same key between our lookup and our commit.
    store.beforeCommit = () => {
      store.beforeCommit = null;
      store.commitExternally("key-race-001", item("key-race-001"));
    };

    const results = await service.syncExpenses({ expenses: [item("key-race-001")] });

    expect(results[0]).toMatchObject({ success: true, alreadySynced: true });
    expect(store.expenses.size).toBe(1);
    expect(store.transactionCount).toBe(2);
  });

  it.each([
    ["missing expenses array", {}],
    ["empty batch", { expenses: [] }],
    ["batch larger than 10", { expenses: Array.from({ length: 11 }, (_, i) => item(`key-many-${i}0`)) }],
    ["duplicate keys", { expenses: [item("key-dup-0001"), item("key-dup-0001")] }],
  ])("rejects the envelope with HTTP 400: %s", async (_label, body) => {
    await expect(service.syncExpenses(body)).rejects.toMatchObject({ statusCode: 400 });
    await expect(service.syncExpenses(body)).rejects.toBeInstanceOf(Exception);
    expect(store.transactionCount).toBe(0);
  });

  it("keeps the sync outcome when writing the error log fails", async () => {
    store.writeErrorLogs = async () => {
      throw new Error("log table missing");
    };
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const results = await service.syncExpenses({ expenses: [item("key-nolog-01", { walletId: 999 })] });
    expect(results[0]).toMatchObject({ success: false, errorCode: MOBILE_SYNC_ERROR_CODES.BATCH_FAILED });
    spy.mockRestore();
  });
});
