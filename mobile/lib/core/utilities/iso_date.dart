/// Date-only helpers. Expense dates are stored and exchanged as `YYYY-MM-DD`
/// strings and never go through timezone conversion.
abstract final class IsoDate {
  static final RegExp _pattern = RegExp(r'^(\d{4})-(\d{2})-(\d{2})$');

  /// Formats the calendar date of [date] as `YYYY-MM-DD` (time is ignored).
  static String format(DateTime date) {
    final y = date.year.toString().padLeft(4, '0');
    final m = date.month.toString().padLeft(2, '0');
    final d = date.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }

  /// Parses a `YYYY-MM-DD` string into a local midnight [DateTime].
  /// Returns null when the value is not a real calendar date.
  static DateTime? tryParse(String value) {
    final match = _pattern.firstMatch(value);
    if (match == null) return null;
    final year = int.parse(match.group(1)!);
    final month = int.parse(match.group(2)!);
    final day = int.parse(match.group(3)!);
    final date = DateTime(year, month, day);
    if (date.year != year || date.month != month || date.day != day) return null;
    return date;
  }

  /// Like [tryParse] but throws [FormatException] for invalid input.
  static DateTime parse(String value) =>
      tryParse(value) ?? (throw FormatException('Invalid YYYY-MM-DD date', value));

  /// True when [value] is a valid `YYYY-MM-DD` date.
  static bool isValid(String value) => tryParse(value) != null;
}

/// An inclusive date-only range, `start..end`, both `YYYY-MM-DD`.
class DateRange {
  const DateRange(this.start, this.end);

  final String start;
  final String end;

  /// Just the calendar day of [date].
  factory DateRange.day(DateTime date) {
    final day = IsoDate.format(date);
    return DateRange(day, day);
  }

  /// First to last day of the month containing [date].
  factory DateRange.month(DateTime date) {
    final first = DateTime(date.year, date.month, 1);
    final last = DateTime(date.year, date.month + 1, 0);
    return DateRange(IsoDate.format(first), IsoDate.format(last));
  }

  /// The synchronization window: the current month plus the two previous
  /// calendar months (e.g. October → August 1 .. October 31).
  factory DateRange.syncWindow(DateTime now) {
    final first = DateTime(now.year, now.month - 2, 1);
    final last = DateTime(now.year, now.month + 1, 0);
    return DateRange(IsoDate.format(first), IsoDate.format(last));
  }

  /// True when [isoDate] is inside the range (string comparison is valid for ISO dates).
  bool contains(String isoDate) => isoDate.compareTo(start) >= 0 && isoDate.compareTo(end) <= 0;

  @override
  bool operator ==(Object other) => other is DateRange && other.start == start && other.end == end;

  @override
  int get hashCode => Object.hash(start, end);

  @override
  String toString() => '$start..$end';
}
