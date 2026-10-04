import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../features/settings/application/api_status.dart';
import 'router/app_shell.dart';
import 'theme/app_theme.dart';

/// Root widget.
class LedgerApp extends ConsumerStatefulWidget {
  const LedgerApp({super.key});

  @override
  ConsumerState<LedgerApp> createState() => _LedgerAppState();
}

class _LedgerAppState extends ConsumerState<LedgerApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Re-probe the API when the app comes back to the foreground.
    if (state == AppLifecycleState.resumed) ref.read(apiStatusProvider.notifier).check();
  }

  @override
  Widget build(BuildContext context) {
    // Keep the reachability monitor alive for the whole app.
    ref.watch(apiStatusProvider);
    return MaterialApp(
      title: 'Ledger',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      darkTheme: buildAppTheme(),
      themeMode: ThemeMode.dark,
      home: const AppShell(),
    );
  }
}
