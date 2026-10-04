import 'package:flutter_test/flutter_test.dart';
import 'package:ledger_mobile/features/expenses/application/expense_view_mapper.dart';
import 'package:ledger_mobile/features/expenses/domain/currency_conversion_service.dart';
import 'package:ledger_mobile/features/expenses/domain/expense.dart';
import 'package:ledger_mobile/features/expenses/domain/sync_status.dart';

import 'helpers/test_data.dart';

Expense expense({int walletId = 7, double total = 100, double? factor}) => Expense(
      id: 1,
      remoteId: null,
      syncKey: 'k',
      walletId: walletId,
      expenseTypeId: 3,
      vendorId: 40,
      description: 'd',
      total: total,
      currencyFactor: factor,
      buyDate: '2026-10-01',
      sortId: 0,
      syncStatus: SyncStatus.pending,
      syncError: null,
      createdAt: fixedNow(),
      updatedAt: fixedNow(),
    );

void main() {
  const service = CurrencyConversionService();

  group('CurrencyConversionService', () {
    test('default currency: value equals total', () {
      expect(service.normalize(total: 1250, currencyFactor: null, walletCurrencyConversion: 1), 1250);
    });

    test('non-default currency without factor uses the catalog conversion', () {
      expect(service.normalize(total: 100, currencyFactor: null, walletCurrencyConversion: 17.31), closeTo(1731, 1e-9));
    });

    test('expense factor takes precedence over the catalog conversion', () {
      expect(service.normalize(total: 100, currencyFactor: 18.5, walletCurrencyConversion: 17.31), closeTo(1850, 1e-9));
    });

    test('a zero factor is treated as absent (Ledger NULLIF semantics)', () {
      expect(service.normalize(total: 100, currencyFactor: 0, walletCurrencyConversion: 17.31), closeTo(1731, 1e-9));
    });

    test('unknown currency and no factor cannot be converted', () {
      expect(service.normalize(total: 100, currencyFactor: null, walletCurrencyConversion: null), isNull);
    });

    test('a factor still converts when the wallet currency is unknown', () {
      expect(service.normalize(total: 10, currencyFactor: 20, walletCurrencyConversion: null), 200);
    });
  });

  group('ExpenseViewMapper applies the rule through the catalogs', () {
    const mapper = ExpenseViewMapper();
    final catalogs = testCatalogs();

    test('default currency wallet', () {
      final view = mapper.map(expense(walletId: 7, total: 1250), catalogs);
      expect(view.normalizedValue, 1250);
      expect(view.currencySymbol, 'MXN');
    });

    test('USD wallet without factor', () {
      final view = mapper.map(expense(walletId: 24, total: 100), catalogs);
      expect(view.normalizedValue, closeTo(1731, 1e-9));
      expect(view.currencySymbol, 'USD');
    });

    test('USD wallet with factor', () {
      final view = mapper.map(expense(walletId: 24, total: 100, factor: 18.5), catalogs);
      expect(view.normalizedValue, closeTo(1850, 1e-9));
    });

    test('default currency is detected from conversion == 1, not hard-coded', () {
      expect(catalogs.defaultCurrency!.symbol, 'MXN');
    });

    test('unknown wallet is labelled and not converted', () {
      final view = mapper.map(expense(walletId: 999), catalogs);
      expect(view.normalizedValue, isNull);
      expect(view.walletName, contains('Unknown'));
    });
  });
}
