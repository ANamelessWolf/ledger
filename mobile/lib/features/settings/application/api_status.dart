import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import 'connection_tester.dart';

/// Reachability of the Ledger API (not just device connectivity: the API is
/// usually on a LAN, so "has internet" is not the relevant signal).
enum ApiReachability { unconfigured, unknown, online, offline }

class ApiStatus {
  const ApiStatus(this.reachability, {this.message, this.checkedAt});

  final ApiReachability reachability;
  final String? message;
  final DateTime? checkedAt;

  bool get isOffline => reachability == ApiReachability.offline;
}

final connectionTesterProvider = Provider<ConnectionTester>((ref) => const ConnectionTester());

/// Periodically probes the configured API so the UI can show an offline
/// banner. Everything keeps working offline; this is information only.
class ApiStatusNotifier extends Notifier<ApiStatus> {
  static const _interval = Duration(seconds: 60);
  Timer? _timer;
  bool _checking = false;

  @override
  ApiStatus build() {
    final config = ref.watch(apiConfigProvider);
    _timer?.cancel();
    ref.onDispose(() => _timer?.cancel());
    if (config == null) return const ApiStatus(ApiReachability.unconfigured);
    _timer = Timer.periodic(_interval, (_) => check());
    Future.microtask(check);
    return const ApiStatus(ApiReachability.unknown);
  }

  /// Probes the API now.
  Future<void> check() async {
    final config = ref.read(apiConfigProvider);
    if (config == null || _checking) return;
    _checking = true;
    try {
      final result = await ref.read(connectionTesterProvider).test(config);
      if (!ref.mounted) return;
      state = ApiStatus(
        result.isSuccess ? ApiReachability.online : ApiReachability.offline,
        message: result.isSuccess ? null : result.message,
        checkedAt: DateTime.now(),
      );
    } finally {
      _checking = false;
    }
  }

  /// Lets other flows (e.g. a sync) report what they observed.
  void report({required bool reachable, String? message}) {
    if (ref.read(apiConfigProvider) == null) return;
    state = ApiStatus(reachable ? ApiReachability.online : ApiReachability.offline,
        message: message, checkedAt: DateTime.now());
  }
}

final apiStatusProvider = NotifierProvider<ApiStatusNotifier, ApiStatus>(ApiStatusNotifier.new);
