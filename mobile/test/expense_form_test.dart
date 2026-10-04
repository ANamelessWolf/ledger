import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ledger_mobile/app/theme/app_theme.dart';
import 'package:ledger_mobile/core/database/app_database.dart';
import 'package:ledger_mobile/core/providers.dart';
import 'package:ledger_mobile/features/catalogs/data/catalog_repository.dart';
import 'package:ledger_mobile/features/expenses/data/expense_repository.dart';
import 'package:ledger_mobile/features/expenses/domain/expense_filter.dart';
import 'package:ledger_mobile/core/utilities/iso_date.dart';
import 'package:ledger_mobile/features/expenses/presentation/expense_form_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'helpers/test_data.dart';

void main() {
  late AppDatabase db;

  Future<void> pumpForm(WidgetTester tester, {Map<String, Object> prefsValues = const {}, bool reuseDb = false}) async {
    tester.view.physicalSize = const Size(1080, 3000);
    tester.view.devicePixelRatio = 2.5;
    addTearDown(tester.view.reset);

    if (!reuseDb) {
      db = openTestDatabase();
      await tester.runAsync(() => CatalogRepository(db).replaceAll(testSnapshot()));
      SharedPreferences.setMockInitialValues(prefsValues);
    }
    final prefs = await SharedPreferences.getInstance();
    await tester.pumpWidget(ProviderScope(
      retry: (_, _) => null,
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
        databaseProvider.overrideWithValue(db),
        clockProvider.overrideWithValue(fixedNow),
      ],
      child: MaterialApp(theme: buildAppTheme(), home: const ExpenseFormScreen(embedded: true)),
    ));
    await settle(tester);
  }

  Future<void> closeDb(WidgetTester tester) async {
    await tester.pumpWidget(const SizedBox());
    final closing = db.close();
    await tester.pump(const Duration(seconds: 1));
    await closing;
  }

  Future<void> pick(WidgetTester tester, String field, String option) async {
    await tester.tap(find.text(field));
    await settle(tester);
    await tester.tap(find.text(option).last);
    await settle(tester);
  }

  testWidgets('wallet lists groups; currency defaults to MXN and can switch to USD', (tester) async {
    await pumpForm(tester);

    await tester.tap(find.text('Wallet *'));
    await settle(tester);
    expect(find.text('AMEX Platinum'), findsOneWidget);
    expect(find.text('AMEX Platinum USD'), findsNothing, reason: 'individual wallets are not listed');
    await tester.tap(find.text('AMEX Platinum'));
    await settle(tester);

    expect(find.text('MXN · Peso Mexicano'), findsOneWidget);
    expect(find.text('Currency factor (optional)'), findsNothing);

    await pick(tester, 'MXN · Peso Mexicano', 'USD');
    expect(find.text('USD · Dólar'), findsOneWidget);
    expect(find.text('Currency factor (optional)'), findsOneWidget);

    // Switching to a group without USD falls back to its default currency.
    await pick(tester, 'AMEX Platinum', 'Santander');
    expect(find.text('MXN · Peso Mexicano'), findsOneWidget);
    expect(find.text('Currency factor (optional)'), findsNothing);

    await closeDb(tester);
  });

  testWidgets('saving sends the wallet of the selected group and currency', (tester) async {
    await pumpForm(tester);

    await pick(tester, 'Wallet *', 'AMEX Platinum');
    await pick(tester, 'MXN · Peso Mexicano', 'USD');
    await tester.enterText(find.widgetWithText(TextField, 'Total *'), '100');
    await tester.enterText(find.widgetWithText(TextField, 'Currency factor (optional)'), '18.5');
    await pick(tester, 'Expense type *', 'Food');
    await pick(tester, 'Vendor *', 'Google');
    await tester.enterText(find.widgetWithText(TextField, 'Description *'), 'Dinner');
    await tester.tap(find.text('Save'));
    await settle(tester);

    final saved = await tester.runAsync(() => ExpenseRepository(db)
        .getFiltered(ExpenseFilter(range: const DateRange('2000-01-01', '2100-01-01'))));
    expect(saved, hasLength(1));
    expect(saved!.single.walletId, 24, reason: 'AMEX Platinum + USD → wallet 24');
    expect(saved.single.currencyFactor, 18.5);

    // The next New Expense form starts with the same group, currency and date.
    await tester.pumpWidget(const SizedBox());
    await pumpForm(tester, reuseDb: true);
    expect(find.text('AMEX Platinum'), findsOneWidget);
    expect(find.text('USD · Dólar'), findsOneWidget);
    expect(find.text('Saturday, October 3, 2026'), findsOneWidget);
    expect(find.text('Dinner'), findsNothing, reason: 'only wallet, currency and date are remembered');

    await closeDb(tester);
  });

  testWidgets('remembered date and wallet are preselected', (tester) async {
    await pumpForm(tester, prefsValues: {'last_expense_wallet_id': 24, 'last_expense_date': '2026-09-15'});
    expect(find.text('AMEX Platinum'), findsOneWidget);
    expect(find.text('USD · Dólar'), findsOneWidget);
    expect(find.text('Tuesday, September 15, 2026'), findsOneWidget);
    await closeDb(tester);
  });

  testWidgets('a remembered wallet that no longer exists is ignored', (tester) async {
    await pumpForm(tester, prefsValues: {'last_expense_wallet_id': 999, 'last_expense_date': '2026-09-15'});
    expect(find.text('Select a wallet first'), findsOneWidget);
    expect(find.text('Tuesday, September 15, 2026'), findsOneWidget);
    await closeDb(tester);
  });

  testWidgets('nothing is preselected when the setting is off', (tester) async {
    await pumpForm(tester, prefsValues: {
      'remember_last_expense_selection': false,
      'last_expense_wallet_id': 24,
      'last_expense_date': '2026-09-15',
    });
    expect(find.text('Select a wallet first'), findsOneWidget);
    expect(find.text('Saturday, October 3, 2026'), findsOneWidget, reason: 'defaults to today');
    await closeDb(tester);
  });
}

/// Pumps frames and lets real async work (SQLite) complete.
Future<void> settle(WidgetTester tester) async {
  for (var i = 0; i < 6; i++) {
    await tester.runAsync(() => Future<void>.delayed(const Duration(milliseconds: 20)));
    await tester.pump(const Duration(milliseconds: 250));
  }
}
