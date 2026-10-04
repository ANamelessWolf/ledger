import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ledger_mobile/app/router/app_shell.dart';
import 'package:ledger_mobile/app/theme/app_theme.dart';
import 'package:ledger_mobile/core/providers.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'helpers/test_data.dart';

void main() {
  testWidgets('first launch opens Home with the setup state and the bottom navigation', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    final db = openTestDatabase();

    await tester.pumpWidget(ProviderScope(
      retry: (_, _) => null,
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
        databaseProvider.overrideWithValue(db),
        clockProvider.overrideWithValue(fixedNow),
      ],
      child: MaterialApp(theme: buildAppTheme(), home: const AppShell()),
    ));
    await tester.pump();

    expect(find.text('Connect to Ledger'), findsOneWidget);
    expect(find.text('Ledger needs to be connected before your data can be synchronized.'), findsOneWidget);
    expect(find.text('Configure API'), findsOneWidget);
    expect(find.byType(NavigationBar), findsOneWidget);
    final nav = tester.widget<NavigationBar>(find.byType(NavigationBar));
    expect(nav.selectedIndex, AppTab.home.index);

    // Unmount first so drift's stream queries are cancelled, then close.
    await tester.pumpWidget(const SizedBox());
    final closing = db.close();
    await tester.pump(const Duration(seconds: 1));
    await closing;
  });
}
