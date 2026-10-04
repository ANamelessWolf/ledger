import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers.dart';
import '../catalogs/catalog_providers.dart';
import '../expenses/application/expense_sorter.dart';
import '../expenses/domain/expense.dart';
import '../expenses/domain/expense_filter.dart';
import '../expenses/expense_providers.dart';
import 'domain/dashboard_service.dart';

/// Session-scoped filter shared by the dashboard and the expense list.
/// Defaults to the current calendar month; not persisted across restarts.
class ExpenseFilterNotifier extends Notifier<ExpenseFilter> {
  @override
  ExpenseFilter build() => ExpenseFilter.currentMonth(ref.read(clockProvider)());

  void apply(ExpenseFilter filter) => state = filter;

  void reset() => state = ExpenseFilter.currentMonth(ref.read(clockProvider)());
}

final expenseFilterProvider = NotifierProvider<ExpenseFilterNotifier, ExpenseFilter>(ExpenseFilterNotifier.new);

final expenseSorterProvider = Provider<ExpenseSorter>((ref) => const ExpenseSorter());

/// The filtered dataset, queried from SQLite and kept live: saving, deleting
/// or synchronizing expenses updates it automatically. Ordered by the
/// filter's sort (amount sorting needs the normalized value, so it happens
/// after mapping rather than in SQL).
final filteredExpensesProvider = StreamProvider<List<ExpenseView>>((ref) async* {
  final filter = ref.watch(expenseFilterProvider);
  final catalogs = await ref.watch(catalogsProvider.future);
  final mapper = ref.watch(expenseViewMapperProvider);
  final sorter = ref.watch(expenseSorterProvider);
  yield* ref
      .watch(expenseRepositoryProvider)
      .watchFiltered(filter)
      .map((list) => sorter.sort(mapper.mapAll(list, catalogs), filter.sort));
});

final dashboardServiceProvider = Provider<DashboardService>((ref) => const DashboardService());

/// Every dashboard widget, derived from [filteredExpensesProvider].
final dashboardProvider = Provider<AsyncValue<DashboardData>>((ref) {
  final service = ref.watch(dashboardServiceProvider);
  return ref.watch(filteredExpensesProvider).whenData(service.build);
});
