import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'configuration/api_config.dart';
import 'configuration/app_preferences.dart';
import 'database/app_database.dart';
import 'network/api_client.dart';
import 'utilities/clock.dart';

/// Overridden in `bootstrap.dart` with the loaded instance.
final sharedPreferencesProvider = Provider<SharedPreferences>(
  (ref) => throw UnimplementedError('sharedPreferencesProvider must be overridden'),
);

/// Overridden in `bootstrap.dart` (and with an in-memory database in tests).
final databaseProvider = Provider<AppDatabase>(
  (ref) => throw UnimplementedError('databaseProvider must be overridden'),
);

final clockProvider = Provider<Clock>((ref) => systemClock);

final appPreferencesProvider = Provider<AppPreferences>(
  (ref) => AppPreferences(ref.watch(sharedPreferencesProvider)),
);

/// The configured API (null until the first setup).
class ApiConfigNotifier extends Notifier<ApiConfig?> {
  @override
  ApiConfig? build() => ref.watch(appPreferencesProvider).apiConfig;

  Future<void> save(ApiConfig config) async {
    await ref.read(appPreferencesProvider).setApiConfig(config);
    state = config;
  }
}

final apiConfigProvider = NotifierProvider<ApiConfigNotifier, ApiConfig?>(ApiConfigNotifier.new);

/// Whether the initial synchronization has completed.
class InitialSetupNotifier extends Notifier<bool> {
  @override
  bool build() => ref.watch(appPreferencesProvider).initialSetupCompleted;

  Future<void> markCompleted() async {
    await ref.read(appPreferencesProvider).setInitialSetupCompleted(true);
    state = true;
  }
}

final initialSetupProvider = NotifierProvider<InitialSetupNotifier, bool>(InitialSetupNotifier.new);

/// HTTP client for the configured API; null while unconfigured.
final apiClientProvider = Provider<ApiClient?>((ref) {
  final config = ref.watch(apiConfigProvider);
  return config == null ? null : ApiClient(baseUrl: config.baseUrl);
});
