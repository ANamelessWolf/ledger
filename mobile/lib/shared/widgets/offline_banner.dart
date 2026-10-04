import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/theme/app_theme.dart';
import '../../features/settings/application/api_status.dart';

/// Thin banner shown while the Ledger API is unreachable. The app keeps
/// working with cached data, which the banner says explicitly.
class OfflineBanner extends ConsumerWidget {
  const OfflineBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = ref.watch(apiStatusProvider);
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 220),
      child: !status.isOffline
          ? const SizedBox.shrink()
          : Material(
              key: const ValueKey('offline'),
              color: AppColors.warningContainer,
              child: InkWell(
                onTap: () => ref.read(apiStatusProvider.notifier).check(),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: Spacing.lg, vertical: Spacing.sm),
                  child: Row(
                    children: [
                      const Icon(Icons.cloud_off_rounded, size: 18, color: AppColors.warning),
                      const SizedBox(width: Spacing.sm),
                      const Expanded(
                        child: Text(
                          'Offline — showing data saved on this device',
                          style: TextStyle(color: AppColors.warning, fontWeight: FontWeight.w600, fontSize: 13),
                        ),
                      ),
                      Text('Retry',
                          style: TextStyle(
                              color: AppColors.warning.withValues(alpha: 0.85), fontWeight: FontWeight.w700, fontSize: 13)),
                    ],
                  ),
                ),
              ),
            ),
    );
  }
}
