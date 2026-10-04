import 'sync_status.dart';

/// An expense as stored on the device.
class Expense {
  const Expense({
    required this.id,
    required this.remoteId,
    required this.syncKey,
    required this.walletId,
    required this.expenseTypeId,
    required this.vendorId,
    required this.description,
    required this.total,
    required this.currencyFactor,
    required this.buyDate,
    required this.sortId,
    required this.syncStatus,
    required this.syncError,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Local SQLite id (never the Ledger id).
  final int id;

  /// Ledger id, null until synchronized.
  final int? remoteId;
  final String? syncKey;
  final int walletId;
  final int expenseTypeId;
  final int vendorId;
  final String description;

  /// Amount in the wallet's currency.
  final double total;

  /// Optional expense-specific factor to the default currency.
  final double? currencyFactor;

  /// `YYYY-MM-DD`.
  final String buyDate;
  final int sortId;
  final SyncStatus syncStatus;
  final String? syncError;
  final DateTime createdAt;
  final DateTime updatedAt;

  /// Only expenses that Ledger does not know yet may be edited or deleted on
  /// the device; synchronized ones must be changed in the web app.
  bool get isEditable => remoteId == null;
}

/// An expense joined with the catalog data needed to display it, plus its
/// value normalized to the default currency.
class ExpenseView {
  const ExpenseView({
    required this.expense,
    required this.walletName,
    required this.currencySymbol,
    required this.expenseTypeName,
    required this.expenseTypeIcon,
    required this.vendorName,
    required this.walletGroupName,
    required this.normalizedValue,
  });

  final Expense expense;
  final String walletName;

  /// Original currency of the amount (the wallet currency); null if unknown.
  final String? currencySymbol;
  final String expenseTypeName;
  final String? expenseTypeIcon;
  final String vendorName;

  /// Wallet group used by the "expenses by wallet" dashboard.
  final String walletGroupName;

  /// Value in the default currency; null when it cannot be converted
  /// (unknown wallet currency and no expense-specific factor).
  final double? normalizedValue;
}
