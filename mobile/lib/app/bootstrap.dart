import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/database/app_database.dart';
import '../core/providers.dart';
import 'app.dart';

/// Initializes platform dependencies and starts the app with them injected.
Future<void> bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting();
  final prefs = await SharedPreferences.getInstance();
  final database = AppDatabase.open();

  runApp(ProviderScope(
    // Failed providers surface their error instead of retrying silently.
    retry: (_, _) => null,
    overrides: [
      sharedPreferencesProvider.overrideWithValue(prefs),
      databaseProvider.overrideWithValue(database),
    ],
    child: const LedgerApp(),
  ));
}
