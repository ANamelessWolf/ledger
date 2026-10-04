import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/errors/app_exception.dart';
import '../../core/providers.dart';
import '../catalogs/catalog_providers.dart';
import '../catalogs/data/catalog_remote_data_source.dart';
import '../expenses/data/expense_remote_data_source.dart';
import '../expenses/data/expense_repository.dart';
import '../expenses/expense_providers.dart';
import '../settings/application/api_status.dart';
import 'application/sync_lock.dart';
import 'application/sync_service.dart';
import 'data/sync_metadata_repository.dart';
import 'data/sync_remote_data_source.dart';
import 'domain/sync_models.dart';

/// App-wide lock: survives API reconfiguration so two syncs never overlap.
final syncLockProvider = Provider<SyncLock>((ref) => SyncLock());

final syncMetadataRepositoryProvider = Provider<SyncMetadataRepository>(
  (ref) => SyncMetadataRepository(ref.watch(databaseProvider)),
);

final syncInfoProvider = StreamProvider<SyncInfo>((ref) => ref.watch(syncMetadataRepositoryProvider).watch());

final syncCountsProvider = StreamProvider<SyncCounts>((ref) => ref.watch(expenseRepositoryProvider).watchSyncCounts());

/// Sync service bound to the configured API; null while unconfigured.
final syncServiceProvider = Provider<SyncService?>((ref) {
  final client = ref.watch(apiClientProvider);
  if (client == null) return null;
  return SyncService(
    database: ref.watch(databaseProvider),
    expenses: ref.watch(expenseRepositoryProvider),
    catalogs: ref.watch(catalogRepositoryProvider),
    metadata: ref.watch(syncMetadataRepositoryProvider),
    catalogRemote: LedgerCatalogRemoteDataSource(client),
    expenseRemote: LedgerExpenseRemoteDataSource(client),
    syncRemote: LedgerSyncRemoteDataSource(client),
    lock: ref.watch(syncLockProvider),
    clock: ref.watch(clockProvider),
  );
});

/// UI state of the synchronization feature.
class SyncState {
  const SyncState({this.running = false, this.kind, this.progress, this.lastReport, this.error});

  final bool running;
  final SyncKind? kind;
  final SyncProgress? progress;
  final SyncReport? lastReport;

  /// Error of the last run when it could not complete at all.
  final String? error;

  SyncState copyWith({
    bool? running,
    SyncKind? kind,
    SyncProgress? Function()? progress,
    SyncReport? Function()? lastReport,
    String? Function()? error,
  }) =>
      SyncState(
        running: running ?? this.running,
        kind: kind ?? this.kind,
        progress: progress != null ? progress() : this.progress,
        lastReport: lastReport != null ? lastReport() : this.lastReport,
        error: error != null ? error() : this.error,
      );
}

/// Starts synchronizations and exposes their progress.
class SyncController extends Notifier<SyncState> {
  @override
  SyncState build() => const SyncState();

  /// Runs a sync of [kind]. Returns the report, or null when it failed (see
  /// [SyncState.error]) or another sync was already running.
  Future<SyncReport?> run(SyncKind kind) async {
    if (state.running) return null;
    final service = ref.read(syncServiceProvider);
    if (service == null) {
      state = state.copyWith(kind: kind, error: () => ApiException.notConfigured().message);
      return null;
    }
    state = SyncState(running: true, kind: kind, lastReport: state.lastReport);
    void onProgress(SyncProgress p) {
      if (ref.mounted) state = state.copyWith(progress: () => p);
    }

    try {
      final report = switch (kind) {
        SyncKind.normal => await service.normalSync(onProgress: onProgress),
        SyncKind.full => await service.fullSync(onProgress: onProgress),
        SyncKind.initial => await service.fullSync(onProgress: onProgress, initial: true),
      };
      if (kind == SyncKind.initial || kind == SyncKind.full) {
        await ref.read(initialSetupProvider.notifier).markCompleted();
      }
      ref.read(apiStatusProvider.notifier).report(
            reachable: report.uploadError == null,
            message: report.uploadError,
          );
      if (ref.mounted) {
        state = SyncState(kind: kind, lastReport: report);
      }
      return report;
    } on SyncInProgressException catch (e) {
      if (ref.mounted) state = state.copyWith(running: false, progress: () => null, error: () => e.message);
      return null;
    } catch (e) {
      final message = userMessageFor(e);
      if (e is ApiException && e.isConnectivityFailure) {
        ref.read(apiStatusProvider.notifier).report(reachable: false, message: message);
      }
      if (ref.mounted) {
        state = SyncState(kind: kind, lastReport: state.lastReport, error: message);
      }
      return null;
    }
  }

  void clearError() => state = state.copyWith(error: () => null);
}

final syncControllerProvider = NotifierProvider<SyncController, SyncState>(SyncController.new);
