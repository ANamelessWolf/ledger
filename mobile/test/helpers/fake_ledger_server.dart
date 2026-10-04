import 'package:ledger_mobile/core/errors/app_exception.dart';
import 'package:ledger_mobile/core/network/paginator.dart';
import 'package:ledger_mobile/core/utilities/iso_date.dart';
import 'package:ledger_mobile/features/catalogs/data/catalog_remote_data_source.dart';
import 'package:ledger_mobile/features/catalogs/domain/catalog_models.dart';
import 'package:ledger_mobile/features/expenses/data/expense_remote_data_source.dart';
import 'package:ledger_mobile/features/expenses/domain/remote_expense.dart';
import 'package:ledger_mobile/features/synchronization/data/sync_remote_data_source.dart';

import 'test_data.dart';

const timeoutError = ApiException(ApiErrorKind.timeout, 'Ledger did not answer in time.');
const serverError = ApiException(ApiErrorKind.server, 'The Ledger server had an internal error (500).');

/// In-memory Ledger that behaves like the real backend: the sync endpoint is
/// idempotent on `syncKey`, batches are transactional, and expenses are
/// served through real pagination.
class FakeLedgerServer implements CatalogRemoteDataSource, ExpenseRemoteDataSource, SyncRemoteDataSource {
  FakeLedgerServer({CatalogSnapshot? snapshot}) : snapshot = snapshot ?? testSnapshot();

  CatalogSnapshot snapshot;
  final Map<int, RemoteExpense> expenses = {};
  final Map<String, int> syncKeys = {};
  int nextId = 123;
  int pageSize = 3;

  /// Wallets whose inserts fail with a foreign key error.
  final Set<int> brokenWalletIds = {};

  int uploadCalls = 0;
  int downloadCalls = 0;
  int catalogCalls = 0;

  /// Failure injection.
  ApiException? failUploadsWith;
  ApiException? failDownloadsWith;
  ApiException? failCatalogsWith;

  /// Fails downloads only from this page on (to test partial downloads).
  int? failFromPage;

  /// Simulates a lost response: the server commits, then the client times out.
  bool loseNextUploadResponse = false;

  @override
  Future<CatalogSnapshot> fetchSnapshot() async {
    catalogCalls++;
    if (failCatalogsWith != null) throw failCatalogsWith!;
    return snapshot;
  }

  @override
  Future<List<RemoteExpense>> fetchRange(DateRange range, {PageProgress? onProgress}) {
    downloadCalls++;
    final paginator = Paginator<RemoteExpense>(
      pageSize: pageSize,
      idOf: (e) => e.id,
      fetchPage: (page, size) async {
        if (failDownloadsWith != null && (failFromPage == null || page >= failFromPage!)) {
          throw failDownloadsWith!;
        }
        final matching = expenses.values.where((e) => range.contains(e.buyDate)).toList()
          ..sort((a, b) => a.id.compareTo(b.id));
        final items = matching.skip((page - 1) * size).take(size).toList();
        return PageResult(items: items, totalCount: matching.length);
      },
    );
    return paginator.fetchAll(onProgress: onProgress);
  }

  @override
  Future<List<SyncUploadResult>> uploadBatch(List<SyncUploadItem> items) async {
    uploadCalls++;
    if (items.isEmpty || items.length > syncBatchSize) {
      throw ApiException.fromStatus(400, serverMessage: 'A batch must contain between 1 and 10 expenses');
    }
    if (failUploadsWith != null) throw failUploadsWith!;

    // Transaction: stage, then commit everything or nothing.
    final staged = <String, int>{};
    final stagedExpenses = <int, RemoteExpense>{};
    final results = <SyncUploadResult>[];
    var id = nextId;
    for (final item in items) {
      final existing = syncKeys[item.syncKey];
      if (existing != null) {
        results.add(SyncUploadResult(syncKey: item.syncKey, success: true, remoteId: existing, alreadySynced: true));
        continue;
      }
      if (brokenWalletIds.contains(item.walletId)) {
        return [
          for (final i in items)
            SyncUploadResult(
              syncKey: i.syncKey,
              success: false,
              errorCode: SyncUploadResult.batchFailedCode,
              databaseErrorCode: 'ER_NO_REFERENCED_ROW_2',
              message: 'Cannot add or update a child row',
            ),
        ];
      }
      final newId = id++;
      staged[item.syncKey] = newId;
      stagedExpenses[newId] = RemoteExpense(
        id: newId,
        walletId: item.walletId,
        expenseTypeId: item.expenseTypeId,
        vendorId: item.vendorId,
        description: item.description,
        total: item.total,
        currencyFactor: item.currencyFactor,
        buyDate: item.buyDate,
        sortId: 0,
      );
      results.add(SyncUploadResult(syncKey: item.syncKey, success: true, remoteId: newId));
    }
    syncKeys.addAll(staged);
    expenses.addAll(stagedExpenses);
    nextId = id;

    if (loseNextUploadResponse) {
      loseNextUploadResponse = false;
      throw timeoutError;
    }
    return results;
  }

  void addRemote(RemoteExpense e) => expenses[e.id] = e;
}
