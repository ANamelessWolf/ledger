import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers.dart';
import '../../features/settings/application/api_status.dart';
import '../../features/settings/presentation/api_config_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';
import '../theme/app_theme.dart';
import 'app_shell.dart';

/// Navigation drawer opened from the Home hamburger menu.
class AppDrawer extends ConsumerWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final config = ref.watch(apiConfigProvider);
    final status = ref.watch(apiStatusProvider);

    // Capture the navigator before closing the drawer (its context goes away).
    final navigator = Navigator.of(context);
    void go(VoidCallback action) {
      navigator.pop();
      action();
    }

    final (statusLabel, statusColor) = switch (status.reachability) {
      ApiReachability.online => ('Connected', AppColors.money),
      ApiReachability.offline => ('Offline', AppColors.warning),
      ApiReachability.unknown => ('Checking…', AppColors.textSecondary),
      ApiReachability.unconfigured => ('Not configured', AppColors.textSecondary),
    };

    return NavigationDrawer(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(Spacing.xl, Spacing.xl, Spacing.xl, Spacing.lg),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(gradient: AppColors.heroGradient, borderRadius: BorderRadius.circular(14)),
                child: const Icon(Icons.account_balance_wallet_rounded, color: Colors.white),
              ),
              const SizedBox(width: Spacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Ledger', style: theme.textTheme.titleLarge),
                    Row(
                      children: [
                        Icon(Icons.circle, size: 8, color: statusColor),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            config == null ? statusLabel : '$statusLabel · ${config.host}',
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const Divider(indent: Spacing.xl, endIndent: Spacing.xl),
        const SizedBox(height: Spacing.sm),
        _item(context, Icons.space_dashboard_rounded, 'Home',
            () => go(() => ref.read(appTabProvider.notifier).select(AppTab.home))),
        _item(context, Icons.cloud_sync_rounded, 'Synchronization',
            () => go(() => ref.read(appTabProvider.notifier).select(AppTab.sync))),
        const Padding(
          padding: EdgeInsets.fromLTRB(Spacing.xl, Spacing.lg, Spacing.xl, Spacing.sm),
          child: Text('CONFIGURATION', style: TextStyle(color: AppColors.textMuted, fontSize: 11, letterSpacing: 1.2)),
        ),
        _item(context, Icons.settings_rounded, 'Settings',
            () => go(() => navigator.push(SettingsScreen.route()))),
        _item(context, Icons.lan_rounded, 'API connection',
            () => go(() => navigator.push(ApiConfigScreen.route()))),
        _item(context, Icons.sync_alt_rounded, 'Synchronization settings',
            () => go(() => navigator.push(SettingsScreen.route()))),
      ],
    );
  }

  Widget _item(BuildContext context, IconData icon, String label, VoidCallback onTap) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: Spacing.md),
        child: ListTile(
          leading: Icon(icon),
          title: Text(label),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          onTap: onTap,
        ),
      );
}
