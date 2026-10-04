import 'package:flutter_test/flutter_test.dart';
import 'package:ledger_mobile/core/utilities/iso_date.dart';
import 'package:ledger_mobile/features/expenses/application/expense_view_mapper.dart';
import 'package:ledger_mobile/features/expenses/data/expense_repository.dart';
import 'package:ledger_mobile/features/expenses/domain/expense_filter.dart';
import 'package:ledger_mobile/features/catalogs/data/catalog_repository.dart';
import 'package:ledger_mobile/features/home/domain/dashboard_service.dart';

import 'helpers/test_data.dart';

void main() {
  const service = DashboardService();
  const mapper = ExpenseViewMapper();

  late ExpenseRepository expenses;

  setUp(() async {
    final db = openTestDatabase();
    addTearDown(db.close);
    expenses = ExpenseRepository(db, clock: fixedNow);
    await CatalogRepository(db).replaceAll(testSnapshot());
    await expenses.reconcileRemote([
      // vendor 23 Google / type 52 Subscriptions / wallet 30 (Santander, MXN)
      remoteExpense(1, total: 159, walletId: 30, vendorId: 23, expenseTypeId: 52, buyDate: '2026-10-26'),
      // USD wallet in AMEX Platinum group, catalog conversion 17.31 → 1731
      remoteExpense(2, total: 100, walletId: 24, vendorId: 40, expenseTypeId: 3, buyDate: '2026-10-10'),
      // USD with its own factor 20 → 2000
      remoteExpense(3, total: 100, walletId: 24, vendorId: 40, expenseTypeId: 3, currencyFactor: 20, buyDate: '2026-10-11'),
      // MXN AMEX Platinum → 590
      remoteExpense(4, total: 590, walletId: 7, vendorId: 31, expenseTypeId: 52, buyDate: '2026-10-22'),
      // EUR wallet without group → 2 * 20.13 = 40.26
      remoteExpense(5, total: 2, walletId: 40, vendorId: 23, expenseTypeId: 52, buyDate: '2026-10-05'),
      // September: excluded by the filter
      remoteExpense(6, total: 100000, walletId: 7, vendorId: 31, expenseTypeId: 3, buyDate: '2026-09-30'),
    ]);
  });

  Future<DashboardData> dashboard(ExpenseFilter filter) async {
    final rows = await expenses.getFiltered(filter);
    return service.build(mapper.mapAll(rows, testCatalogs()));
  }

  final october = ExpenseFilter(range: const DateRange('2026-10-01', '2026-10-31'));

  test('total uses normalized values', () async {
    final d = await dashboard(october);
    expect(d.expenseCount, 5);
    expect(d.total, closeTo(159 + 1731 + 2000 + 590 + 40.26, 1e-6));
  });

  test('top vendors are grouped, normalized and sorted descending', () async {
    final d = await dashboard(october);
    expect(d.topVendors.map((e) => e.label), ['Restaurant XYZ', 'Izzi', 'Google']);
    expect(d.topVendors.first.value, closeTo(3731, 1e-6));
    expect(d.topVendors.last.value, closeTo(199.26, 1e-6));
  });

  test('top expense types', () async {
    final d = await dashboard(october);
    expect(d.topExpenseTypes.map((e) => e.label), ['Food', 'Subscriptions']);
    expect(d.topExpenseTypes.first.value, closeTo(3731, 1e-6));
    expect(d.topExpenseTypes.first.icon, 'set_meal');
  });

  test('top expenses rank individual expenses by normalized value', () async {
    final d = await dashboard(october);
    expect(d.topExpenses.map((e) => e.expense.remoteId), [3, 2, 4, 1, 5]);
  });

  test('wallet totals are grouped by wallet group, not by wallet', () async {
    final d = await dashboard(october);
    final byGroup = {for (final e in d.byWalletGroup) e.label: e.value};
    expect(byGroup['AMEX Platinum'], closeTo(1731 + 2000 + 590, 1e-6)); // MXN + USD wallets together
    expect(byGroup['Santander'], closeTo(159, 1e-6));
    expect(byGroup['Travel EUR'], closeTo(40.26, 1e-6)); // no group → wallet name
  });

  test('filters change every widget consistently', () async {
    final d = await dashboard(october.copyWith(walletId: () => 24));
    expect(d.expenseCount, 2);
    expect(d.total, closeTo(3731, 1e-6));
    expect(d.topVendors.single.value, closeTo(d.total, 1e-6));
    expect(d.topExpenseTypes.single.value, closeTo(d.total, 1e-6));
    expect(d.byWalletGroup.single.value, closeTo(d.total, 1e-6));
  });

  test('top lists are limited to 10', () async {
    final many = DashboardService(topN: 2);
    final rows = await expenses.getFiltered(october);
    final d = many.build(mapper.mapAll(rows, testCatalogs()));
    expect(d.topExpenses, hasLength(2));
    expect(d.topVendors, hasLength(2));
  });

  test('pending local expenses count in the dashboard', () async {
    await expenses.createLocal(validExpense(total: 10, buyDate: '2026-10-03'));
    final d = await dashboard(october);
    expect(d.pendingCount, 1);
    expect(d.expenseCount, 6);
  });
}
