import 'package:flutter/material.dart';

import '../../app/theme/app_theme.dart';

/// Centered empty state with an optional action.
class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.action,
    this.compact = false,
  });

  final IconData icon;
  final String title;
  final String message;
  final Widget? action;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: Spacing.xl, vertical: compact ? Spacing.xl : Spacing.xxl),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: compact ? 56 : 72,
            height: compact ? 56 : 72,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: compact ? 28 : 36, color: AppColors.primary),
          ),
          const SizedBox(height: Spacing.lg),
          Text(title, style: theme.textTheme.titleMedium, textAlign: TextAlign.center),
          const SizedBox(height: Spacing.sm),
          Text(
            message,
            style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          if (action != null) ...[const SizedBox(height: Spacing.xl), action!],
        ],
      ),
    );
  }
}

/// Error state with a retry action. Never shows stack traces.
class ErrorState extends StatelessWidget {
  const ErrorState({super.key, required this.message, this.onRetry});

  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) => EmptyState(
        icon: Icons.error_outline_rounded,
        title: 'Something went wrong',
        message: message,
        compact: true,
        action: onRetry == null
            ? null
            : OutlinedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Try again'),
              ),
      );
}

/// Pulsing placeholder block used by skeleton loaders.
class SkeletonBox extends StatefulWidget {
  const SkeletonBox({super.key, this.height = 16, this.width, this.radius = 8});

  final double height;
  final double? width;
  final double radius;

  @override
  State<SkeletonBox> createState() => _SkeletonBoxState();
}

class _SkeletonBoxState extends State<SkeletonBox> with SingleTickerProviderStateMixin {
  late final AnimationController _controller =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 900))..repeat(reverse: true);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reduceMotion = MediaQuery.of(context).disableAnimations;
    final box = Container(
      height: widget.height,
      width: widget.width,
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(widget.radius),
      ),
    );
    if (reduceMotion) return box;
    return FadeTransition(opacity: Tween(begin: 0.45, end: 1.0).animate(_controller), child: box);
  }
}

/// Section title used across screens.
class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.title, this.subtitle, this.trailing});

  final String title;
  final String? subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(Spacing.xs, Spacing.xl, Spacing.xs, Spacing.md),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: theme.textTheme.titleMedium),
                if (subtitle != null)
                  Text(subtitle!, style: theme.textTheme.bodySmall?.copyWith(color: AppColors.textSecondary)),
              ],
            ),
          ),
          ?trailing,
        ],
      ),
    );
  }
}

/// Small colored status pill (color + icon + text; never color alone).
class StatusPill extends StatelessWidget {
  const StatusPill({super.key, required this.label, required this.icon, required this.color});

  final String label;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: Spacing.sm, vertical: 3),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.14),
          borderRadius: BorderRadius.circular(Radii.chip),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 13, color: color),
            const SizedBox(width: 4),
            Text(label, style: TextStyle(color: color, fontSize: 11.5, fontWeight: FontWeight.w700)),
          ],
        ),
      );
}

/// Shows a floating snackbar with a consistent look.
void showAppSnackBar(BuildContext context, String message, {bool error = false, SnackBarAction? action}) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      content: Row(
        children: [
          Icon(error ? Icons.error_outline_rounded : Icons.check_circle_rounded,
              color: error ? AppColors.error : AppColors.money, size: 20),
          const SizedBox(width: Spacing.md),
          Expanded(child: Text(message)),
        ],
      ),
      action: action,
      duration: Duration(seconds: error ? 6 : 3),
    ));
}
