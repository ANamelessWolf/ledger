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
  static const _rememberLastExpenseKey = 'remember_last_expense_selection';
  static const _lastExpenseWalletIdKey = 'last_expense_wallet_id';
  static const _lastExpenseDateKey = 'last_expense_date';

  /// The configured API, or null before the first setup.
  ApiConfig? get apiConfig => ApiConfig.tryParseBaseUrl(_prefs.getString(_apiBaseUrlKey));

  Future<void> setApiConfig(ApiConfig config) => _prefs.setString(_apiBaseUrlKey, config.baseUrl);

  /// True once the initial synchronization completed successfully.
  bool get initialSetupCompleted => _prefs.getBool(_initialSetupCompletedKey) ?? false;

  Future<void> setInitialSetupCompleted(bool value) =>
      _prefs.setBool(_initialSetupCompletedKey, value);

  /// Whether the New Expense form preselects the last wallet/currency/date
  /// (enabled by default).
  bool get rememberLastExpenseSelection => _prefs.getBool(_rememberLastExpenseKey) ?? true;

  Future<void> setRememberLastExpenseSelection(bool value) => _prefs.setBool(_rememberLastExpenseKey, value);

  /// Wallet of the last saved expense; it also implies the wallet group and
  /// the currency (one currency per wallet).
  int? get lastExpenseWalletId => _prefs.getInt(_lastExpenseWalletIdKey);

  /// `YYYY-MM-DD` of the last saved expense.
  String? get lastExpenseDate => _prefs.getString(_lastExpenseDateKey);

  Future<void> setLastExpense({required int walletId, required String buyDate}) async {
    await _prefs.setInt(_lastExpenseWalletIdKey, walletId);
    await _prefs.setString(_lastExpenseDateKey, buyDate);
  }

  Future<void> clearLastExpense() async {
    await _prefs.remove(_lastExpenseWalletIdKey);
    await _prefs.remove(_lastExpenseDateKey);
  }
}
