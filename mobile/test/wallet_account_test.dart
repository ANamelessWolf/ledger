import 'package:flutter_test/flutter_test.dart';
import 'package:ledger_mobile/features/catalogs/domain/catalog_models.dart';

import 'helpers/test_data.dart';

void main() {
  final catalogs = testCatalogs();

  test('the form lists wallet groups, not individual wallets', () {
    final labels = catalogs.walletAccounts.map((a) => a.label).toList();
    expect(labels, ['AMEX Platinum', 'Santander', 'Travel EUR']);
    // Wallets of a group are not listed on their own.
    expect(labels, isNot(contains('AMEX Platinum USD')));
  });

  test('a group exposes one wallet per currency, default currency first', () {
    final amex = catalogs.accountByKey('group:5')!;
    expect(amex.currencies.map((c) => c.symbol), ['MXN', 'USD']);
    expect(amex.defaultWallet.wallet.id, 7); // MXN
  });

  test('group + currency resolves to the wallet id sent to Ledger', () {
    final amex = catalogs.accountByKey('group:5')!;
    expect(amex.resolve(usd.id).wallet.id, 24);
    expect(amex.resolve(mxn.id).wallet.id, 7);
    expect(amex.resolve(null).wallet.id, 7);
  });

  test('changing to a group without the chosen currency falls back to the default', () {
    final santander = catalogs.accountByKey('group:9')!;
    expect(santander.walletForCurrency(usd.id), isNull);
    expect(santander.resolve(usd.id).wallet.id, 30); // MXN default
  });

  test('a wallet without a group is still selectable on its own', () {
    final travel = catalogs.accountByKey('wallet:40')!;
    expect(travel.group, isNull);
    expect(travel.resolve(null).wallet.id, 40);
  });

  test('groups without wallets are skipped and inactive groups are not selectable', () {
    expect(catalogs.accountByKey('group:6'), isNull); // inactive and empty
    final inactive = Catalogs(
      currencies: const [mxn],
      walletGroups: const [WalletGroup(id: 1, name: 'Old card', isActive: false)],
      wallets: const [Wallet(id: 1, name: 'Old card MXN', currencyId: 2)],
      walletMembers: const [WalletMember(id: 1, walletId: 1, walletGroupId: 1)],
      expenseTypes: const [],
      vendors: const [],
    );
    expect(inactive.walletAccounts.single.isSelectable, isFalse);
  });

  test('editing finds the account of an existing wallet', () {
    expect(catalogs.accountOfWallet(24)!.key, 'group:5');
    expect(catalogs.accountOfWallet(40)!.key, 'wallet:40');
  });
}
