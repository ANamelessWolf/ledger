import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_theme.dart';
import '../../../core/errors/app_exception.dart';
import '../../../core/formatting/formatters.dart';
import '../../../shared/widgets/category_icon.dart';
import '../../../shared/widgets/state_views.dart';
import '../../catalogs/catalog_providers.dart';
import '../domain/currency_conversion_service.dart';
import '../domain/expense.dart';
import '../domain/sync_status.dart';
import '../expense_providers.dart';
import 'expense_form_screen.dart';
import 'widgets/expense_tile.dart';

/// Expense details. Unsynchronized expenses can be edited/deleted; synced
/// ones are read-only and must be changed in the Ledger web application.
class ExpenseDetailScreen extends ConsumerWidget {
  const ExpenseDetailScreen({super.key, required this.expenseId});

  final int expenseId;

  static Route<void> route(int expenseId) =>
      MaterialPageRoute(builder: (_) => ExpenseDetailScreen(expenseId: expenseId));

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final viewAsync = ref.watch(expenseViewProvider(expenseId));
    final view = viewAsync.value;
    final editable = view?.expense.isEditable ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Expense'),
        actions: [
          if (editable) ...[
            IconButton(
              tooltip: 'Edit',
              icon: const Icon(Icons.edit_rounded),
              onPressed: () => Navigator.of(context).push(ExpenseFormScreen.editRoute(view!.expense)),
            ),
            IconButton(
              tooltip: 'Delete',
              icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
              onPressed: () => _confirmDelete(context, ref, view!.expense),
            ),
          ],
          const SizedBox(width: Spacing.xs),
        ],
      ),
      body: switch (viewAsync) {
        AsyncData(value: null) => const EmptyState(
            icon: Icons.receipt_long_outlined,
            title: 'Expense not found',
            message: 'It may have been deleted or replaced by a synchronization.',
          ),
        AsyncData(value: final ExpenseView v) => _Details(view: v),
        AsyncError() => const ErrorState(message: 'This expense could not be loaded.'),
        _ => const Center(child: CircularProgressIndicator()),
      },
    );
  }

  Future<void> _confirmDelete(BuildContext context, WidgetRef ref, Expense expense) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.delete_forever_rounded, color: AppColors.error),
        title: const Text('Delete expense?'),
        content: const Text('This expense has not been synchronized and will be permanently removed from this device.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.black),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;
    try {
      await ref.read(expenseServiceProvider).delete(expense.id);
      if (!context.mounted) return;
      Navigator.of(context).pop();
      showAppSnackBar(context, 'Expense deleted');
    } catch (e) {
      if (context.mounted) showAppSnackBar(context, userMessageFor(e), error: true);
    }
  }
}

class _Details extends ConsumerWidget {
  const _Details({required this.view});

  final ExpenseView view;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final e = view.expense;
    final catalogs = ref.watch(catalogsProvider).value;
    final defaultSymbol = catalogs?.defaultCurrency?.symbol ?? '';
    final currency = catalogs?.currencyOfWallet(e.walletId);
    const conversion = CurrencyConversionService();
    final usesOwnFactor = conversion.usesExpenseFactor(e.currencyFactor);

    final factorText = usesOwnFactor
        ? '${Formatters.factor(e.currencyFactor!)} (expense factor)'
        : currency == null
            ? 'Unknown'
            : currency.isDefault
                ? 'Not applicable (default currency)'
                : '${Formatters.factor(currency.conversion)} (current catalog rate)';

    return ListView(
      padding: const EdgeInsets.all(Spacing.lg),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(Spacing.xl),
            child: Column(
              children: [
                CategoryAvatar(iconName: view.expenseTypeIcon, size: 64),
                const SizedBox(height: Spacing.lg),
                Text(e.description, textAlign: TextAlign.center, style: theme.textTheme.titleLarge),
                const SizedBox(height: Spacing.md),
                Text(Formatters.money(e.total, view.currencySymbol ?? ''),
                    style: amountStyle(theme.textTheme.headlineMedium).copyWith(fontWeight: FontWeight.w800)),
                if (view.currencySymbol != defaultSymbol && view.normalizedValue != null)
                  Text('≈ ${Formatters.money(view.normalizedValue!, defaultSymbol)}',
                      style: amountStyle(theme.textTheme.titleMedium).copyWith(color: AppColors.textSecondary)),
                const SizedBox(height: Spacing.md),
                SyncStatusPill(status: e.syncStatus),
              ],
            ),
          ),
        ),
        const SizedBox(height: Spacing.lg),
        if (!e.isEditable)
          _InfoBanner(
            icon: Icons.lock_outline_rounded,
            color: AppColors.primary,
            text: 'This expense has already been synchronized.\nEdit or delete it from the Ledger web application.',
          )
        else if (e.syncStatus == SyncStatus.failed && e.syncError != null)
          _InfoBanner(icon: Icons.error_outline_rounded, color: AppColors.error, text: e.syncError!)
        else
          _InfoBanner(
            icon: Icons.schedule_rounded,
            color: AppColors.warning,
            text: 'Saved on this device only. It will be sent to Ledger on the next synchronization.',
          ),
        const SizedBox(height: Spacing.lg),
        Card(
          child: Column(
            children: [
              _row(Icons.storefront_rounded, 'Vendor', view.vendorName),
              _row(CategoryIcons.resolve(view.expenseTypeIcon), 'Expense type', view.expenseTypeName),
              _row(Icons.account_balance_wallet_rounded, 'Wallet', view.walletName),
              _row(Icons.currency_exchange_rounded, 'Currency', currency == null ? 'Unknown' : '${currency.symbol} · ${currency.name}'),
              _row(Icons.payments_rounded, 'Original amount', Formatters.money(e.total, view.currencySymbol ?? '')),
              _row(Icons.swap_horiz_rounded, 'Currency factor', factorText),
              _row(Icons.calculate_rounded, 'Normalized amount',
                  view.normalizedValue == null ? 'Not convertible' : Formatters.money(view.normalizedValue!, defaultSymbol)),
              _row(Icons.event_rounded, 'Date', Formatters.longDate(e.buyDate)),
              _row(Icons.cloud_done_rounded, 'Synchronization',
                  e.remoteId == null ? e.syncStatus.name[0].toUpperCase() + e.syncStatus.name.substring(1) : 'Synced · Ledger #${e.remoteId}',
                  last: true),
            ],
          ),
        ),
      ],
    );
  }

  Widget _row(IconData icon, String label, String value, {bool last = false}) => Column(
        children: [
          ListTile(
            leading: Icon(icon, size: 22),
            title: Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
            subtitle: Text(value, style: amountStyle(const TextStyle(color: AppColors.textPrimary, fontSize: 15.5, fontWeight: FontWeight.w600))),
          ),
          if (!last) const Divider(indent: 72),
        ],
      );
}

class _InfoBanner extends StatelessWidget {
  const _InfoBanner({required this.icon, required this.color, required this.text});

  final IconData icon;
  final Color color;
  final String text;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(Spacing.lg),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(Radii.control),
          border: Border.all(color: color.withValues(alpha: 0.35)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color),
            const SizedBox(width: Spacing.md),
            Expanded(child: Text(text, style: const TextStyle(height: 1.4))),
          ],
        ),
      );
}
