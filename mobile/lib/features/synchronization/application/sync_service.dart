import 'package:flutter/foundation.dart';

import '../../../core/database/app_database.dart';
import '../../../core/errors/app_exception.dart';
import '../../../core/utilities/clock.dart';
import '../../../core/utilities/iso_date.dart';
import '../../catalogs/data/catalog_remote_data_source.dart';
import '../../catalogs/data/catalog_repository.dart';
import '../../expenses/data/expense_remote_data_source.dart';
import '../../expenses/data/expense_repository.dart';
import '../../expenses/domain/expense.dart';
import '../data/sync_metadata_repository.dart';
import '../data/sync_remote_data_source.dart';
import '../domain/sync_models.dart';
import 'sync_lock.dart';

/// Coordinates the three synchronization modes.
///
/// Invariants:
/// - Local expenses with `remote_id = null` are never deleted by a sync.
/// - Nothing local is replaced until every download succeeded; downloads are
///   staged in memory and written in a single transaction.
/// - Only one sync runs at a time ([SyncLock]).
class SyncService {
  SyncService({
    required AppDatabase database,
    required this._expenses,
    required this._catalogs,
    required this._metadata,
    required this._catalogRemote,
    required this._expenseRemote,
    required this._syncRemote,
    required this._lock,
    this._clock = systemClock,
  }) : _db = database;

  final AppDatabase _db;
  final ExpenseRepository _expenses;
  final CatalogRepository _catalogs;
  final SyncMetadataRepository _metadata;
  final CatalogRemoteDataSource _catalogRemote;
  final ExpenseRemoteDataSource _expenseRemote;
  final SyncRemoteDataSource _syncRemote;
  final SyncLock _lock;
  final Clock _clock;

  /// Current month + the two previous calendar months.
  DateRange get syncWindow => DateRange.syncWindow(_clock());

  /// Normal sync: upload pending/failed expenses in batches, then refresh the
  /// expense window. Failed uploads stay local for retry; a failed refresh
  /// keeps the previous local data.
  Future<SyncReport> normalSync({SyncProgressCallback? onProgress}) => _lock.run(() async {
        await _recordAttempt();
        final upload = await _uploadPending(onProgress);

        var refreshed = 0;
        String? refreshError;
        if (upload.connectivityError != null) {
          refreshError = upload.connectivityError;
        } else {
          try {
            final window = syncWindow;
            onProgress?.call(const SyncProgress(SyncPhase.downloadingExpenses));
            final remote = await _expenseRemote.fetchRange(window,
                onProgress: (page, pages) =>
                    onProgress?.call(SyncProgress(SyncPhase.downloadingExpenses, current: page, total: pages)));
            onProgress?.call(const SyncProgress(SyncPhase.saving));
            await _expenses.reconcileRemote(remote, window: window);
            refreshed = remote.length;
          } on AppException catch (e) {
            debugPrint('[SyncService] refresh failed: $e');
            refreshError = e.message;
          }
        }

        final report = SyncReport(
          kind: SyncKind.normal,
          completedAt: _clock(),
          uploaded: upload.uploaded,
          alreadyOnServer: upload.alreadyOnServer,
          failedUploads: upload.failed,
          refreshed: refreshed,
          uploadError: upload.connectivityError,
          refreshError: refreshError,
        );
        await _recordOutcome(report);
        return report;
      });

  /// Full (or initial) sync: upload pending expenses first, then download all
  /// catalogs and the complete expense window, and replace the local remote
  /// dataset in one transaction only after every request succeeded.
  ///
  /// Throws an [AppException] when the download fails; the existing offline
  /// dataset is left untouched in that case.
  Future<SyncReport> fullSync({SyncProgressCallback? onProgress, bool initial = false}) => _lock.run(() async {
        final kind = initial ? SyncKind.initial : SyncKind.full;
        await _recordAttempt();
        final upload = await _uploadPending(onProgress);
        try {
          if (upload.connectivityError != null) {
            throw ApiException(ApiErrorKind.noNetwork, upload.connectivityError!);
          }

          onProgress?.call(const SyncProgress(SyncPhase.downloadingCatalogs));
          final snapshot = await _catalogRemote.fetchSnapshot();
          try {
            snapshot.validate();
          } on FormatException catch (e) {
            throw ApiException.invalidResponse('Invalid catalogs: ${e.message}');
          }

          final window = syncWindow;
          onProgress?.call(const SyncProgress(SyncPhase.downloadingExpenses));
          final remote = await _expenseRemote.fetchRange(window,
              onProgress: (page, pages) =>
                  onProgress?.call(SyncProgress(SyncPhase.downloadingExpenses, current: page, total: pages)));

          onProgress?.call(const SyncProgress(SyncPhase.saving));
          final now = _clock().toIso8601String();
          await _guardDatabase(() => _db.transaction(() async {
                await _catalogs.replaceAll(snapshot);
                await _expenses.reconcileRemote(remote);
                await _metadata.writeValue(SyncMetadataRepository.lastCatalogSyncKey, now);
                await _metadata.writeValue(SyncMetadataRepository.lastFullSyncKey, now);
              }));

          final report = SyncReport(
            kind: kind,
            completedAt: _clock(),
            uploaded: upload.uploaded,
            alreadyOnServer: upload.alreadyOnServer,
            failedUploads: upload.failed,
            refreshed: remote.length,
            catalogsRefreshed: true,
          );
          await _recordOutcome(report);
          return report;
        } on AppException catch (e) {
          await _metadata.write({SyncMetadataRepository.lastErrorKey: '${kind.label} failed: ${e.message}'});
          rethrow;
        }
      });

