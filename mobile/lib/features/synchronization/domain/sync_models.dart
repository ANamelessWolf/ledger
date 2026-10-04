/// Kind of synchronization.
enum SyncKind {
  /// First download after configuring the API (catalogs + expense window).
  initial,

  /// Upload pending expenses, then refresh the expense window.
  normal,

  /// Upload pending expenses, refresh catalogs and replace the expense dataset.
  full;

  String get label => switch (this) {
        SyncKind.initial => 'Initial synchronization',
        SyncKind.normal => 'Synchronization',
        SyncKind.full => 'Full synchronization',
      };
}

/// Step currently executing.
enum SyncPhase {
  uploading('Uploading local expenses'),
  downloadingCatalogs('Downloading catalogs'),
  downloadingExpenses('Refreshing expenses'),
  saving('Saving to device');

  const SyncPhase(this.label);
  final String label;
}

/// Progress update. [current]/[total] are items for uploads and pages for downloads.
class SyncProgress {
  const SyncProgress(this.phase, {this.current = 0, this.total = 0});

  final SyncPhase phase;
  final int current;
  final int total;

  /// 0..1 when measurable.
  double? get fraction => total <= 0 ? null : (current / total).clamp(0, 1).toDouble();

  String get detail => switch (phase) {
        SyncPhase.uploading => '$current / $total',
        SyncPhase.downloadingExpenses => total > 0 ? 'Page $current / $total' : '',
        _ => '',
      };
}

typedef SyncProgressCallback = void Function(SyncProgress progress);

/// Result of a synchronization run.
class SyncReport {
  const SyncReport({
    required this.kind,
    required this.completedAt,
    this.uploaded = 0,
    this.alreadyOnServer = 0,
    this.failedUploads = 0,
    this.refreshed = 0,
    this.catalogsRefreshed = false,
    this.uploadError,
    this.refreshError,
  });

  final SyncKind kind;
  final DateTime completedAt;

  /// Expenses confirmed by Ledger in this run (including [alreadyOnServer]).
  final int uploaded;

  /// Of [uploaded], expenses Ledger already had from an earlier interrupted attempt.
  final int alreadyOnServer;
  final int failedUploads;

  /// Remote expenses downloaded and reconciled (0 if the refresh failed).
  final int refreshed;
  final bool catalogsRefreshed;

  /// Connectivity error that stopped uploading.
  final String? uploadError;

  /// Error that prevented the refresh; the previous local data was kept.
  final String? refreshError;

  bool get hasErrors => failedUploads > 0 || uploadError != null || refreshError != null;

  int get errorCount => failedUploads + (refreshError != null ? 1 : 0) + (uploadError != null && failedUploads == 0 ? 1 : 0);

  /// One-line summary for snackbars and metadata.
  String get summary {
    if (!hasErrors) return '${kind.label} complete';
    final parts = <String>[
      if (failedUploads > 0) '$failedUploads expense${failedUploads == 1 ? '' : 's'} failed to upload',
      if (refreshError != null) 'refresh failed: $refreshError',
      if (uploadError != null && refreshError == null) uploadError!,
    ];
    return '${kind.label} completed with errors — ${parts.join('; ')}';
  }
}
