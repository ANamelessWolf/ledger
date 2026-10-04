import 'package:drift/drift.dart';

import '../../../core/database/app_database.dart';

/// Snapshot of persisted synchronization metadata.
class SyncInfo {
  const SyncInfo({
    this.lastSuccessfulSync,
    this.lastFullSync,
    this.lastCatalogSync,
    this.lastAttempt,
    this.lastError,
  });

  /// Last sync (normal or full) that completed without any error.
  final DateTime? lastSuccessfulSync;
  final DateTime? lastFullSync;
  final DateTime? lastCatalogSync;
  final DateTime? lastAttempt;

  /// User-facing message of the last failed/partial sync, cleared on success.
  final String? lastError;
}

/// Key/value synchronization metadata stored in SQLite (`sync_metadata`).
class SyncMetadataRepository {
  SyncMetadataRepository(this._db);

  final AppDatabase _db;

  static const lastSuccessfulSyncKey = 'last_successful_sync';
  static const lastFullSyncKey = 'last_full_sync';
  static const lastCatalogSyncKey = 'last_catalog_sync';
  static const lastAttemptKey = 'last_sync_attempt';
  static const lastErrorKey = 'last_sync_error';

  Stream<SyncInfo> watch() => _db.select(_db.syncMetadata).watch().map(_toInfo);

  Future<SyncInfo> load() async => _toInfo(await _db.select(_db.syncMetadata).get());

  /// Writes several keys in one transaction; a null value deletes the key.
  Future<void> write(Map<String, String?> values) => _db.transaction(() async {
        for (final entry in values.entries) {
          if (entry.value == null) {
            await (_db.delete(_db.syncMetadata)..where((m) => m.key.equals(entry.key))).go();
          } else {
            await _db.into(_db.syncMetadata).insertOnConflictUpdate(
                  SyncMetadataCompanion.insert(key: entry.key, value: entry.value!),
                );
          }
        }
      });

  static SyncInfo _toInfo(List<SyncMetadataRow> rows) {
    final map = {for (final r in rows) r.key: r.value};
    DateTime? date(String key) => map[key] == null ? null : DateTime.tryParse(map[key]!);
    return SyncInfo(
      lastSuccessfulSync: date(lastSuccessfulSyncKey),
      lastFullSync: date(lastFullSyncKey),
      lastCatalogSync: date(lastCatalogSyncKey),
      lastAttempt: date(lastAttemptKey),
      lastError: map[lastErrorKey],
    );
  }

  /// Helper for callers inside an existing transaction.
  Future<void> writeValue(String key, String value) =>
      _db.into(_db.syncMetadata).insertOnConflictUpdate(SyncMetadataCompanion(key: Value(key), value: Value(value)));
}
