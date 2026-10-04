import '../../../core/configuration/app_preferences.dart';
import '../../../core/utilities/iso_date.dart';
import '../domain/expense.dart';

/// Values the New Expense form starts with.
class ExpenseFormInitialValues {
  const ExpenseFormInitialValues({required this.buyDate, this.walletId});

  /// Last used wallet (implies wallet group and currency), if remembered.
  final int? walletId;

  /// Last used date if remembered, otherwise today (`YYYY-MM-DD`).
  final String buyDate;
}

/// Remembers the wallet, currency and date of the last created expense so the
/// next one (usually same account, same day) needs fewer taps. Can be turned
/// off in Settings; stored in shared preferences.
class ExpenseFormDefaults {
  const ExpenseFormDefaults(this._prefs);

  final AppPreferences _prefs;

  bool get enabled => _prefs.rememberLastExpenseSelection;

  ExpenseFormInitialValues initialValues(DateTime today) {
    final todayIso = IsoDate.format(today);
    if (!enabled) return ExpenseFormInitialValues(buyDate: todayIso);
    final lastDate = _prefs.lastExpenseDate;
    return ExpenseFormInitialValues(
      walletId: _prefs.lastExpenseWalletId,
      buyDate: lastDate != null && IsoDate.isValid(lastDate) ? lastDate : todayIso,
    );
  }

  /// Stores the selection of a newly created expense.
  Future<void> remember(Expense expense) async {
    if (!enabled) return;
    await _prefs.setLastExpense(walletId: expense.walletId, buyDate: expense.buyDate);
  }

  /// Turns the feature on/off; turning it off forgets the stored selection.
  Future<void> setEnabled(bool value) async {
    await _prefs.setRememberLastExpenseSelection(value);
    if (!value) await _prefs.clearLastExpense();
  }
}
