import 'package:drift/native.dart';
import 'package:ledger_mobile/core/database/app_database.dart';
import 'package:ledger_mobile/features/catalogs/domain/catalog_models.dart';
import 'package:ledger_mobile/features/expenses/domain/expense_draft.dart';
import 'package:ledger_mobile/features/expenses/domain/remote_expense.dart';

/// Fixed "now" for every test: October 3rd 2026 → window Aug 1 .. Oct 31.
DateTime fixedNow() => DateTime(2026, 10, 3, 12);

AppDatabase openTestDatabase() => AppDatabase(NativeDatabase.memory());

const mxn = Currency(id: 2, name: 'Peso Mexicano', symbol: 'MXN', conversion: 1);
const usd = Currency(id: 1, name: 'Dólar', symbol: 'USD', conversion: 17.31);
const eur = Currency(id: 6, name: 'Euro', symbol: 'EUR', conversion: 20.13);

/// Wallet 7 (MXN) and 24 (USD) belong to group 5 "AMEX Platinum";
/// wallet 30 (MXN) belongs to group 9 "Santander"; wallet 40 (EUR) has no group.
CatalogSnapshot testSnapshot() => const CatalogSnapshot(
      currencies: [mxn, usd, eur],
      walletGroups: [
        WalletGroup(id: 5, name: 'AMEX Platinum', isActive: true),
        WalletGroup(id: 9, name: 'Santander', isActive: true),
        WalletGroup(id: 6, name: 'AMEX Payback', isActive: false),
      ],
      wallets: [
        Wallet(id: 7, name: 'AMEX Platinum MXN', currencyId: 2),
        Wallet(id: 24, name: 'AMEX Platinum USD', currencyId: 1),
        Wallet(id: 30, name: 'Santander MXN', currencyId: 2),
        Wallet(id: 40, name: 'Travel EUR', currencyId: 6),
      ],
      walletMembers: [
        WalletMember(id: 1, walletId: 7, walletGroupId: 5),
        WalletMember(id: 2, walletId: 24, walletGroupId: 5),
        WalletMember(id: 3, walletId: 30, walletGroupId: 9),
      ],
      expenseTypes: [
        ExpenseType(id: 3, name: 'Food', icon: 'set_meal'),
        ExpenseType(id: 52, name: 'Subscriptions', icon: 'local_activity'),
      ],
      vendors: [
        Vendor(id: 23, name: 'Google'),
        Vendor(id: 31, name: 'Izzi'),
        Vendor(id: 40, name: 'Restaurant XYZ'),
      ],
    );

Catalogs testCatalogs() {
  final s = testSnapshot();
  return Catalogs(
    currencies: s.currencies,
    walletGroups: s.walletGroups,
    wallets: s.wallets,
    walletMembers: s.walletMembers,
    expenseTypes: s.expenseTypes,
    vendors: s.vendors,
    creditCards: s.creditCards,
  );
}

ValidExpense validExpense({
  int walletId = 7,
  double total = 100,
  double? currencyFactor,
  String buyDate = '2026-10-02',
  String description = 'Lunch',
  int vendorId = 40,
  int expenseTypeId = 3,
}) =>
    ValidExpense(
      walletId: walletId,
      expenseTypeId: expenseTypeId,
      vendorId: vendorId,
      description: description,
      total: total,
      currencyFactor: currencyFactor,
      buyDate: buyDate,
    );

RemoteExpense remoteExpense(
  int id, {
  String buyDate = '2026-10-01',
  double total = 50,
  int walletId = 30,
  int vendorId = 23,
  int expenseTypeId = 52,
  String description = 'Remote expense',
  double? currencyFactor,
}) =>
    RemoteExpense(
      id: id,
      walletId: walletId,
      expenseTypeId: expenseTypeId,
      vendorId: vendorId,
      description: description,
      total: total,
      currencyFactor: currencyFactor,
      buyDate: buyDate,
      sortId: 0,
    );
