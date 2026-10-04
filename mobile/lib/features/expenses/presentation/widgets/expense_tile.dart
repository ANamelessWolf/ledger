import 'package:flutter/material.dart';

import '../../../../app/theme/app_theme.dart';
import '../../../../core/formatting/formatters.dart';
import '../../../../shared/widgets/category_icon.dart';
import '../../../../shared/widgets/state_views.dart';
import '../../domain/expense.dart';
import '../../domain/sync_status.dart';

/// Pill describing an expense's synchronization state.
class SyncStatusPill extends StatelessWidget {
  const SyncStatusPill({super.key, required this.status});

  final SyncStatus status;

  @override
  Widget build(BuildContext context) => switch (status) {
        SyncStatus.pending =>
          const StatusPill(label: 'Pending', icon: Icons.schedule_rounded, color: AppColors.warning),
        SyncStatus.failed => const StatusPill(label: 'Failed', icon: Icons.error_outline_rounded, color: AppColors.error),
        SyncStatus.synced => const StatusPill(label: 'Synced', icon: Icons.cloud_done_rounded, color: AppColors.money),
      };
}

/// Expense list row: category icon, description, vendor · date, original
/// amount in its own currency and the normalized amount (prefixed with ≈ so
/// it is not mistaken for the transaction amount).
class ExpenseTile extends StatelessWidget {
  const ExpenseTile({super.key, required this.view, required this.defaultCurrency, required this.onTap});

  final ExpenseView view;
  final String? defaultCurrency;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final e = view.expense;
    final original = Formatters.money(e.total, view.currencySymbol ?? '');
    final showNormalized = view.currencySymbol != defaultCurrency || view.currencySymbol == null;
    final normalized = view.normalizedValue == null
        ? 'Not convertible'
        : '≈ ${Formatters.money(view.normalizedValue!, defaultCurrency ?? '')}';

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: Spacing.lg, vertical: Spacing.md),
        child: Row(
          children: [
            CategoryAvatar(iconName: view.expenseTypeIcon),
            const SizedBox(width: Spacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    e.description.replaceAll(RegExp(r'\s+'), ' '),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${view.vendorName} · ${Formatters.date(e.buyDate)}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                  ),
                  if (e.syncStatus != SyncStatus.synced) ...[
                    const SizedBox(height: 6),
                    SyncStatusPill(status: e.syncStatus),
                  ],
                ],
              ),
            ),
            const SizedBox(width: Spacing.md),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(original,
                    style: amountStyle(theme.textTheme.bodyLarge)
                        .copyWith(fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                if (showNormalized) ...[
                  const SizedBox(height: 2),
                  Text(normalized,
                      style: amountStyle(theme.textTheme.bodySmall).copyWith(color: AppColors.textSecondary)),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}
