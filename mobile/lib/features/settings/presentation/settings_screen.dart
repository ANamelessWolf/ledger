import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_theme.dart';
import '../../../core/formatting/formatters.dart';
import '../../../core/providers.dart';
import '../../../core/utilities/iso_date.dart';
import '../../../shared/widgets/state_views.dart';
import '../../catalogs/catalog_providers.dart';
import '../../synchronization/domain/sync_models.dart';
import '../../synchronization/sync_providers.dart';
import '../application/api_status.dart';
import '../application/connection_tester.dart';
import 'api_config_screen.dart';

/// App version shown in Settings.
const appVersion = '1.0.0';

/// Settings: API connection, currency, synchronization and app info.
class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  static Route<void> route() => MaterialPageRoute(builder: (_) => const SettingsScreen());

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  ConnectionTestResult? _test;
  bool _testing = false;

  Future<void> _testConnection() async {
    final config = ref.read(apiConfigProvider);
    if (config == null) return;
    setState(() => _testing = true);
    final result = await ref.read(connectionTesterProvider).test(config);
    ref.read(apiStatusProvider.notifier).report(reachable: result.isSuccess, message: result.message);
    if (mounted) {
      setState(() {
        _testing = false;
        _test = result;
      });
    }
  }

  Future<void> _runSync(SyncKind kind) async {
    if (kind == SyncKind.full) {
      final ok = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          icon: const Icon(Icons.sync_alt_rounded),
          title: const Text('Run full synchronization?'),
          content: const Text(
            'Pending expenses are uploaded first. Then all catalogs and the expenses of the current and previous two months '
            'are downloaded again and replace the synchronized data on this device.\n\n'
            'Expenses that were not synchronized are never deleted, and if anything fails your current offline data is kept.',
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Run full sync')),
          ],
        ),
      );
      if (ok != true) return;
    }
    final report = await ref.read(syncControllerProvider.notifier).run(kind);
    if (!mounted) return;
    final error = ref.read(syncControllerProvider).error;
    if (report != null) {
      showAppSnackBar(context, report.summary, error: report.hasErrors);
    } else if (error != null) {
      showAppSnackBar(context, error, error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final config = ref.watch(apiConfigProvider);
    final status = ref.watch(apiStatusProvider);
    final info = ref.watch(syncInfoProvider).value;
    final catalogs = ref.watch(catalogsProvider).value;
    final sync = ref.watch(syncControllerProvider);
    final setupDone = ref.watch(initialSetupProvider);
    final window = DateRange.syncWindow(ref.watch(clockProvider)());
    final defaultCurrency = catalogs?.defaultCurrency;

    String date(DateTime? d) => d == null ? 'Never' : Formatters.timestamp(d);

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Spacing.lg, 0, Spacing.lg, Spacing.xxl),
        children: [
          const SectionHeader(title: 'API connection'),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.dns_rounded),
                  title: const Text('Current API URL'),
                  subtitle: Text(config?.baseUrl ?? 'Not configured',
                      style: const TextStyle(fontFamily: 'monospace', color: AppColors.textPrimary)),
                  trailing: _reachabilityPill(status.reachability),
                ),
                const Divider(indent: 72),
                ListTile(
                  leading: _testing
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.network_check_rounded),
                  title: const Text('Test connection'),
                  subtitle: _test == null
                      ? null
                      : Text(_test!.message, style: TextStyle(color: _test!.isSuccess ? AppColors.money : AppColors.error)),
                  enabled: config != null && !_testing,
                  onTap: _testConnection,
                ),
                const Divider(indent: 72),
                ListTile(
                  leading: const Icon(Icons.edit_rounded),
                  title: const Text('Change connection'),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => Navigator.of(context).push(ApiConfigScreen.route()),
                ),
              ],
            ),
          ),
          const SectionHeader(title: 'Currency'),
          Card(
            child: ListTile(
              leading: const Icon(Icons.currency_exchange_rounded),
              title: const Text('Display currency'),
              subtitle: Text(
                defaultCurrency == null
                    ? 'Available after the first synchronization'
                    : '${defaultCurrency.symbol} · ${defaultCurrency.name}\n'
                        'The Ledger default currency (conversion = 1). Totals use each expense\'s own factor when it has one, '
                        'otherwise the current catalog rate.',
              ),
              isThreeLine: defaultCurrency != null,
            ),
          ),
          const SectionHeader(title: 'Synchronization'),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.history_rounded),
                  title: const Text('Last successful sync'),
                  subtitle: Text(date(info?.lastSuccessfulSync)),
                ),
                const Divider(indent: 72),
                ListTile(
                  leading: const Icon(Icons.inventory_2_rounded),
                  title: const Text('Last full sync'),
                  subtitle: Text('${date(info?.lastFullSync)} · catalogs ${date(info?.lastCatalogSync).toLowerCase()}'),
                ),
                const Divider(indent: 72),
                ListTile(
                  leading: const Icon(Icons.date_range_rounded),
                  title: const Text('Synchronized period'),
                  subtitle: Text('${Formatters.date(window.start)} – ${Formatters.date(window.end)} (current + previous 2 months)'),
                ),
                if (info?.lastError != null) ...[
                  const Divider(indent: 72),
                  ListTile(
                    leading: const Icon(Icons.error_outline_rounded, color: AppColors.error),
                    title: const Text('Last error'),
                    subtitle: Text(info!.lastError!, style: const TextStyle(color: AppColors.error)),
                  ),
                ],
                if (sync.running) ...[
                  const Divider(indent: 72),
                  ListTile(
                    leading: const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2)),
                    title: Text('${sync.kind?.label ?? 'Synchronizing'}…'),
                    subtitle: Text(sync.progress == null ? 'Starting' : '${sync.progress!.phase.label} ${sync.progress!.detail}'),
                  ),
                ],
                Padding(
                  padding: const EdgeInsets.all(Spacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      FilledButton.icon(
                        onPressed: config == null || sync.running ? null : () => _runSync(setupDone ? SyncKind.normal : SyncKind.initial),
                        icon: const Icon(Icons.sync_rounded),
                        label: Text(setupDone ? 'Normal synchronization' : 'Initial synchronization'),
                      ),
                      const SizedBox(height: Spacing.md),
                      OutlinedButton.icon(
                        onPressed: config == null || sync.running || !setupDone ? null : () => _runSync(SyncKind.full),
                        icon: const Icon(Icons.sync_alt_rounded),
                        label: const Text('Full synchronization'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SectionHeader(title: 'Application'),
          Card(
            child: Column(
              children: [
                const ListTile(
                  leading: Icon(Icons.info_outline_rounded),
                  title: Text('Ledger Mobile'),
                  subtitle: Text('Version $appVersion · offline-first'),
                ),
                const Divider(indent: 72),
                ListTile(
                  leading: const Icon(Icons.storage_rounded),
                  title: const Text('Data on this device'),
                  subtitle: Text(
                    catalogs == null
                        ? '—'
                        : '${catalogs.wallets.length} wallets · ${catalogs.vendors.length} vendors · '
                            '${catalogs.expenseTypes.length} expense types · ${catalogs.currencies.length} currencies',
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(top: Spacing.lg),
            child: Text(
              'The API has no authentication; use it only on a trusted local network.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textMuted),
            ),
          ),
        ],
      ),
    );
  }

  Widget _reachabilityPill(ApiReachability r) => switch (r) {
        ApiReachability.online => const StatusPill(label: 'Online', icon: Icons.cloud_done_rounded, color: AppColors.money),
        ApiReachability.offline => const StatusPill(label: 'Offline', icon: Icons.cloud_off_rounded, color: AppColors.warning),
        ApiReachability.unknown => const StatusPill(label: 'Checking', icon: Icons.more_horiz_rounded, color: AppColors.textSecondary),
        ApiReachability.unconfigured => const StatusPill(label: 'Not set', icon: Icons.link_off_rounded, color: AppColors.textSecondary),
      };
}
