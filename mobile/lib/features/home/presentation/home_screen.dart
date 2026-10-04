import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../app/router/app_drawer.dart';
import '../../../app/router/app_shell.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/formatting/formatters.dart';
import '../../../core/providers.dart';
import '../../../core/utilities/iso_date.dart';
import '../../../shared/widgets/offline_banner.dart';
import '../../../shared/widgets/state_views.dart';
import '../../catalogs/catalog_providers.dart';
import '../../catalogs/domain/catalog_models.dart';
import '../../expenses/domain/expense.dart';
import '../../expenses/domain/expense_filter.dart';
import '../../expenses/presentation/expense_detail_screen.dart';
import '../../expenses/presentation/widgets/expense_tile.dart';
import '../../settings/presentation/api_config_screen.dart';
import '../../synchronization/domain/sync_models.dart';
import '../../synchronization/sync_providers.dart';
import '../domain/dashboard_service.dart';
import '../home_providers.dart';
import 'filter_screen.dart';
import 'widgets/dashboard_section.dart';

/// Home: app bar + drawer, filter summary, dashboard and expense list.
/// Before the API is configured / first synced it shows the setup state.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final configured = ref.watch(apiConfigProvider) != null;
    final setupDone = ref.watch(initialSetupProvider);
    final ready = configured && setupDone;
    final filter = ref.watch(expenseFilterProvider);

    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text('Ledger'),
        actions: [
          if (ready)
            IconButton(
              tooltip: 'Filters',
              onPressed: () => Navigator.of(context).push(FilterScreen.route()),
              icon: Badge(
                isLabelVisible: filter.activeCriteriaCount > 0,
                label: Text('${filter.activeCriteriaCount}'),
                child: const Icon(Icons.tune_rounded),
              ),
            ),
          const SizedBox(width: Spacing.xs),
        ],
      ),
      body: Column(
        children: [
          if (configured) const OfflineBanner(),
          Expanded(child: ready ? const _HomeContent() : _SetupState(configured: configured)),
        ],
      ),
    );
  }
}

class _HomeContent extends ConsumerWidget {
  const _HomeContent();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filter = ref.watch(expenseFilterProvider);
    final catalogs = ref.watch(catalogsProvider).value ?? Catalogs.empty;
    final dashboard = ref.watch(dashboardProvider);
    final expenses = ref.watch(filteredExpensesProvider);
    final currency = catalogs.defaultCurrency?.symbol ?? '';

