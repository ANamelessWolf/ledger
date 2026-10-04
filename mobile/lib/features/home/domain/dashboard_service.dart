import '../../expenses/domain/expense.dart';

/// One ranked group (vendor, expense type or wallet group).
class DashboardEntry {
  const DashboardEntry({required this.key, required this.label, required this.value, required this.count, this.icon});

  final String key;
  final String label;

  /// Sum of normalized values, in the default currency.
  final double value;
  final int count;
  final String? icon;
}

/// Every dashboard widget, computed from one filtered dataset.
class DashboardData {
  const DashboardData({
    required this.total,
    required this.expenseCount,
    required this.pendingCount,
    required this.unconvertedCount,
    required this.topVendors,
    required this.topExpenseTypes,
    required this.topExpenses,
    required this.byWalletGroup,
  });

  /// Sum of positive normalized values.
  final double total;
  final int expenseCount;

  /// Expenses in the dataset not yet acknowledged by Ledger.
  final int pendingCount;

  /// Expenses excluded from totals because they could not be converted.
  final int unconvertedCount;
  final List<DashboardEntry> topVendors;
  final List<DashboardEntry> topExpenseTypes;
  final List<ExpenseView> topExpenses;
  final List<DashboardEntry> byWalletGroup;

  static const empty = DashboardData(
    total: 0,
    expenseCount: 0,
    pendingCount: 0,
    unconvertedCount: 0,
    topVendors: [],
    topExpenseTypes: [],
    topExpenses: [],
    byWalletGroup: [],
  );
}

/// Pure dashboard aggregation. All widgets read from [build] so they always
/// agree on filter, normalization and wallet-group mapping.
///
/// Like the web dashboard, non-positive normalized values are excluded from
/// the sums and rankings.
class DashboardService {
  const DashboardService({this.topN = 10});

  final int topN;

  DashboardData build(List<ExpenseView> expenses) {
    var total = 0.0;
    var unconverted = 0;
    var pending = 0;
    final vendors = <String, _Accumulator>{};
    final types = <String, _Accumulator>{};
    final groups = <String, _Accumulator>{};
    final ranked = <ExpenseView>[];

    for (final view in expenses) {
      if (view.expense.syncStatus.needsUpload) pending++;
      final value = view.normalizedValue;
      if (value == null) {
        unconverted++;
        continue;
      }
      if (value <= 0) continue;
      total += value;
      ranked.add(view);
      vendors.putIfAbsent('${view.expense.vendorId}', () => _Accumulator(view.vendorName)).add(value);
      types
          .putIfAbsent('${view.expense.expenseTypeId}', () => _Accumulator(view.expenseTypeName, view.expenseTypeIcon))
          .add(value);
      groups.putIfAbsent(view.walletGroupName, () => _Accumulator(view.walletGroupName)).add(value);
    }

    ranked.sort((a, b) {
      final byValue = b.normalizedValue!.compareTo(a.normalizedValue!);
      return byValue != 0 ? byValue : b.expense.buyDate.compareTo(a.expense.buyDate);
    });

    return DashboardData(
      total: total,
      expenseCount: expenses.length,
      pendingCount: pending,
      unconvertedCount: unconverted,
      topVendors: _top(vendors),
      topExpenseTypes: _top(types),
      topExpenses: ranked.take(topN).toList(growable: false),
      byWalletGroup: _top(groups, limit: null),
    );
  }

  List<DashboardEntry> _top(Map<String, _Accumulator> groups, {int? limit = -1}) {
    final entries = groups.entries
        .map((e) => DashboardEntry(
              key: e.key,
              label: e.value.label,
              value: e.value.sum,
              count: e.value.count,
              icon: e.value.icon,
            ))
        .toList()
      ..sort((a, b) {
        final byValue = b.value.compareTo(a.value);
        return byValue != 0 ? byValue : a.label.compareTo(b.label);
      });
    final max = limit == -1 ? topN : limit;
    return max == null ? entries : entries.take(max).toList(growable: false);
  }
}

class _Accumulator {
  _Accumulator(this.label, [this.icon]);

  final String label;
  final String? icon;
  double sum = 0;
  int count = 0;

  void add(double value) {
    sum += value;
    count++;
  }
}
