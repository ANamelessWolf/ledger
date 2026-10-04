import 'package:shared_preferences/shared_preferences.dart';

import 'api_config.dart';

/// Non-secret application preferences.
///
/// The API URL is not sensitive, so it lives in shared preferences. If the
/// backend ever adds authentication, credentials must go to Android
/// Keystore-backed secure storage, never here or in SQLite.
class AppPreferences {
  AppPreferences(this._prefs);

  final SharedPreferences _prefs;

  static const _apiBaseUrlKey = 'api_base_url';
  static const _initialSetupCompletedKey = 'initial_setup_completed';

  /// The configured API, or null before the first setup.
  ApiConfig? get apiConfig => ApiConfig.tryParseBaseUrl(_prefs.getString(_apiBaseUrlKey));

  Future<void> setApiConfig(ApiConfig config) => _prefs.setString(_apiBaseUrlKey, config.baseUrl);

  /// True once the initial synchronization completed successfully.
  bool get initialSetupCompleted => _prefs.getBool(_initialSetupCompletedKey) ?? false;

  Future<void> setInitialSetupCompleted(bool value) =>
      _prefs.setBool(_initialSetupCompletedKey, value);
}
