import '../domain/expense.dart';
import '../domain/expense_filter.dart';

/// Orders expense views for the Home list.
///
/// - Date: `buy_date`, then Ledger's `sort_id`, then local id.
/// - Amount: normalized value (default currency); expenses that cannot be
///   converted always go last. Ties fall back to newest date first.
class ExpenseSorter {
  const ExpenseSorter();

  List<ExpenseView> sort(List<ExpenseView> views, ExpenseSort sort) {
    final sign = sort.descending ? -1 : 1;
    int byDate(ExpenseView a, ExpenseView b) {
      final date = a.expense.buyDate.compareTo(b.expense.buyDate);
      if (date != 0) return date;
      // Within a day keep Ledger's manual order (sort_id ascending), mirrored
      // for descending so a reversed list reads naturally.
      final sortId = b.expense.sortId.compareTo(a.expense.sortId);
      if (sortId != 0) return sortId;
      return a.expense.id.compareTo(b.expense.id);
    }

    final sorted = [...views];
    switch (sort.field) {
      case ExpenseSortField.date:
        sorted.sort((a, b) => sign * byDate(a, b));
      case ExpenseSortField.amount:
        sorted.sort((a, b) {
          final av = a.normalizedValue, bv = b.normalizedValue;
          if (av == null || bv == null) {
            if (av == null && bv == null) return -byDate(a, b);
            return av == null ? 1 : -1;
          }
          final amount = sign * av.compareTo(bv);
          return amount != 0 ? amount : -byDate(a, b);
        });
    }
    return sorted;
  }
}