  // ------------------------------------------------------------------ upload

  Future<_UploadOutcome> _uploadPending(SyncProgressCallback? onProgress) async {
    final pending = await _expenses.pendingUploads();
    final outcome = _UploadOutcome();
    if (pending.isEmpty) return outcome;

    var processed = 0;
    onProgress?.call(SyncProgress(SyncPhase.uploading, current: 0, total: pending.length));
    for (var start = 0; start < pending.length; start += syncBatchSize) {
      final batch = pending.sublist(start, (start + syncBatchSize).clamp(0, pending.length));
      try {
        await _uploadBatch(batch, outcome, isolateOnBatchFailure: true);
      } on ApiException catch (e) {
        // Items of this batch may already be synced (when it was being retried
        // item by item); only the ones still without a remote id fail.
        final unsynced = <int, String>{};
        for (final x in batch) {
          if ((await _expenses.findById(x.id))?.remoteId == null) unsynced[x.id] = e.message;
        }
        await _expenses.markFailed(unsynced);
        outcome.failed += unsynced.length;
        if (e.isConnectivityFailure) {
          // The server is unreachable: stop; the remaining rows keep their state.
          outcome.connectivityError = e.message;
          break;
        }
      }
      processed += batch.length;
      onProgress?.call(SyncProgress(SyncPhase.uploading, current: processed, total: pending.length));
    }
    return outcome;
  }

  /// Uploads one batch and applies the per-item results. When the server
  /// rolled back the whole batch, each item is retried alone so one bad
  /// expense cannot block the others forever. Retrying is safe because the
  /// endpoint is idempotent on `syncKey`.
  Future<void> _uploadBatch(List<Expense> batch, _UploadOutcome outcome, {required bool isolateOnBatchFailure}) async {
    final results = await _syncRemote.uploadBatch(batch.map(_toUploadItem).toList());
    final byKey = {for (final r in results) if (r.syncKey != null) r.syncKey!: r};

    final rolledBack = batch.length > 1 && results.isNotEmpty && results.every((r) => !r.success) &&
        results.any((r) => r.isBatchFailure);
    if (rolledBack && isolateOnBatchFailure) {
      for (final expense in batch) {
        await _uploadBatch([expense], outcome, isolateOnBatchFailure: false);
      }
      return;
    }

    final failures = <int, String>{};
    for (var i = 0; i < batch.length; i++) {
      final expense = batch[i];
      final result = byKey[expense.syncKey] ?? (results.length == batch.length ? results[i] : null);
      if (result == null) {
        failures[expense.id] = 'Ledger did not return a result for this expense.';
      } else if (result.success && result.remoteId != null) {
        await _expenses.markSynced(expense.id, result.remoteId!);
        outcome.uploaded++;
        if (result.alreadySynced) outcome.alreadyOnServer++;
      } else {
        failures[expense.id] = describeUploadFailure(result);
      }
    }
    if (failures.isNotEmpty) {
      await _expenses.markFailed(failures);
      outcome.failed += failures.length;
    }
  }

  SyncUploadItem _toUploadItem(Expense e) {
    final key = e.syncKey;
    if (key == null) {
      // Cannot happen for locally created rows; guard against corrupt data.
      throw const DataUnavailableException('A local expense is missing its synchronization key.');
    }
    return SyncUploadItem(
      syncKey: key,
      walletId: e.walletId,
      expenseTypeId: e.expenseTypeId,
      vendorId: e.vendorId,
      description: e.description,
      total: e.total,
      currencyFactor: e.currencyFactor,
      buyDate: e.buyDate,
    );
  }

  /// User-facing reason for a failed item.
  static String describeUploadFailure(SyncUploadResult r) {
    switch (r.databaseErrorCode) {
      case 'ER_NO_REFERENCED_ROW_2':
      case 'ER_NO_REFERENCED_ROW':
        return 'The wallet, vendor or expense type no longer exists in Ledger. Run a full sync and edit the expense.';
      case 'ER_DATA_TOO_LONG':
        return 'A value is too long for Ledger. Edit the expense.';
    }
    if (r.errorCode == 'VALIDATION_ERROR') return 'Ledger rejected the expense: ${r.message ?? 'invalid data'}.';
    final code = r.databaseErrorCode ?? r.errorCode ?? 'unknown';
    return 'Ledger could not save this expense ($code). It will be retried.';
  }

  // ---------------------------------------------------------------- metadata

  Future<void> _recordAttempt() =>
      _metadata.write({SyncMetadataRepository.lastAttemptKey: _clock().toIso8601String()});

  Future<void> _recordOutcome(SyncReport report) => _metadata.write({
        if (!report.hasErrors) SyncMetadataRepository.lastSuccessfulSyncKey: report.completedAt.toIso8601String(),
        SyncMetadataRepository.lastErrorKey: report.hasErrors ? report.summary : null,
      });

  Future<T> _guardDatabase<T>(Future<T> Function() action) async {
    try {
      return await action();
    } on AppException {
      rethrow;
    } on FormatException catch (e) {
      throw ApiException.invalidResponse(e.message);
    } catch (e) {
      throw DatabaseException('Could not save the synchronized data on this device.', technicalDetails: '$e');
    }
  }
}

class _UploadOutcome {
  int uploaded = 0;
  int alreadyOnServer = 0;
  int failed = 0;
  String? connectivityError;
}