    void openExpense(ExpenseView view) => Navigator.of(context).push(ExpenseDetailScreen.route(view.expense.id));

    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(syncControllerProvider.notifier).run(SyncKind.normal);
      },
      child: CustomScrollView(
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(Spacing.lg, Spacing.sm, Spacing.lg, 0),
            sliver: SliverToBoxAdapter(child: _FilterBar(filter: filter, catalogs: catalogs)),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(Spacing.lg, Spacing.md, Spacing.lg, 0),
            sliver: SliverToBoxAdapter(
              child: switch (dashboard) {
                AsyncData(:final value) => _Dashboard(
                    data: value,
                    filter: filter,
                    today: ref.watch(clockProvider)(),
                    currency: currency,
                    onExpenseTap: openExpense,
                  ),
                AsyncError(:final error) => ErrorState(
                    message: 'Could not load the dashboard. $error',
                    onRetry: () => ref.invalidate(filteredExpensesProvider),
                  ),
                _ => const DashboardSkeleton(),
              },
            ),
          ),
          ...switch (expenses) {
            AsyncData(:final value) when value.isEmpty => [
                SliverToBoxAdapter(
                  child: EmptyState(
                    icon: Icons.search_off_rounded,
                    title: 'No expenses found',
                    message: 'Try changing your filters or add a new expense.',
                    action: FilledButton.icon(
                      onPressed: () => ref.read(appTabProvider.notifier).select(AppTab.newExpense),
                      icon: const Icon(Icons.add_rounded),
                      label: const Text('New Expense'),
                    ),
                  ),
                ),
              ],
            AsyncData(:final value) => _expenseList(value, filter.sort, currency, openExpense),
            _ => const <Widget>[],
          },
          const SliverToBoxAdapter(child: SizedBox(height: Spacing.xxl)),
        ],
      ),
    );
  }

  List<Widget> _expenseList(
      List<ExpenseView> views, ExpenseSort sort, String currency, void Function(ExpenseView) onTap) {
    // Sorted by date: group under day headers. Sorted by amount: flat list
    // (each row still shows its date).
    final groupByDay = sort.field == ExpenseSortField.date;
    final items = <Object>[];
    String? day;
    for (final v in views) {
      if (groupByDay && v.expense.buyDate != day) {
        day = v.expense.buyDate;
        items.add(day);
      }
      items.add(v);
    }
    return [
      SliverPadding(
        padding: const EdgeInsets.symmetric(horizontal: Spacing.lg),
        sliver: SliverToBoxAdapter(
          child: SectionHeader(
            title: 'Expenses',
            subtitle: '${views.length} in this period · sorted by ${sort.field.label.toLowerCase()}, '
                '${sort.descending ? (sort.field == ExpenseSortField.date ? 'newest' : 'highest') : (sort.field == ExpenseSortField.date ? 'oldest' : 'lowest')} first',
          ),
        ),
      ),
      SliverList.builder(
        itemCount: items.length,
        itemBuilder: (context, i) {
          final item = items[i];
          if (item is String) {
            return Padding(
              padding: const EdgeInsets.fromLTRB(Spacing.xl, Spacing.md, Spacing.xl, Spacing.xs),
              child: Text(Formatters.dayHeader(item).toUpperCase(),
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11.5, fontWeight: FontWeight.w700, letterSpacing: 1)),
            );
          }
          final view = item as ExpenseView;
          return ExpenseTile(view: view, defaultCurrency: currency, onTap: () => onTap(view));
        },
      ),
    ];
  }
}

class _Dashboard extends StatelessWidget {
  const _Dashboard({
    required this.data,
    required this.filter,
    required this.today,
    required this.currency,
    required this.onExpenseTap,
  });

  final DashboardData data;
  final ExpenseFilter filter;
  final DateTime today;
  final String currency;
  final void Function(ExpenseView) onExpenseTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SummaryCard(data: data, periodLabel: _periodLabel(filter.range, today), currency: currency),
        if (data.expenseCount > 0) ...[
          const SectionHeader(title: 'Dashboard', subtitle: 'Normalized to the default currency'),
          DashboardCard(data: data, currency: currency, onExpenseTap: onExpenseTap),
        ],
      ],
    );
  }

  static String _periodLabel(DateRange range, DateTime today) {
    final start = IsoDate.parse(range.start);
    if (range == DateRange.day(today)) return 'Today';
    if (range.start == range.end) return Formatters.date(range.start);
    if (range == DateRange.month(start)) return DateFormat.yMMMM().format(start);
    return 'Custom period';
  }
}

/// Compact summary of the active filter; tapping opens the filter screen.
class _FilterBar extends StatelessWidget {
  const _FilterBar({required this.filter, required this.catalogs});

  final ExpenseFilter filter;
  final Catalogs catalogs;

