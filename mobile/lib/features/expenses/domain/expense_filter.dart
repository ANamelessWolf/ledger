import '../../../core/utilities/iso_date.dart';

/// Field used to order the expense list.
enum ExpenseSortField {
  /// Purchase date (`buy_date`).
  date('Date'),

  /// Amount normalized to the default currency, so expenses in different
  /// currencies are comparable.
  amount('Amount');

  const ExpenseSortField(this.label);
  final String label;
}

/// Order of the expense list. Default: date, newest first.
class ExpenseSort {
  const ExpenseSort({this.field = ExpenseSortField.date, this.descending = true});

  static const defaultSort = ExpenseSort();

  final ExpenseSortField field;
  final bool descending;

  bool get isDefault => this == defaultSort;

  /// Short label, e.g. `Amount ↓`.
  String get label => '${field.label} ${descending ? '↓' : '↑'}';

  ExpenseSort copyWith({ExpenseSortField? field, bool? descending}) =>
      ExpenseSort(field: field ?? this.field, descending: descending ?? this.descending);

  @override
  bool operator ==(Object other) => other is ExpenseSort && other.field == field && other.descending == descending;

  @override
  int get hashCode => Object.hash(field, descending);
}

/// Local filter applied to both the dashboard and the expense list.
class ExpenseFilter {
  const ExpenseFilter({
    required this.range,
    this.walletId,
    this.vendorId,
    this.expenseTypeId,
    this.sort = ExpenseSort.defaultSort,
  });

  /// Default filter: the current calendar month, no other criteria.
  factory ExpenseFilter.currentMonth(DateTime now) => ExpenseFilter(range: DateRange.month(now));

  /// Inclusive `YYYY-MM-DD` range.
  final DateRange range;
  final int? walletId;
  final int? vendorId;
  final int? expenseTypeId;

  /// Order of the expense list (does not affect the dashboard totals).
  final ExpenseSort sort;

  /// Number of criteria besides the date range.
  int get activeCriteriaCount => [walletId, vendorId, expenseTypeId].where((v) => v != null).length;

  ExpenseFilter copyWith({
    DateRange? range,
    int? Function()? walletId,
    int? Function()? vendorId,
    int? Function()? expenseTypeId,
    ExpenseSort? sort,
  }) =>
      ExpenseFilter(
        range: range ?? this.range,
        walletId: walletId != null ? walletId() : this.walletId,
        vendorId: vendorId != null ? vendorId() : this.vendorId,
        expenseTypeId: expenseTypeId != null ? expenseTypeId() : this.expenseTypeId,
        sort: sort ?? this.sort,
      );

  @override
  bool operator ==(Object other) =>
      other is ExpenseFilter &&
      other.range == range &&
      other.walletId == walletId &&
      other.vendorId == vendorId &&
      other.expenseTypeId == expenseTypeId &&
      other.sort == sort;

  @override
  int get hashCode => Object.hash(range, walletId, vendorId, expenseTypeId, sort);
}
