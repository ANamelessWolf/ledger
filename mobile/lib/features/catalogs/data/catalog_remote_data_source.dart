import 'package:flutter/foundation.dart';

import '../../../core/errors/app_exception.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/json_reader.dart';
import '../domain/catalog_models.dart';

/// Downloads catalogs from Ledger.
abstract interface class CatalogRemoteDataSource {
  /// Downloads every catalog required to create and display expenses.
  Future<CatalogSnapshot> fetchSnapshot();
}

/// [CatalogRemoteDataSource] over the existing Ledger endpoints:
///
/// - `GET /wallet/currencies` — raw currency name + conversion
/// - `GET /wallet/all` — wallets with their currency
/// - `GET /wallet/groups` and `GET /wallet/groups/:id` — groups and memberships
/// - `GET /catalog/expenseTypes`, `GET /catalog/vendors`
/// - `GET /catalog/credit-cards` — to hide groups whose credit card is inactive
///
/// There is no bulk membership endpoint, so memberships are read group by group.
class LedgerCatalogRemoteDataSource implements CatalogRemoteDataSource {
  LedgerCatalogRemoteDataSource(this._client);

  final ApiClient _client;

  @override
  Future<CatalogSnapshot> fetchSnapshot() async {
    final results = await Future.wait([
      _client.get('/wallet/currencies'),
      _client.get('/wallet/all'),
      _client.get('/wallet/groups'),
      _client.get('/catalog/expenseTypes'),
      _client.get('/catalog/vendors'),
    ]);

    final currencies = JsonReader.list(results[0], 'currencies').map((raw) {
      final j = JsonReader.map(raw, 'currency');
      return Currency(
        id: JsonReader.integer(j, 'id', 'currency'),
        name: JsonReader.string(j, 'name', 'currency'),
        symbol: JsonReader.string(j, 'symbol', 'currency'),
        conversion: JsonReader.number(j, 'conversion', 'currency'),
      );
    }).toList();

    final wallets = JsonReader.list(results[1], 'wallets').map((raw) {
      final j = JsonReader.map(raw, 'wallet');
      return Wallet(
        id: JsonReader.integer(j, 'id', 'wallet'),
        name: JsonReader.string(j, 'name', 'wallet'),
        currencyId: JsonReader.integer(j, 'currencyId', 'wallet'),
      );
    }).toList();

    final groups = JsonReader.list(results[2], 'walletGroups').map((raw) {
      final j = JsonReader.map(raw, 'walletGroup');
      return WalletGroup(
        id: JsonReader.integer(j, 'id', 'walletGroup'),
        name: JsonReader.string(j, 'name', 'walletGroup'),
        isActive: JsonReader.flag(j, 'isActive', 'walletGroup', fallback: true),
      );
    }).toList();

    final expenseTypes = JsonReader.list(results[3], 'expenseTypes').map((raw) {
      final j = JsonReader.map(raw, 'expenseType');
      return ExpenseType(
        id: JsonReader.integer(j, 'id', 'expenseType'),
        name: JsonReader.string(j, 'name', 'expenseType'),
        icon: JsonReader.nullableString(j, 'icon', 'expenseType'),
      );
    }).toList();

    final vendors = JsonReader.list(results[4], 'vendors').map((raw) {
      final j = JsonReader.map(raw, 'vendor');
      return Vendor(
        id: JsonReader.integer(j, 'id', 'vendor'),
        name: JsonReader.string(j, 'name', 'vendor'),
      );
    }).toList();

    final memberLists = await Future.wait(groups.map((g) => _fetchMembers(g.id)));
    final creditCards = await _fetchCreditCards();

    return CatalogSnapshot(
      currencies: currencies,
      walletGroups: groups,
      wallets: wallets,
      walletMembers: memberLists.expand((m) => m).toList(),
      expenseTypes: expenseTypes,
      vendors: vendors,
      creditCards: creditCards,
    );
  }

  /// A backend older than this endpoint answers 404; the filter is then
  /// skipped (no group is hidden) instead of failing the whole sync.
  Future<List<CreditCard>> _fetchCreditCards() async {
    final Object? data;
    try {
      data = await _client.get('/catalog/credit-cards');
    } on ApiException catch (e) {
      if (e.kind != ApiErrorKind.notFound) rethrow;
      debugPrint('[CatalogRemoteDataSource] /catalog/credit-cards not available; credit card filter disabled');
      return const [];
    }
    return JsonReader.list(data, 'creditCards').map((raw) {
      final j = JsonReader.map(raw, 'creditCard');
      return CreditCard(
        id: JsonReader.integer(j, 'id', 'creditCard'),
        walletGroupId: JsonReader.integer(j, 'walletGroupId', 'creditCard'),
        active: JsonReader.integer(j, 'active', 'creditCard'),
      );
    }).toList();
  }

  Future<List<WalletMember>> _fetchMembers(int groupId) async {
    final detail = JsonReader.map(await _client.get('/wallet/groups/$groupId'), 'walletGroupDetail');
    return JsonReader.list(detail['members'], 'walletGroupDetail.members').map((raw) {
      final j = JsonReader.map(raw, 'walletMember');
      return WalletMember(
        id: JsonReader.integer(j, 'memberId', 'walletMember'),
        walletId: JsonReader.integer(j, 'walletId', 'walletMember'),
        walletGroupId: groupId,
        forwardWalletId: JsonReader.nullableInteger(j, 'forwardWalletId', 'walletMember'),
      );
    }).toList();
  }
}
