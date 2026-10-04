import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/expenses/presentation/expense_form_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/synchronization/presentation/sync_screen.dart';
import '../../features/synchronization/sync_providers.dart';

/// Bottom navigation destinations, in display order.
enum AppTab { newExpense, home, sync }

/// Currently selected tab; Home is the default after startup.
class AppTabNotifier extends Notifier<AppTab> {
  @override
  AppTab build() => AppTab.home;

  void select(AppTab tab) => state = tab;
}

final appTabProvider = NotifierProvider<AppTabNotifier, AppTab>(AppTabNotifier.new);

/// Incremented after each save so the New Expense tab starts from a blank form.
class NewExpenseFormGeneration extends Notifier<int> {
  @override
  int build() => 0;

  void next() => state++;
}

final newExpenseFormGenerationProvider = NotifierProvider<NewExpenseFormGeneration, int>(NewExpenseFormGeneration.new);

/// Root scaffold with the fixed Material 3 navigation bar.
class AppShell extends ConsumerWidget {
  const AppShell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tab = ref.watch(appTabProvider);
    final generation = ref.watch(newExpenseFormGenerationProvider);
    final pendingUploads = ref.watch(syncCountsProvider).value?.total ?? 0;
    final syncing = ref.watch(syncControllerProvider.select((s) => s.running));

    return PopScope(
      canPop: tab == AppTab.home,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) ref.read(appTabProvider.notifier).select(AppTab.home);
      },
      child: Scaffold(
        body: IndexedStack(
          index: tab.index,
          children: [
            ExpenseFormScreen(
              key: ValueKey('new-expense-$generation'),
              embedded: true,
              onFinished: () {
                ref.read(newExpenseFormGenerationProvider.notifier).next();
                ref.read(appTabProvider.notifier).select(AppTab.home);
              },
            ),
            const HomeScreen(),
            const SyncScreen(),
          ],
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: tab.index,
          onDestinationSelected: (i) => ref.read(appTabProvider.notifier).select(AppTab.values[i]),
          destinations: [
            const NavigationDestination(
              icon: Icon(Icons.add_circle_outline_rounded),
              selectedIcon: Icon(Icons.add_circle_rounded),
              label: 'New Expense',
            ),
            const NavigationDestination(
              icon: Icon(Icons.space_dashboard_outlined),
              selectedIcon: Icon(Icons.space_dashboard_rounded),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Badge(
                isLabelVisible: pendingUploads > 0 && !syncing,
                label: Text('$pendingUploads'),
                child: Icon(syncing ? Icons.sync_rounded : Icons.cloud_sync_outlined),
              ),
              selectedIcon: Badge(
                isLabelVisible: pendingUploads > 0 && !syncing,
                label: Text('$pendingUploads'),
                child: const Icon(Icons.cloud_sync_rounded),
              ),
              label: 'Sync',
            ),
          ],
        ),
      ),
    );
  }
}
