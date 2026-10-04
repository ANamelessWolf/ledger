/// Explicit synchronization state of a local expense. Do not infer it from
/// `remoteId == null` alone.
enum SyncStatus {
  /// Created/edited locally, never uploaded successfully.
  pending('pending'),

  /// The last upload attempt failed; kept for retry.
  failed('failed'),

  /// Acknowledged by Ledger (has a remote id) or downloaded from Ledger.
  synced('synced');

  const SyncStatus(this.value);

  /// Value stored in SQLite.
  final String value;

  static SyncStatus fromValue(String value) =>
      SyncStatus.values.firstWhere((s) => s.value == value, orElse: () => SyncStatus.pending);

  /// True for local rows that still need to be uploaded.
  bool get needsUpload => this != SyncStatus.synced;
}
