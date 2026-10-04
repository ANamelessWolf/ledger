import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_theme.dart';
import '../../../core/formatting/formatters.dart';
import '../../../core/providers.dart';
import '../../../shared/widgets/offline_banner.dart';
import '../../../shared/widgets/state_views.dart';
import '../../expenses/expense_providers.dart';
import '../../expenses/presentation/expense_detail_screen.dart';
import '../../settings/presentation/api_config_screen.dart';
import '../domain/sync_models.dart';
import '../sync_providers.dart';

/// Normal synchronization with meaningful progress and results.
class SyncScreen extends ConsumerWidget {
  const SyncScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final configured = ref.watch(apiConfigProvider) != null;
    final setupDone = ref.watch(initialSetupProvider);
    final sync = ref.watch(syncControllerProvider);
    final counts = ref.watch(syncCountsProvider).value;
    final info = ref.watch(syncInfoProvider).value;

    return Scaffold(
      appBar: AppBar(title: const Text('Sync')),
      body: Column(
        children: [
          if (configured) const OfflineBanner(),
          Expanded(
            child: !configured
                ? EmptyState(
                    icon: Icons.lan_rounded,
                    title: 'Connect to Ledger first',
                    message: 'Ledger needs to be connected before your data can be synchronized.',
                    action: FilledButton.icon(
                      onPressed: () => Navigator.of(context).push(ApiConfigScreen.route()),
                      icon: const Icon(Icons.settings_ethernet_rounded),
                      label: const Text('Configure API'),
                    ),
                  )
                : ListView(
                    padding: const EdgeInsets.all(Spacing.lg),
                    children: [
                      _StatusCard(
                        pending: counts?.pending ?? 0,
                        failed: counts?.failed ?? 0,
                        lastSync: info?.lastSuccessfulSync,
                      ),
                      const SizedBox(height: Spacing.lg),
                      if (sync.running)
                        _ProgressCard(state: sync)
                      else
                        FilledButton.icon(
                          onPressed: () async {
                            final kind = setupDone ? SyncKind.normal : SyncKind.initial;
                            final report = await ref.read(syncControllerProvider.notifier).run(kind);
                            if (report != null && context.mounted) {
                              showAppSnackBar(context, report.hasErrors ? report.summary : '${kind.label} complete',
                                  error: report.hasErrors);
                            }
                          },
                          icon: const Icon(Icons.sync_rounded),
                          label: Text(setupDone ? 'Synchronize now' : 'Start initial synchronization'),
                        ),
                      const SizedBox(height: Spacing.sm),
                      Text(
                        'Uploads expenses created on this device (in batches of 10), then refreshes the current and previous two months from Ledger.',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                      ),
                      if (!sync.running && sync.error != null) ...[
                        const SizedBox(height: Spacing.lg),
                        _ResultCard.error(message: sync.error!),
                      ] else if (!sync.running && sync.lastReport != null) ...[
                        const SizedBox(height: Spacing.lg),
                        _ResultCard(report: sync.lastReport!),
                      ],
                      const _FailedList(),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  const _StatusCard({required this.pending, required this.failed, required this.lastSync});

  final int pending;
  final int failed;
  final DateTime? lastSync;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(Spacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: _metric(theme, '$pending', 'Pending', AppColors.warning, Icons.schedule_rounded)),
                const SizedBox(width: Spacing.md),
                Expanded(child: _metric(theme, '$failed', 'Failed', AppColors.error, Icons.error_outline_rounded)),
              ],
            ),
            const SizedBox(height: Spacing.lg),
            Row(
              children: [
                const Icon(Icons.history_rounded, size: 18, color: AppColors.textSecondary),
                const SizedBox(width: Spacing.sm),
                Text(
                  lastSync == null ? 'Never synchronized successfully' : 'Last successful sync: ${Formatters.timestamp(lastSync!)}',
                  style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _metric(ThemeData theme, String value, String label, Color color, IconData icon) => Container(
        padding: const EdgeInsets.all(Spacing.lg),
        decoration: BoxDecoration(color: color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(Radii.control)),
        child: Row(
          children: [
            Icon(icon, color: color),
            const SizedBox(width: Spacing.md),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(value, style: amountStyle(theme.textTheme.headlineSmall).copyWith(fontWeight: FontWeight.w800)),
              Text(label, style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
            ]),
          ],
        ),
      );
}

class _ProgressCard extends StatelessWidget {
  const _ProgressCard({required this.state});

  final SyncState state;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final p = state.progress;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(Spacing.xl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.5)),
              const SizedBox(width: Spacing.md),
              Text('${state.kind?.label ?? 'Synchronizing'}…', style: theme.textTheme.titleMedium),
            ]),
            const SizedBox(height: Spacing.lg),
            Row(children: [
              Expanded(child: Text(p?.phase.label ?? 'Starting', style: theme.textTheme.bodyLarge)),
              Text(p?.detail ?? '', style: amountStyle(theme.textTheme.bodyLarge).copyWith(color: AppColors.textSecondary)),
            ]),
            const SizedBox(height: Spacing.sm),
            LinearProgressIndicator(value: p?.fraction, minHeight: 6, borderRadius: BorderRadius.circular(3)),
          ],
        ),
      ),
    );
  }
}

