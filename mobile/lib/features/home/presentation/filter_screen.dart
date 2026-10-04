import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_theme.dart';
import '../../../core/formatting/formatters.dart';
import '../../../core/providers.dart';
import '../../../core/utilities/iso_date.dart';
import '../../../shared/widgets/category_icon.dart';
import '../../../shared/widgets/picker_sheet.dart';
import '../../catalogs/catalog_providers.dart';
import '../../catalogs/domain/catalog_models.dart';
import '../../expenses/domain/expense_filter.dart';
import '../home_providers.dart';

/// Dedicated filter screen. Edits a local copy; nothing changes until Apply.
/// Filtering runs against SQLite only — no API request.
class FilterScreen extends ConsumerStatefulWidget {
  const FilterScreen({super.key});

  static Route<void> route() => MaterialPageRoute(builder: (_) => const FilterScreen(), fullscreenDialog: true);

  @override
  ConsumerState<FilterScreen> createState() => _FilterScreenState();
}

class _FilterScreenState extends ConsumerState<FilterScreen> {
  late ExpenseFilter _draft = ref.read(expenseFilterProvider);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final catalogs = ref.watch(catalogsProvider).value ?? Catalogs.empty;
    final now = ref.watch(clockProvider)();
    final window = DateRange.syncWindow(now);
    final invalidRange = _draft.range.start.compareTo(_draft.range.end) > 0;

