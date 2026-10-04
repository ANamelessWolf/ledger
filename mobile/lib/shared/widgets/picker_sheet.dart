import 'package:flutter/material.dart';

import '../../app/theme/app_theme.dart';

/// One selectable option of a [showPickerSheet].
class PickerOption<T> {
  const PickerOption({
    required this.value,
    required this.label,
    this.subtitle,
    this.group,
    this.leading,
    this.searchText,
  });

  final T value;
  final String label;
  final String? subtitle;

  /// Options with the same group are listed under a header.
  final String? group;
  final Widget? leading;

  /// Extra text matched by the search box (e.g. group or currency).
  final String? searchText;
}

/// Wrapper so the caller can distinguish "cleared" from "dismissed".
class PickerResult<T> {
  const PickerResult(this.value);
  final T? value;
}

/// Searchable modal bottom sheet. Returns null when dismissed, or a
/// [PickerResult] (whose value is null when [allowClear] and "All" chosen).
Future<PickerResult<T>?> showPickerSheet<T>({
  required BuildContext context,
  required String title,
  required List<PickerOption<T>> options,
  T? selected,
  String? clearLabel,
}) {
  return showModalBottomSheet<PickerResult<T>>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => _PickerSheet<T>(title: title, options: options, selected: selected, clearLabel: clearLabel),
  );
}

class _PickerSheet<T> extends StatefulWidget {
  const _PickerSheet({required this.title, required this.options, this.selected, this.clearLabel});

  final String title;
  final List<PickerOption<T>> options;
  final T? selected;
  final String? clearLabel;

  @override
  State<_PickerSheet<T>> createState() => _PickerSheetState<T>();
}

class _PickerSheetState<T> extends State<_PickerSheet<T>> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final q = _query.trim().toLowerCase();
    final filtered = q.isEmpty
        ? widget.options
        : widget.options
            .where((o) => '${o.label} ${o.subtitle ?? ''} ${o.group ?? ''} ${o.searchText ?? ''}'.toLowerCase().contains(q))
            .toList();

    final rows = <Widget>[];
    if (widget.clearLabel != null && q.isEmpty) {
      rows.add(_tile(
        context,
        leading: const Icon(Icons.all_inclusive_rounded),
        label: widget.clearLabel!,
        selected: widget.selected == null,
        onTap: () => Navigator.pop(context, PickerResult<T>(null)),
      ));
    }
    String? currentGroup;
    for (final option in filtered) {
      if (option.group != null && option.group != currentGroup) {
        currentGroup = option.group;
        rows.add(Padding(
          padding: const EdgeInsets.fromLTRB(Spacing.xl, Spacing.lg, Spacing.xl, Spacing.xs),
          child: Text(currentGroup!.toUpperCase(),
              style: theme.textTheme.labelSmall?.copyWith(color: AppColors.textMuted, letterSpacing: 1.1)),
        ));
      }
      rows.add(_tile(
        context,
        leading: option.leading,
        label: option.label,
        subtitle: option.subtitle,
        selected: option.value == widget.selected,
        onTap: () => Navigator.pop(context, PickerResult<T>(option.value)),
      ));
    }

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.75,
      minChildSize: 0.4,
      maxChildSize: 0.95,
      builder: (context, controller) => Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(Spacing.xl, 0, Spacing.xl, Spacing.md),
            child: Row(children: [Expanded(child: Text(widget.title, style: theme.textTheme.titleLarge))]),
          ),
          if (widget.options.length > 6)
            Padding(
              padding: const EdgeInsets.fromLTRB(Spacing.lg, 0, Spacing.lg, Spacing.sm),
              child: TextField(
                autofocus: false,
                onChanged: (v) => setState(() => _query = v),
                decoration: const InputDecoration(
                  hintText: 'Search',
                  prefixIcon: Icon(Icons.search_rounded),
                ),
              ),
            ),
          Expanded(
            child: filtered.isEmpty && rows.isEmpty
                ? Center(
                    child: Text('No matches', style: theme.textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary)))
                : ListView(controller: controller, padding: const EdgeInsets.only(bottom: Spacing.xl), children: rows),
          ),
        ],
      ),
    );
  }

  Widget _tile(BuildContext context,
      {Widget? leading, required String label, String? subtitle, required bool selected, required VoidCallback onTap}) {
    return ListTile(
      leading: leading,
      title: Text(label, style: TextStyle(fontWeight: selected ? FontWeight.w700 : FontWeight.w500)),
      subtitle: subtitle == null ? null : Text(subtitle),
      trailing: selected ? const Icon(Icons.check_circle_rounded, color: AppColors.primary) : null,
      selected: selected,
      selectedColor: AppColors.textPrimary,
      onTap: onTap,
    );
  }
}

/// Read-only field that opens a picker; looks like a text field.
class PickerField extends StatelessWidget {
  const PickerField({
    super.key,
    required this.label,
    required this.value,
    required this.onTap,
    this.icon,
    this.errorText,
    this.helperText,
    this.placeholder = 'Select',
    this.enabled = true,
    this.leading,
    this.showChevron = true,
  });

  final String label;
  final String? value;
  final VoidCallback onTap;
  final IconData? icon;
  final String? errorText;
  final String? helperText;
  final String placeholder;
  final bool enabled;
  final Widget? leading;

  /// Hide the dropdown chevron to give the value more room.
  final bool showChevron;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: '$label: ${value ?? placeholder}',
      child: InkWell(
        borderRadius: BorderRadius.circular(Radii.control),
        onTap: enabled ? onTap : null,
        child: InputDecorator(
          isEmpty: value == null,
          decoration: InputDecoration(
            labelText: label,
            prefixIcon: leading == null && icon != null ? Icon(icon) : null,
            prefix: leading,
            suffixIcon: showChevron ? const Icon(Icons.expand_more_rounded) : null,
            errorText: errorText,
            helperText: helperText,
            enabled: enabled,
          ),
          child: Text(
            value ?? '',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodyLarge,
          ),
        ),
      ),
    );
  }
}
