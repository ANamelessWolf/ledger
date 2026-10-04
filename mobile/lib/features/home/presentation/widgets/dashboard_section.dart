import 'package:flutter/material.dart';

import '../../../../app/theme/app_theme.dart';
import '../../../../core/formatting/formatters.dart';
import '../../../../shared/widgets/category_icon.dart';
import '../../../../shared/widgets/state_views.dart';
import '../../../expenses/domain/expense.dart';
import '../../domain/dashboard_service.dart';

/// Gradient hero card with the filtered total in the default currency.
class SummaryCard extends StatelessWidget {
  const SummaryCard({super.key, required this.data, required this.periodLabel, required this.currency});

  final DashboardData data;
  final String periodLabel;
  final String currency;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      decoration: BoxDecoration(
        gradient: AppColors.heroGradient,
        borderRadius: BorderRadius.circular(Radii.card + 4),
      ),
      padding: const EdgeInsets.all(Spacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Total spent', style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white70)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: Spacing.sm, vertical: 4),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(Radii.chip)),
                child: Text(periodLabel, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: Spacing.sm),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text.rich(
              TextSpan(children: [
                TextSpan(text: '\$${Formatters.amount(data.total)}'),
                TextSpan(text: ' $currency', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white70)),
              ]),
              style: amountStyle(theme.textTheme.headlineMedium)
                  .copyWith(color: Colors.white, fontSize: 34, fontWeight: FontWeight.w800, letterSpacing: -1),
            ),
          ),
          const SizedBox(height: Spacing.lg),
          Wrap(
            spacing: Spacing.sm,
            runSpacing: Spacing.sm,
            children: [
              _heroChip(Icons.receipt_long_rounded, '${data.expenseCount} expense${data.expenseCount == 1 ? '' : 's'}'),
              if (data.pendingCount > 0) _heroChip(Icons.schedule_rounded, '${data.pendingCount} not synced'),
              if (data.unconvertedCount > 0) _heroChip(Icons.help_outline_rounded, '${data.unconvertedCount} not convertible'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _heroChip(IconData icon, String label) => Container(
        padding: const EdgeInsets.symmetric(horizontal: Spacing.sm + 2, vertical: 6),
        decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.22), borderRadius: BorderRadius.circular(Radii.chip)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w600)),
        ]),
      );
}

/// Dashboard view selector.
enum DashboardView {
  vendors('Top vendors', Icons.storefront_rounded),
  types('Top categories', Icons.category_rounded),
  expenses('Top expenses', Icons.trending_up_rounded),
  wallets('By wallet', Icons.account_balance_wallet_rounded);

  const DashboardView(this.label, this.icon);
  final String label;
  final IconData icon;
}

/// Card hosting the four dashboard widgets behind a chip selector.
class DashboardCard extends StatefulWidget {
  const DashboardCard({super.key, required this.data, required this.currency, required this.onExpenseTap});

  final DashboardData data;
  final String currency;
  final void Function(ExpenseView view) onExpenseTap;

  @override
  State<DashboardCard> createState() => _DashboardCardState();
}

class _DashboardCardState extends State<DashboardCard> {
  DashboardView _view = DashboardView.vendors;
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final d = widget.data;
    final rows = switch (_view) {
      DashboardView.vendors => _ranked(d.topVendors, icon: (_) => Icons.storefront_rounded),
      DashboardView.types => _ranked(d.topExpenseTypes, iconName: (e) => e.icon),
      DashboardView.wallets => _ranked(d.byWalletGroup, icon: (_) => Icons.account_balance_wallet_rounded),
      DashboardView.expenses => _topExpenses(d.topExpenses),
    };
    const collapsedCount = 5;
    final visible = _expanded ? rows : rows.take(collapsedCount).toList();

