import '../../catalogs/domain/catalog_models.dart';
import '../domain/currency_conversion_service.dart';
import '../domain/expense.dart';

/// Joins expenses with cached catalogs and normalizes their value through
/// [CurrencyConversionService]. Every screen and dashboard uses this mapper,
/// so names, wallet-group mapping and conversion are identical everywhere.
class ExpenseViewMapper {
  const ExpenseViewMapper({this.conversion = const CurrencyConversionService()});

  final CurrencyConversionService conversion;

  static const unknownLabel = 'Unknown';

  ExpenseView map(Expense e, Catalogs catalogs) {
    final wallet = catalogs.wallets[e.walletId];
    final currency = catalogs.currencyOfWallet(e.walletId);
    final type = catalogs.expenseType(e.expenseTypeId);
    final walletName = wallet?.name ?? '$unknownLabel wallet';
    return ExpenseView(
      expense: e,
      walletName: walletName,
      currencySymbol: currency?.symbol,
      expenseTypeName: type?.name ?? unknownLabel,
      expenseTypeIcon: type?.icon,
      vendorName: catalogs.vendor(e.vendorId)?.name ?? unknownLabel,
      // Same fallback as the web app: the wallet name when it has no group.
      walletGroupName: catalogs.primaryGroupOf(e.walletId)?.name ?? walletName,
      normalizedValue: conversion.normalize(
        total: e.total,
        currencyFactor: e.currencyFactor,
        walletCurrencyConversion: currency?.conversion,
      ),
    );
  }

  List<ExpenseView> mapAll(List<Expense> expenses, Catalogs catalogs) =>
      expenses.map((e) => map(e, catalogs)).toList(growable: false);
}