class _ResultCard extends StatelessWidget {
  const _ResultCard({required SyncReport this.report}) : message = null;
  const _ResultCard.error({required String this.message}) : report = null;

  final SyncReport? report;
  final String? message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final r = report;
    final failedRun = r == null;
    final withErrors = failedRun || r.hasErrors;
    final color = failedRun ? AppColors.error : (withErrors ? AppColors.warning : AppColors.money);
    final title = failedRun
        ? 'Synchronization failed'
        : withErrors
            ? 'Synchronization completed with errors'
            : 'Synchronization complete';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(Spacing.xl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(failedRun ? Icons.cancel_rounded : (withErrors ? Icons.warning_amber_rounded : Icons.check_circle_rounded), color: color),
              const SizedBox(width: Spacing.md),
              Expanded(child: Text(title, style: theme.textTheme.titleMedium?.copyWith(color: color))),
            ]),
            const SizedBox(height: Spacing.lg),
            if (failedRun) ...[
              Text(message!),
              const SizedBox(height: Spacing.sm),
              const Text('Your offline data was kept. Expenses on this device remain available for retry.',
                  style: TextStyle(color: AppColors.textSecondary)),
            ] else ...[
              _line(Icons.cloud_upload_rounded, '${r.uploaded} expense${r.uploaded == 1 ? '' : 's'} uploaded'
                  '${r.alreadyOnServer > 0 ? ' (${r.alreadyOnServer} already in Ledger)' : ''}'),
              if (r.failedUploads > 0) _line(Icons.error_outline_rounded, '${r.failedUploads} expense${r.failedUploads == 1 ? '' : 's'} failed', color: AppColors.error),
              _line(Icons.cloud_download_rounded,
                  r.refreshError == null ? '${r.refreshed} expenses refreshed' : 'Refresh failed: ${r.refreshError}',
                  color: r.refreshError == null ? null : AppColors.error),
              if (r.catalogsRefreshed) _line(Icons.inventory_2_rounded, 'Catalogs refreshed'),
              _line(Icons.rule_rounded, '${r.errorCount} error${r.errorCount == 1 ? '' : 's'}'),
              if (r.failedUploads > 0)
                const Padding(
                  padding: EdgeInsets.only(top: Spacing.sm),
                  child: Text('Those expenses remain available for retry.', style: TextStyle(color: AppColors.textSecondary)),
                ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _line(IconData icon, String text, {Color? color}) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 3),
        child: Row(children: [
          Icon(icon, size: 18, color: color ?? AppColors.textSecondary),
          const SizedBox(width: Spacing.sm),
          Expanded(child: Text(text, style: TextStyle(color: color))),
        ]),
      );
}

/// Local expenses whose last upload failed, with the reason.
class _FailedList extends ConsumerWidget {
  const _FailedList();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final failed = ref.watch(_failedExpensesProvider).value ?? const [];
    if (failed.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SectionHeader(title: 'Failed expenses', subtitle: 'Fix them if needed; they are retried on every sync'),
        Card(
          child: Column(
            children: [
              for (final e in failed)
                ListTile(
                  leading: const Icon(Icons.error_outline_rounded, color: AppColors.error),
                  title: Text(e.description, maxLines: 1, overflow: TextOverflow.ellipsis),
                  subtitle: Text(e.syncError ?? 'Unknown error', maxLines: 2, overflow: TextOverflow.ellipsis),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => Navigator.of(context).push(ExpenseDetailScreen.route(e.id)),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

final _failedExpensesProvider = StreamProvider((ref) => ref.watch(expenseRepositoryProvider).watchFailed());