    return Card(
      child: Padding(
        padding: const EdgeInsets.only(top: Spacing.md, bottom: Spacing.sm),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: Spacing.md),
              child: Row(
                children: [
                  for (final v in DashboardView.values)
                    Padding(
                      padding: const EdgeInsets.only(right: Spacing.sm),
                      child: ChoiceChip(
                        avatar: Icon(v.icon, size: 16, color: v == _view ? AppColors.onPrimary : AppColors.textSecondary),
                        label: Text(v.label),
                        selected: v == _view,
                        showCheckmark: false,
                        selectedColor: AppColors.primary,
                        labelStyle: TextStyle(
                          color: v == _view ? AppColors.onPrimary : AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                        onSelected: (_) => setState(() {
                          _view = v;
                          _expanded = false;
                        }),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: Spacing.sm),
            AnimatedSize(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeOutCubic,
              alignment: Alignment.topCenter,
              child: rows.isEmpty
                  ? const Padding(
                      padding: EdgeInsets.all(Spacing.xl),
                      child: Text('No data for this period', textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondary)),
                    )
                  : Column(children: visible),
            ),
            if (rows.length > collapsedCount)
              TextButton.icon(
                onPressed: () => setState(() => _expanded = !_expanded),
                icon: Icon(_expanded ? Icons.expand_less_rounded : Icons.expand_more_rounded),
                label: Text(_expanded ? 'Show less' : 'Show all ${rows.length}'),
              ),
          ],
        ),
      ),
    );
  }

  List<Widget> _ranked(List<DashboardEntry> entries, {IconData Function(DashboardEntry)? icon, String? Function(DashboardEntry)? iconName}) {
    if (entries.isEmpty) return const [];
    final max = entries.first.value;
    final total = widget.data.total;
    return [
      for (var i = 0; i < entries.length; i++)
        _RankedRow(
          rank: i + 1,
          leading: iconName != null
              ? CategoryAvatar(iconName: iconName(entries[i]), size: 36)
              : _iconAvatar(icon!(entries[i])),
          label: entries[i].label,
          caption: '${entries[i].count} expense${entries[i].count == 1 ? '' : 's'} · ${total == 0 ? 0 : (entries[i].value / total * 100).toStringAsFixed(1)}%',
          value: entries[i].value,
          fraction: max == 0 ? 0 : entries[i].value / max,
          currency: widget.currency,
        ),
    ];
  }

  List<Widget> _topExpenses(List<ExpenseView> views) {
    if (views.isEmpty) return const [];
    final max = views.first.normalizedValue ?? 0;
    return [
      for (var i = 0; i < views.length; i++)
        _RankedRow(
          rank: i + 1,
          leading: CategoryAvatar(iconName: views[i].expenseTypeIcon, size: 36),
          label: views[i].expense.description.replaceAll(RegExp(r'\s+'), ' '),
          caption: '${views[i].vendorName} · ${Formatters.date(views[i].expense.buyDate)}',
          value: views[i].normalizedValue ?? 0,
          fraction: max == 0 ? 0 : (views[i].normalizedValue ?? 0) / max,
          currency: widget.currency,
          onTap: () => widget.onExpenseTap(views[i]),
        ),
    ];
  }

  Widget _iconAvatar(IconData icon) => Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(color: AppColors.accent.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(12)),
        child: Icon(icon, size: 18, color: AppColors.accent),
      );
}

class _RankedRow extends StatelessWidget {
  const _RankedRow({
    required this.rank,
    required this.leading,
    required this.label,
    required this.caption,
    required this.value,
    required this.fraction,
    required this.currency,
    this.onTap,
  });

  final int rank;
  final Widget leading;
  final String label;
  final String caption;
  final double value;
  final double fraction;
  final String currency;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: Spacing.lg, vertical: Spacing.sm),
        child: Row(
          children: [
            SizedBox(
              width: 20,
              child: Text('$rank', style: amountStyle(theme.textTheme.labelMedium).copyWith(color: AppColors.textMuted)),
            ),
            leading,
            const SizedBox(width: Spacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                      ),
                      const SizedBox(width: Spacing.sm),
                      Text('\$${Formatters.amount(value)}',
                          style: amountStyle(theme.textTheme.bodyMedium).copyWith(fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  _Bar(fraction: fraction),
                  const SizedBox(height: 4),
                  Text(caption, maxLines: 1, overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Bar extends StatelessWidget {
  const _Bar({required this.fraction});

  final double fraction;

  @override
  Widget build(BuildContext context) => ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: SizedBox(
          height: 6,
          child: Stack(
            children: [
              Container(color: AppColors.surfaceContainerHighest),
              FractionallySizedBox(
                widthFactor: fraction.clamp(0.02, 1.0),
                child: Container(decoration: const BoxDecoration(gradient: AppColors.barGradient)),
              ),
            ],
          ),
        ),
      );
}

/// Skeleton shown while the dashboard loads.
class DashboardSkeleton extends StatelessWidget {
  const DashboardSkeleton({super.key});

  @override
  Widget build(BuildContext context) => const Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SkeletonBox(height: 168, radius: Radii.card),
          SizedBox(height: Spacing.lg),
          SkeletonBox(height: 260, radius: Radii.card),
          SizedBox(height: Spacing.lg),
          SkeletonBox(height: 64, radius: Radii.control),
          SizedBox(height: Spacing.sm),
          SkeletonBox(height: 64, radius: Radii.control),
        ],
      );
}
