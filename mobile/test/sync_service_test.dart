import 'package:flutter_test/flutter_test.dart';
import 'package:ledger_mobile/core/database/app_database.dart';
import 'package:ledger_mobile/core/errors/app_exception.dart';
import 'package:ledger_mobile/features/catalogs/data/catalog_repository.dart';
import 'package:ledger_mobile/features/catalogs/domain/catalog_models.dart';
import 'package:ledger_mobile/features/expenses/data/expense_repository.dart';
import 'package:ledger_mobile/features/expenses/domain/expense_filter.dart';
import 'package:ledger_mobile/core/utilities/iso_date.dart';
import 'package:ledger_mobile/features/expenses/domain/sync_status.dart';
import 'package:ledger_mobile/features/synchronization/application/sync_lock.dart';
import 'package:ledger_mobile/features/synchronization/application/sync_service.dart';
import 'package:ledger_mobile/features/synchronization/data/sync_metadata_repository.dart';
import 'package:ledger_mobile/features/synchronization/domain/sync_models.dart';

import 'helpers/fake_ledger_server.dart';
import 'helpers/test_data.dart';

void main() {
  late AppDatabase db;
  late ExpenseRepository expenses;
  late CatalogRepository catalogs;
  late SyncMetadataRepository metadata;
  late FakeLedgerServer server;
  late SyncService sync;
  late SyncLock lock;

  setUp(() async {
    db = openTestDatabase();
    expenses = ExpenseRepository(db, clock: fixedNow);
    catalogs = CatalogRepository(db);
    metadata = SyncMetadataRepository(db);
    server = FakeLedgerServer();
    lock = SyncLock();
    sync = SyncService(
      database: db,
      expenses: expenses,
      catalogs: catalogs,
      metadata: metadata,
      catalogRemote: server,
      expenseRemote: server,
      syncRemote: server,
      lock: lock,
      clock: fixedNow,
    );
    await catalogs.replaceAll(testSnapshot());
  });

  tearDown(() => db.close());

  final allTime = ExpenseFilter(range: const DateRange('2000-01-01', '2100-12-31'));

  test('a new local expense is pending with a sync key and no remote id', () async {
    final e = await expenses.createLocal(validExpense());
    expect(e.remoteId, isNull);
    expect(e.syncStatus, SyncStatus.pending);
    expect(e.syncKey, isNotNull);
    expect(e.syncKey, matches(RegExp(r'^[0-9a-f-]{36}$')));
  });

  test('successful sync stores the remote id and keeps the row', () async {
    final local = await expenses.createLocal(validExpense());

    final report = await sync.normalSync();

    expect(report.uploaded, 1);
    expect(report.failedUploads, 0);
    expect(report.hasErrors, isFalse);
    final stored = await expenses.findById(local.id);
    expect(stored!.remoteId, 123);
    expect(stored.syncStatus, SyncStatus.synced);
    expect(stored.id, local.id, reason: 'local id is independent from the remote id');
    // After the refresh the uploaded expense is not duplicated.
    expect(await expenses.getFiltered(allTime), hasLength(1));
    expect((await metadata.load()).lastSuccessfulSync, fixedNow());
  });

  test('uploads in batches of at most 10', () async {
    for (var i = 0; i < 23; i++) {
      await expenses.createLocal(validExpense(description: 'Expense $i'));
    }
    final progress = <SyncProgress>[];

    final report = await sync.normalSync(onProgress: progress.add);

    expect(server.uploadCalls, 3); // 10 + 10 + 3
    expect(report.uploaded, 23);
    expect(server.expenses, hasLength(23));
    final uploads = progress.where((p) => p.phase == SyncPhase.uploading).map((p) => p.current).toList();
    expect(uploads, [0, 10, 20, 23]);
  });

  test('failed sync keeps the expense as failed and available for retry', () async {
    final local = await expenses.createLocal(validExpense());
    server.failUploadsWith = serverError;

    final report = await sync.normalSync();

    expect(report.failedUploads, 1);
    expect(report.hasErrors, isTrue);
    final stored = await expenses.findById(local.id);
    expect(stored!.remoteId, isNull);
    expect(stored.syncStatus, SyncStatus.failed);
    expect(stored.syncError, isNotNull);
    expect(await expenses.pendingUploads(), hasLength(1));
    expect((await metadata.load()).lastError, isNotNull);
  });

  test('retry after a failure succeeds', () async {
    final local = await expenses.createLocal(validExpense());
    server.failUploadsWith = serverError;
    await sync.normalSync();
    server.failUploadsWith = null;

    final report = await sync.normalSync();

    expect(report.uploaded, 1);
    final stored = await expenses.findById(local.id);
    expect(stored!.remoteId, 123);
    expect(stored.syncStatus, SyncStatus.synced);
    expect(stored.syncError, isNull);
  });

  test('timeout after remote insert + idempotent retry never duplicates', () async {
    final local = await expenses.createLocal(validExpense());
    final key = local.syncKey;
    server.loseNextUploadResponse = true;

    final first = await sync.normalSync();

    // Server committed (id 123) but the client saw a timeout.
    expect(server.expenses.keys, [123]);
    expect(first.uploadError, isNotNull);
    expect((await expenses.findById(local.id))!.syncStatus, SyncStatus.failed);
    expect((await expenses.findById(local.id))!.syncKey, key, reason: 'key must be stable across retries');

    final retry = await sync.normalSync();

    expect(retry.uploaded, 1);
    expect(retry.alreadyOnServer, 1);
    expect(server.expenses.keys, [123], reason: 'no remote id 124 created');
    final stored = await expenses.findById(local.id);
    expect(stored!.remoteId, 123);
    expect(await expenses.getFiltered(allTime), hasLength(1));
  });

  test('a downloaded copy of a lost-response upload is merged when the retry succeeds', () async {
    final local = await expenses.createLocal(validExpense());
    // Server commits, response lost; afterwards a refresh still succeeds and
    // downloads the expense as a separate row.
    server.loseNextUploadResponse = true;
    await sync.normalSync();
    await expenses.reconcileRemote(await server.fetchRange(sync.syncWindow), window: sync.syncWindow);
    expect(await expenses.getFiltered(allTime), hasLength(2));

    await sync.normalSync();

    final rows = await expenses.getFiltered(allTime);
    expect(rows, hasLength(1));
    expect(rows.single.id, local.id);
    expect(rows.single.remoteId, 123);
  });

  test('partial batch failure isolates the bad row; good rows still sync', () async {
    final good1 = await expenses.createLocal(validExpense(description: 'good 1'));
    final bad = await expenses.createLocal(validExpense(walletId: 24, description: 'bad'));
    final good2 = await expenses.createLocal(validExpense(description: 'good 2'));
    server.brokenWalletIds.add(24);

    final report = await sync.normalSync();

    expect(report.uploaded, 2);
    expect(report.failedUploads, 1);
    expect((await expenses.findById(good1.id))!.syncStatus, SyncStatus.synced);
    expect((await expenses.findById(good2.id))!.syncStatus, SyncStatus.synced);
    final failed = (await expenses.findById(bad.id))!;
    expect(failed.syncStatus, SyncStatus.failed);
    expect(failed.remoteId, isNull);
    expect(failed.syncError, contains('no longer exists'));
  });

  test('refresh failure keeps local expenses and their successful remote ids', () async {
    server.addRemote(remoteExpense(500));
    await sync.normalSync(); // first refresh brings expense 500
    final local = await expenses.createLocal(validExpense());
    server.failDownloadsWith = serverError;

    final report = await sync.normalSync();

    expect(report.uploaded, 1);
    expect(report.refreshError, isNotNull);
    final rows = await expenses.getFiltered(allTime);
    expect(rows.map((e) => e.remoteId), containsAll([500, 123]));
    expect((await expenses.findById(local.id))!.remoteId, 123);
  });

  test('a download failing on a later page does not partially replace data', () async {
    for (var i = 0; i < 7; i++) {
      server.addRemote(remoteExpense(600 + i));
    }
    await sync.normalSync();
    server.expenses.remove(600);
    server.failDownloadsWith = serverError;
    server.failFromPage = 2;

    final report = await sync.normalSync();

    expect(report.refreshError, isNotNull);
    final remoteIds = (await expenses.getFiltered(allTime)).map((e) => e.remoteId).toSet();
    expect(remoteIds, contains(600), reason: 'stale row is only removed after a complete download');
    expect(remoteIds, hasLength(7));
  });

  test('normal sync reconciles the window: insert, update and remove synced rows', () async {
    server.addRemote(remoteExpense(700, description: 'old'));
    server.addRemote(remoteExpense(701));
    server.addRemote(remoteExpense(702, buyDate: '2026-06-15')); // outside window
    await sync.normalSync();
    final pending = await expenses.createLocal(validExpense());
    server.failUploadsWith = serverError; // keep the local one pending/failed

    server.addRemote(remoteExpense(700, description: 'new'));
    server.expenses.remove(701);
    server.addRemote(remoteExpense(703));
    await sync.normalSync();

    final rows = await expenses.getFiltered(allTime);
    final byRemote = {for (final r in rows) r.remoteId: r};
    expect(byRemote[700]!.description, 'new');
    expect(byRemote.containsKey(701), isFalse);
    expect(byRemote.containsKey(703), isTrue);
    expect(byRemote.containsKey(702), isFalse, reason: 'never downloaded: outside the window');
    expect(rows.any((r) => r.id == pending.id), isTrue, reason: 'pending rows are never deleted');
  });

  test('initial sync downloads catalogs and the three-month window, following pagination', () async {
    await db.delete(db.currencies).go();
    for (var i = 0; i < 8; i++) {
      server.addRemote(remoteExpense(800 + i, buyDate: '2026-08-${(i + 1).toString().padLeft(2, '0')}'));
    }
    server.addRemote(remoteExpense(900, buyDate: '2026-07-31')); // before Aug 1
    server.addRemote(remoteExpense(901, buyDate: '2026-10-31')); // inclusive end
    final pages = <int>[];

    final report = await sync.fullSync(
        initial: true,
        onProgress: (p) {
          if (p.phase == SyncPhase.downloadingExpenses && p.total > 0) pages.add(p.current);
        });

    expect(report.kind, SyncKind.initial);
    expect(report.catalogsRefreshed, isTrue);
    expect(report.refreshed, 9);
    expect(pages, [1, 2, 3]); // pageSize 3 → 9 rows in 3 pages
    expect((await catalogs.load()).currencies, hasLength(3));
    final remoteIds = (await expenses.getFiltered(allTime)).map((e) => e.remoteId).toSet();
    expect(remoteIds.contains(900), isFalse);
    expect(remoteIds.contains(901), isTrue);
  });

  test('full sync failure leaves the offline dataset untouched', () async {
    server.addRemote(remoteExpense(1000));
    await sync.fullSync();
    final pending = await expenses.createLocal(validExpense(walletId: 24));
    server.brokenWalletIds.add(24);
    server.snapshot = testSnapshot();
    server.failDownloadsWith = timeoutError;

    await expectLater(sync.fullSync(), throwsA(isA<ApiException>()));

    final rows = await expenses.getFiltered(allTime);
    expect(rows.map((r) => r.remoteId), contains(1000));
    expect(rows.any((r) => r.id == pending.id), isTrue);
    expect((await catalogs.load()).wallets, hasLength(4));
    expect((await metadata.load()).lastError, contains('failed'));
  });

  test('full sync with an invalid catalog never replaces the cache', () async {
    final valid = testSnapshot();
    server.snapshot = CatalogSnapshot(
      currencies: const [usd], // no default currency (conversion = 1)
      walletGroups: valid.walletGroups,
      wallets: valid.wallets,
      walletMembers: valid.walletMembers,
      expenseTypes: valid.expenseTypes,
      vendors: valid.vendors,
    );

    await expectLater(sync.fullSync(), throwsA(isA<ApiException>()));

    expect((await catalogs.load()).currencies, hasLength(3));
  });

  test('full sync uploads pending first and keeps them through the replacement', () async {
    final local = await expenses.createLocal(validExpense());
    server.addRemote(remoteExpense(1100, buyDate: '2026-05-01')); // outside window

    final report = await sync.fullSync();

    expect(report.uploaded, 1);
    final stored = await expenses.findById(local.id);
    expect(stored!.remoteId, 123);
    expect(stored.syncStatus, SyncStatus.synced);
  });

  test('connectivity failure stops uploading after the first batch', () async {
    for (var i = 0; i < 15; i++) {
      await expenses.createLocal(validExpense(description: 'e$i'));
    }
    server.failUploadsWith = timeoutError;

    final report = await sync.normalSync();

    expect(server.uploadCalls, 1);
    expect(report.uploadError, isNotNull);
    expect(server.downloadCalls, 0, reason: 'refresh is skipped when the server is unreachable');
    expect(await expenses.pendingUploads(), hasLength(15));
  });

  test('two syncs cannot run concurrently', () async {
    await expenses.createLocal(validExpense());
    final first = sync.normalSync();
    await expectLater(sync.normalSync(), throwsA(isA<SyncInProgressException>()));
    await first;
    expect(lock.isBusy, isFalse);
  });
}