    final presets = <String, DateRange>{
      'Today': DateRange.day(now),
      'This month': DateRange.month(now),
      'Last month': DateRange.month(DateTime(now.year, now.month - 1, 1)),
      'Last 3 months': window,
    };

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(tooltip: 'Cancel', icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(context)),
        title: const Text('Filters'),
        actions: [
          TextButton(
            onPressed: () => setState(() => _draft = ExpenseFilter.currentMonth(now)),
            child: const Text('Reset'),
          ),
          const SizedBox(width: Spacing.sm),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(Spacing.lg),
        children: [
          Text('Period', style: theme.textTheme.titleMedium),
          const SizedBox(height: Spacing.md),
          Wrap(
            spacing: Spacing.sm,
            runSpacing: Spacing.sm,
            children: [
              for (final entry in presets.entries)
                ChoiceChip(
                  label: Text(entry.key),
                  selected: _draft.range == entry.value,
                  onSelected: (_) => setState(() => _draft = _draft.copyWith(range: entry.value)),
                ),
            ],
          ),
          const SizedBox(height: Spacing.lg),
          Row(
            children: [
              Expanded(child: _dateField('Start date', _draft.range.start, (d) => _draft.copyWith(range: DateRange(d, _draft.range.end)))),
              const SizedBox(width: Spacing.md),
              Expanded(child: _dateField('End date', _draft.range.end, (d) => _draft.copyWith(range: DateRange(_draft.range.start, d)))),
            ],
          ),
          if (invalidRange)
            const Padding(
              padding: EdgeInsets.only(top: Spacing.sm),
              child: Text('The start date must be before the end date.', style: TextStyle(color: AppColors.error)),
            ),
          Padding(
            padding: const EdgeInsets.only(top: Spacing.sm),
            child: Text(
              'Synchronized data on this device covers ${Formatters.date(window.start)} – ${Formatters.date(window.end)}.',
              style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
            ),
          ),
          const SizedBox(height: Spacing.xl),
          Text('Sort expenses by', style: theme.textTheme.titleMedium),
          const SizedBox(height: Spacing.md),
          SizedBox(
            width: double.infinity,
            child: SegmentedButton<ExpenseSortField>(
              segments: const [
                ButtonSegment(value: ExpenseSortField.date, label: Text('Date'), icon: Icon(Icons.event_rounded)),
                ButtonSegment(value: ExpenseSortField.amount, label: Text('Total'), icon: Icon(Icons.payments_rounded)),
              ],
              selected: {_draft.sort.field},
              onSelectionChanged: (s) => setState(() => _draft = _draft.copyWith(sort: _draft.sort.copyWith(field: s.first))),
            ),
          ),
          const SizedBox(height: Spacing.sm),
          SizedBox(
            width: double.infinity,
            child: SegmentedButton<bool>(
              segments: const [
                ButtonSegment(value: true, label: Text('Descending'), icon: Icon(Icons.arrow_downward_rounded)),
                ButtonSegment(value: false, label: Text('Ascending'), icon: Icon(Icons.arrow_upward_rounded)),
              ],
              selected: {_draft.sort.descending},
              onSelectionChanged: (s) =>
                  setState(() => _draft = _draft.copyWith(sort: _draft.sort.copyWith(descending: s.first))),
            ),
          ),
          if (_draft.sort.field == ExpenseSortField.amount)
            Padding(
              padding: const EdgeInsets.only(top: Spacing.sm),
              child: Text(
                'Totals are compared in the default currency, so expenses in different currencies sort correctly.',
                style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
              ),
            ),
          const SizedBox(height: Spacing.xl),
          Text('Criteria', style: theme.textTheme.titleMedium),
          const SizedBox(height: Spacing.md),
          PickerField(
            label: 'Wallet',
            icon: Icons.account_balance_wallet_rounded,
            value: _draft.walletId == null ? 'All wallets' : catalogs.wallets[_draft.walletId]?.name ?? 'Unknown wallet',
            onTap: () async {
              final options = catalogs.walletOptions();
              final result = await showPickerSheet<int>(
                context: context,
                title: 'Wallet',
                selected: _draft.walletId,
                clearLabel: 'All wallets',
                options: [
                  for (final o in options)
                    PickerOption(value: o.wallet.id, label: o.wallet.name, subtitle: o.currency?.symbol, group: o.groupLabel),
                ],
              );
              if (result != null) setState(() => _draft = _draft.copyWith(walletId: () => result.value));
            },
          ),
          const SizedBox(height: Spacing.md),
          PickerField(
            label: 'Vendor',
            icon: Icons.storefront_rounded,
            value: _draft.vendorId == null ? 'All vendors' : catalogs.vendor(_draft.vendorId!)?.name ?? 'Unknown vendor',
            onTap: () async {
              final result = await showPickerSheet<int>(
                context: context,
                title: 'Vendor',
                selected: _draft.vendorId,
                clearLabel: 'All vendors',
                options: [for (final v in catalogs.vendors) PickerOption(value: v.id, label: v.name)],
              );
              if (result != null) setState(() => _draft = _draft.copyWith(vendorId: () => result.value));
            },
          ),
          const SizedBox(height: Spacing.md),
          PickerField(
            label: 'Expense type',
            icon: Icons.category_rounded,
            value: _draft.expenseTypeId == null
                ? 'All expense types'
                : catalogs.expenseType(_draft.expenseTypeId!)?.name ?? 'Unknown type',
            onTap: () async {
              final result = await showPickerSheet<int>(
                context: context,
                title: 'Expense type',
                selected: _draft.expenseTypeId,
                clearLabel: 'All expense types',
                options: [
                  for (final t in catalogs.expenseTypes)
                    PickerOption(value: t.id, label: t.name, leading: CategoryAvatar(iconName: t.icon, size: 36)),
                ],
              );
              if (result != null) setState(() => _draft = _draft.copyWith(expenseTypeId: () => result.value));
            },
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(Spacing.lg, Spacing.sm, Spacing.lg, Spacing.lg),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
              ),
              const SizedBox(width: Spacing.md),
              Expanded(
                flex: 2,
                child: FilledButton(
                  onPressed: invalidRange
                      ? null
                      : () {
                          ref.read(expenseFilterProvider.notifier).apply(_draft);
                          Navigator.pop(context);
                        },
                  child: const Text('Apply'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _dateField(String label, String value, ExpenseFilter Function(String) update) {
    return PickerField(
      label: label,
      value: Formatters.date(value),
      showChevron: false,
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: IsoDate.parse(value),
          firstDate: DateTime(2000),
          lastDate: DateTime(2100),
        );
        if (picked != null) setState(() => _draft = update(IsoDate.format(picked)));
      },
    );
  }
}