  @override
  Widget build(BuildContext context) {
    final chips = <String>[
      '${Formatters.date(filter.range.start)} – ${Formatters.date(filter.range.end)}',
      if (filter.walletId != null) catalogs.wallets[filter.walletId]?.name ?? 'Wallet',
      if (filter.vendorId != null) catalogs.vendor(filter.vendorId!)?.name ?? 'Vendor',
      if (filter.expenseTypeId != null) catalogs.expenseType(filter.expenseTypeId!)?.name ?? 'Category',
      if (!filter.sort.isDefault) filter.sort.label,
    ];
    return Material(
      color: AppColors.surfaceContainerLow,
      borderRadius: BorderRadius.circular(Radii.control),
      child: InkWell(
        borderRadius: BorderRadius.circular(Radii.control),
        onTap: () => Navigator.of(context).push(FilterScreen.route()),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: Spacing.md, vertical: Spacing.sm + 2),
          child: Row(
            children: [
              const Icon(Icons.filter_list_rounded, size: 20, color: AppColors.textSecondary),
              const SizedBox(width: Spacing.sm),
              Expanded(
                child: Text(
                  chips.join('  ·  '),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: AppColors.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}

/// First-launch state: connect the API, then run the initial sync.
class _SetupState extends ConsumerWidget {
  const _SetupState({required this.configured});

  final bool configured;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final sync = ref.watch(syncControllerProvider);
    final config = ref.watch(apiConfigProvider);
    final running = sync.running && sync.kind == SyncKind.initial;

    return ListView(
      padding: const EdgeInsets.all(Spacing.xl),
      children: [
        const SizedBox(height: Spacing.xl),
        Center(
          child: Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(gradient: AppColors.heroGradient, borderRadius: BorderRadius.circular(30)),
            child: Icon(configured ? Icons.cloud_download_rounded : Icons.lan_rounded, size: 44, color: Colors.white),
          ),
        ),
        const SizedBox(height: Spacing.xl),
        Text(
          configured ? 'Download your Ledger data' : 'Connect to Ledger',
          textAlign: TextAlign.center,
          style: theme.textTheme.headlineMedium,
        ),
        const SizedBox(height: Spacing.md),
        Text(
          configured
              ? 'The initial synchronization downloads your catalogs and the expenses of the last three months so the app works offline.'
              : 'Ledger needs to be connected before your data can be synchronized.',
          textAlign: TextAlign.center,
          style: theme.textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: Spacing.xxl),
        if (running) ...[
          _InitialSyncProgress(progress: sync.progress),
        ] else ...[
          if (sync.error != null && sync.kind == SyncKind.initial)
            Card(
              color: AppColors.errorContainer.withValues(alpha: 0.5),
              child: Padding(
                padding: const EdgeInsets.all(Spacing.lg),
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Icon(Icons.error_outline_rounded, color: AppColors.error),
                  const SizedBox(width: Spacing.md),
                  Expanded(child: Text(sync.error!)),
                ]),
              ),
            ),
          if (sync.error != null && sync.kind == SyncKind.initial) const SizedBox(height: Spacing.lg),
          if (configured) ...[
            FilledButton.icon(
              onPressed: () => ref.read(syncControllerProvider.notifier).run(SyncKind.initial),
              icon: const Icon(Icons.download_rounded),
              label: const Text('Start initial synchronization'),
            ),
            const SizedBox(height: Spacing.md),
            OutlinedButton.icon(
              onPressed: () => Navigator.of(context).push(ApiConfigScreen.route()),
              icon: const Icon(Icons.edit_rounded),
              label: Text('Change API (${config?.baseUrl ?? ''})'),
            ),
          ] else
            FilledButton.icon(
              onPressed: () => Navigator.of(context).push(ApiConfigScreen.route()),
              icon: const Icon(Icons.settings_ethernet_rounded),
              label: const Text('Configure API'),
            ),
        ],
      ],
    );
  }
}

class _InitialSyncProgress extends StatelessWidget {
  const _InitialSyncProgress({required this.progress});

  final SyncProgress? progress;

  @override
  Widget build(BuildContext context) {
    final p = progress;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(Spacing.xl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Synchronizing…', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: Spacing.sm),
            Text(p == null ? 'Starting' : '${p.phase.label} ${p.detail}',
                style: const TextStyle(color: AppColors.textSecondary)),
            const SizedBox(height: Spacing.lg),
            LinearProgressIndicator(value: p?.fraction, minHeight: 6, borderRadius: BorderRadius.circular(3)),
          ],
        ),
      ),
    );
  }
}
