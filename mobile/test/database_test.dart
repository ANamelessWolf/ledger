import 'package:flutter_test/flutter_test.dart';
import 'package:ledger_mobile/core/database/app_database.dart';
import 'package:ledger_mobile/core/errors/app_exception.dart';
import 'package:ledger_mobile/core/utilities/iso_date.dart';
import 'package:ledger_mobile/features/catalogs/data/catalog_repository.dart';
import 'package:ledger_mobile/features/catalogs/domain/catalog_models.dart';
import 'package:ledger_mobile/features/expenses/data/expense_repository.dart';
import 'package:ledger_mobile/features/expenses/domain/expense_filter.dart';
import 'package:ledger_mobile/features/expenses/domain/sync_status.dart';

import 'helpers/test_data.dart';

void main() {
  late AppDatabase db;
  late ExpenseRepository expenses;
  late CatalogRepository catalogs;

  setUp(() async {
    db = openTestDatabase();
    expenses = ExpenseRepository(db, clock: fixedNow);
    catalogs = CatalogRepository(db);
    await catalogs.replaceAll(testSnapshot());
  });

  tearDown(() => db.close());

  final october = ExpenseFilter(range: const DateRange('2026-10-01', '2026-10-31'));

  group('local expenses', () {
    test('persist numeric values and ISO dates', () async {
      final e = await expenses.createLocal(validExpense(total: 1250.75, currencyFactor: 17.5, walletId: 24));
      final stored = await expenses.findById(e.id);
      expect(stored!.total, 1250.75);
      expect(stored.currencyFactor, 17.5);
      expect(stored.buyDate, '2026-10-02');
      expect(stored.createdAt, fixedNow());
    });

    test('each local expense gets a unique sync key', () async {
      final a = await expenses.createLocal(validExpense());
      final b = await expenses.createLocal(validExpense());
      expect(a.syncKey, isNot(b.syncKey));
    });

    test('pending expenses can be edited and deleted; the sync key is kept', () async {
      final e = await expenses.createLocal(validExpense());
      final updated = await expenses.updateLocal(e.id, validExpense(description: 'Changed', total: 5));
      expect(updated.description, 'Changed');
      expect(updated.syncKey, e.syncKey);
      expect(updated.syncStatus, SyncStatus.pending);

      await expenses.deleteLocal(e.id);
      expect(await expenses.findById(e.id), isNull);
    });

    test('synchronized expenses cannot be edited or deleted', () async {
      final e = await expenses.createLocal(validExpense());
      await expenses.markSynced(e.id, 321);
      await expectLater(expenses.updateLocal(e.id, validExpense()), throwsA(isA<DataUnavailableException>()));
      await expectLater(expenses.deleteLocal(e.id), throwsA(isA<DataUnavailableException>()));
    });
  });

  test('remote id update marks the row synced and clears the error', () async {
    final e = await expenses.createLocal(validExpense());
    await expenses.markFailed({e.id: 'boom'});
    expect((await expenses.findById(e.id))!.syncStatus, SyncStatus.failed);

    await expenses.markSynced(e.id, 777);

    final stored = await expenses.findById(e.id);
    expect(stored!.remoteId, 777);
    expect(stored.syncStatus, SyncStatus.synced);
    expect(stored.syncError, isNull);
  });

  test('catalog replacement replaces every table atomically', () async {
    final snapshot = testSnapshot();
    await catalogs.replaceAll(CatalogSnapshot(
      currencies: snapshot.currencies,
      walletGroups: const [WalletGroup(id: 1, name: 'Only group', isActive: true)],
      wallets: const [Wallet(id: 99, name: 'New wallet', currencyId: 2)],
      walletMembers: const [WalletMember(id: 50, walletId: 99, walletGroupId: 1)],
      expenseTypes: snapshot.expenseTypes,
      vendors: const [Vendor(id: 1, name: 'Single vendor')],
    ));

    final loaded = await catalogs.load();
    expect(loaded.wallets.keys, [99]);
    expect(loaded.vendors.map((v) => v.id), [1]);
    expect(loaded.primaryGroupOf(99)!.name, 'Only group');
  });

  test('invalid catalogs never replace a valid cache', () async {
    final s = testSnapshot();
    await expectLater(
      catalogs.replaceAll(CatalogSnapshot(
        currencies: s.currencies,
        walletGroups: s.walletGroups,
        wallets: const [Wallet(id: 1, name: 'Bad', currencyId: 404)],
        walletMembers: const [],
        expenseTypes: s.expenseTypes,
        vendors: s.vendors,
      )),
      throwsA(isA<FormatException>()),
    );
    expect((await catalogs.load()).wallets, hasLength(4));
  });

  group('remote reconciliation', () {
    test('inserts, updates and removes synced rows inside the window only', () async {
      await expenses.reconcileRemote([
        remoteExpense(1, buyDate: '2026-10-01'),
        remoteExpense(2, buyDate: '2026-10-02'),
        remoteExpense(3, buyDate: '2026-06-01'), // outside the window
      ]);

      final result = await expenses.reconcileRemote(
        [remoteExpense(1, buyDate: '2026-10-01', total: 999), remoteExpense(4, buyDate: '2026-10-04')],
        window: const DateRange('2026-08-01', '2026-10-31'),
      );

      expect(result.inserted, 1);
      expect(result.updated, 1);
      expect(result.deleted, 1);
      final all = await expenses.getFiltered(ExpenseFilter(range: const DateRange('2000-01-01', '2100-01-01')));
      final byRemote = {for (final e in all) e.remoteId: e};
      expect(byRemote.keys, unorderedEquals([1, 3, 4]));
      expect(byRemote[1]!.total, 999);
    });

    test('a full replacement (no window) removes every synced row not received', () async {
      await expenses.reconcileRemote([remoteExpense(1, buyDate: '2026-06-01')]);
      await expenses.reconcileRemote([remoteExpense(2)]);
      final all = await expenses.getFiltered(ExpenseFilter(range: const DateRange('2000-01-01', '2100-01-01')));
      expect(all.map((e) => e.remoteId), [2]);
    });

    test('pending and failed expenses are preserved and never overwritten', () async {
      final pending = await expenses.createLocal(validExpense(description: 'pending'));
      final failed = await expenses.createLocal(validExpense(description: 'failed'));
      await expenses.markFailed({failed.id: 'err'});

      await expenses.reconcileRemote(const []);

      final rows = await expenses.getFiltered(october);
      expect(rows.map((e) => e.id), unorderedEquals([pending.id, failed.id]));
      expect((await expenses.findById(failed.id))!.syncStatus, SyncStatus.failed);
      expect((await expenses.findById(pending.id))!.description, 'pending');
    });
  });

  group('filtered query', () {
    setUp(() async {
      await expenses.reconcileRemote([
        remoteExpense(1, buyDate: '2026-10-01', walletId: 7, vendorId: 23, expenseTypeId: 3),
        remoteExpense(2, buyDate: '2026-10-15', walletId: 24, vendorId: 31, expenseTypeId: 52),
        remoteExpense(3, buyDate: '2026-10-31', walletId: 7, vendorId: 31, expenseTypeId: 52),
        remoteExpense(4, buyDate: '2026-09-30', walletId: 7, vendorId: 23, expenseTypeId: 3),
      ]);
    });

    test('date range is inclusive and ordered newest first', () async {
      final rows = await expenses.getFiltered(october);
      expect(rows.map((e) => e.remoteId), [3, 2, 1]);
    });

    test('wallet / vendor / type criteria combine', () async {
      expect((await expenses.getFiltered(october.copyWith(walletId: () => 7))).map((e) => e.remoteId), [3, 1]);
      expect((await expenses.getFiltered(october.copyWith(vendorId: () => 31))).map((e) => e.remoteId), [3, 2]);
      expect(
        (await expenses.getFiltered(october.copyWith(walletId: () => 7, expenseTypeId: () => 52))).map((e) => e.remoteId),
        [3],
      );
    });
  });

  test('sync counts track pending and failed rows', () async {
    final a = await expenses.createLocal(validExpense());
    await expenses.createLocal(validExpense());
    await expenses.markFailed({a.id: 'x'});
    final counts = await expenses.watchSyncCounts().first;
    expect(counts.pending, 1);
    expect(counts.failed, 1);
  });
}
