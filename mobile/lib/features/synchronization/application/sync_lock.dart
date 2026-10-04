import '../../../core/errors/app_exception.dart';

/// Serializes synchronization runs: only one may execute at a time.
class SyncLock {
  bool _busy = false;

  bool get isBusy => _busy;

  /// Runs [action] while holding the lock. Throws [SyncInProgressException]
  /// immediately if another run holds it.
  Future<T> run<T>(Future<T> Function() action) async {
    if (_busy) throw const SyncInProgressException();
    _busy = true;
    try {
      return await action();
    } finally {
      _busy = false;
    }
  }
}
