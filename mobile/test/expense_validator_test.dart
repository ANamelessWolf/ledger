import 'package:flutter_test/flutter_test.dart';
import 'package:ledger_mobile/features/expenses/domain/expense_draft.dart';

import 'helpers/test_data.dart';

void main() {
  const validator = ExpenseValidator();
  final catalogs = testCatalogs();

  ExpenseDraft draft({
    int? walletId = 7,
    int? expenseTypeId = 3,
    int? vendorId = 40,
    String description = 'Dinner',
    double? total = 1250,
    double? currencyFactor,
    String? buyDate = '2026-10-03',
  }) =>
      ExpenseDraft(
        walletId: walletId,
        expenseTypeId: expenseTypeId,
        vendorId: vendorId,
        description: description,
        total: total,
        currencyFactor: currencyFactor,
        buyDate: buyDate,
      );

  Map<ExpenseField, String> errorsOf(ExpenseDraft d) => validator.validate(d, catalogs: catalogs).errors;

  test('accepts a complete draft', () {
    final result = validator.validate(draft(), catalogs: catalogs);
    expect(result.isValid, isTrue);
    expect(result.value!.description, 'Dinner');
  });

  test('empty description', () {
    expect(errorsOf(draft(description: '   ')), contains(ExpenseField.description));
  });

  test('description longer than 120 characters', () {
    expect(errorsOf(draft(description: 'a' * 121)), contains(ExpenseField.description));
    expect(errorsOf(draft(description: 'a' * 120)), isNot(contains(ExpenseField.description)));
  });

  test('total <= 0', () {
    expect(errorsOf(draft(total: 0)), contains(ExpenseField.total));
    expect(errorsOf(draft(total: -1)), contains(ExpenseField.total));
    expect(errorsOf(draft(total: null)), contains(ExpenseField.total));
  });

  test('missing wallet', () => expect(errorsOf(draft(walletId: null)), contains(ExpenseField.wallet)));
  test('missing vendor', () => expect(errorsOf(draft(vendorId: null)), contains(ExpenseField.vendor)));
  test('missing expense type', () => expect(errorsOf(draft(expenseTypeId: null)), contains(ExpenseField.expenseType)));
  test('missing date', () => expect(errorsOf(draft(buyDate: null)), contains(ExpenseField.buyDate)));
  test('invalid date', () => expect(errorsOf(draft(buyDate: '2026-02-30')), contains(ExpenseField.buyDate)));

  test('wallet not in the cached catalog', () {
    expect(errorsOf(draft(walletId: 999)), contains(ExpenseField.wallet));
  });

  test('non-positive currency factor', () {
    expect(errorsOf(draft(walletId: 24, currencyFactor: 0)), contains(ExpenseField.currencyFactor));
  });

  test('factor is kept for a non-default currency and dropped for the default one', () {
    expect(validator.validate(draft(walletId: 24, currencyFactor: 18.2), catalogs: catalogs).value!.currencyFactor, 18.2);
    expect(validator.validate(draft(walletId: 7, currencyFactor: 18.2), catalogs: catalogs).value!.currencyFactor, isNull);
  });

  test('trims the description', () {
    expect(validator.validate(draft(description: '  Taxi  '), catalogs: catalogs).value!.description, 'Taxi');
  });
}
