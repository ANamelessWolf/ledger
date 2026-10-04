import 'package:intl/intl.dart';

import '../utilities/iso_date.dart';

/// Money and date formatting. Values are always stored as numbers / ISO
/// strings; these helpers only produce display text.
abstract final class Formatters {
  // Mexican conventions: comma thousands separator, dot decimals (1,250.00).
  static final NumberFormat _amount = NumberFormat('#,##0.00', 'en_US');
  static final NumberFormat _compact = NumberFormat.compact(locale: 'en_US');
  static final NumberFormat _factor = NumberFormat('#,##0.######', 'en_US');

  /// `1250.5` → `1,250.50`.
  static String amount(num value) => _amount.format(value);

  /// `1250.5, 'MXN'` → `$1,250.50 MXN`.
  static String money(num value, String currencySymbol) {
    final sign = value < 0 ? '-' : '';
    return '$sign\$${_amount.format(value.abs())} $currencySymbol'.trim();
  }

  /// Short form for chart labels: `$12.3K`.
  static String compactMoney(num value) => '\$${_compact.format(value)}';

  /// Conversion factor without trailing zeros: `17.31`.
  static String factor(num value) => _factor.format(value);

  /// Parses user input like `1,250.50` into a number; null when invalid.
  static double? parseAmount(String input) {
    final cleaned = input.replaceAll(',', '').replaceAll(r'$', '').trim();
    if (cleaned.isEmpty) return null;
    return double.tryParse(cleaned);
  }

  /// `2026-10-03` → `Oct 3, 2026` in the device locale.
  static String date(String isoDate, {String? locale}) {
    final parsed = IsoDate.tryParse(isoDate);
    if (parsed == null) return isoDate;
    return DateFormat.yMMMd(locale).format(parsed);
  }

  /// `2026-10-03` → `Saturday, October 3, 2026`.
  static String longDate(String isoDate, {String? locale}) {
    final parsed = IsoDate.tryParse(isoDate);
    if (parsed == null) return isoDate;
    return DateFormat.yMMMMEEEEd(locale).format(parsed);
  }

  /// Day header for grouped lists: `Sat, Oct 3`.
  static String dayHeader(String isoDate, {String? locale}) {
    final parsed = IsoDate.tryParse(isoDate);
    if (parsed == null) return isoDate;
    return DateFormat.MMMEd(locale).format(parsed);
  }

  /// Relative timestamp for "last sync".
  static String timestamp(DateTime value, {DateTime? now}) {
    final reference = now ?? DateTime.now();
    final diff = reference.difference(value);
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
    if (diff.inHours < 24 && reference.day == value.day) return 'Today, ${DateFormat.jm().format(value)}';
    return DateFormat.yMMMd().add_jm().format(value);
  }
}
