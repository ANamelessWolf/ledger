import 'dart:io';

import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ledger_mobile/core/database/app_database.dart';
import 'package:ledger_mobile/features/catalogs/data/catalog_repository.dart';
import 'package:ledger_mobile/features/catalogs/domain/catalog_models.dart';
import 'package:ledger_mobile/features/expenses/application/expense_sorter.dart';
import 'package:ledger_mobile/features/expenses/application/expense_view_mapper.dart';
import 'package:ledger_mobile/features/expenses/data/expense_repository.dart';
import 'package:ledger_mobile/features/expenses/domain/expense_filter.dart';
import 'package:ledger_mobile/core/utilities/iso_date.dart';

import 'helpers/test_data.dart';

void main() {
  group('expense sorting', () {
    late List<int?> Function(ExpenseSort) order;

    setUp(() async {
      final db = openTestDatabase();
      addTearDown(db.close);
      final repo = ExpenseRepository(db, clock: fixedNow);
      await CatalogRepository(db).replaceAll(testSnapshot());
      await repo.reconcileRemote([
        remoteExpense(1, total: 500, walletId: 7, buyDate: '2026-10-05'), // 500 MXN
        remoteExpense(2, total: 100, walletId: 24, buyDate: '2026-10-01'), // 1731 MXN
        remoteExpense(3, total: 50, walletId: 30, buyDate: '2026-10-09'), // 50 MXN
        remoteExpense(4, total: 10, walletId: 999, buyDate: '2026-10-07'), // not convertible
      ]);
      final views = const ExpenseViewMapper().mapAll(
        await repo.getFiltered(ExpenseFilter(range: const DateRange('2026-10-01', '2026-10-31'))),
        testCatalogs(),
      );
      order = (sort) => const ExpenseSorter().sort(views, sort).map((v) => v.expense.remoteId).toList();
    });

    test('default is date descending', () {
      expect(ExpenseFilter.currentMonth(fixedNow()).sort, ExpenseSort.defaultSort);
      expect(order(const ExpenseSort()), [3, 4, 1, 2]);
    });

    test('date ascending', () {
      expect(order(const ExpenseSort(descending: false)), [2, 1, 4, 3]);
    });

    test('total uses the normalized amount; unconvertible expenses go last', () {
      expect(order(const ExpenseSort(field: ExpenseSortField.amount)), [2, 1, 3, 4]);
      expect(order(const ExpenseSort(field: ExpenseSortField.amount, descending: false)), [3, 1, 2, 4]);
    });
  });

  group('credit card filter for wallet groups', () {
    Catalogs withCards(List<CreditCard> cards) {
      final s = testSnapshot();
      return Catalogs(
        currencies: s.currencies,
        walletGroups: s.walletGroups,
        wallets: s.wallets,
        walletMembers: s.walletMembers,
        expenseTypes: s.expenseTypes,
        vendors: s.vendors,
        creditCards: cards,
      );
    }

    bool selectable(Catalogs c, String key) => c.accountByKey(key)!.isSelectable;

    test('groups without a credit card stay selectable', () {
      expect(selectable(withCards(const []), 'group:5'), isTrue);
    });

    test('a group whose credit card is active (1) is selectable', () {
      expect(selectable(withCards(const [CreditCard(id: 6, walletGroupId: 5, active: 1)]), 'group:5'), isTrue);
    });

    test('a group whose credit card is not active (0 or 2) is hidden', () {
      expect(selectable(withCards(const [CreditCard(id: 6, walletGroupId: 5, active: 0)]), 'group:5'), isFalse);
      expect(selectable(withCards(const [CreditCard(id: 6, walletGroupId: 5, active: 2)]), 'group:5'), isFalse);
    });

    test('only the group of the inactive card is affected', () {
      final c = withCards(const [CreditCard(id: 6, walletGroupId: 5, active: 2)]);
      expect(selectable(c, 'group:9'), isTrue);
      expect(selectable(c, 'wallet:40'), isTrue);
    });

    test('credit cards are stored and reloaded with the catalogs', () async {
      final db = openTestDatabase();
      addTearDown(db.close);
      final s = testSnapshot();
      await CatalogRepository(db).replaceAll(CatalogSnapshot(
        currencies: s.currencies,
        walletGroups: s.walletGroups,
        wallets: s.wallets,
        walletMembers: s.walletMembers,
        expenseTypes: s.expenseTypes,
        vendors: s.vendors,
        creditCards: const [CreditCard(id: 6, walletGroupId: 5, active: 2)],
      ));
      final loaded = await CatalogRepository(db).load();
      expect(loaded.creditCards.single.walletGroupId, 5);
      expect(loaded.accountByKey('group:5')!.isSelectable, isFalse);
    });
  });

  test('upgrading a v1 database adds the credit card table and keeps the data', () async {
    final dir = await Directory.systemTemp.createTemp('ledger_migration');
    addTearDown(() => dir.delete(recursive: true));
    final file = File('${dir.path}/ledger.sqlite');

    // Create a current database with data, then turn it back into "v1".
    final v2 = AppDatabase(NativeDatabase(file));
    await CatalogRepository(v2).replaceAll(testSnapshot());
    await ExpenseRepository(v2, clock: fixedNow).createLocal(validExpense());
    await v2.close();
    final asV1 = AppDatabase(NativeDatabase(file, setup: (raw) {
      raw.execute('DROP TABLE credit_cards');
      raw.execute('PRAGMA user_version = 1');
    }));
    await asV1.close();

    final upgraded = AppDatabase(NativeDatabase(file));
    addTearDown(upgraded.close);
    final catalogs = await CatalogRepository(upgraded).load();
    expect(catalogs.creditCards, isEmpty);
    expect(catalogs.wallets, hasLength(4));
    expect((await ExpenseRepository(upgraded).pendingUploads()), hasLength(1));
  });
}
