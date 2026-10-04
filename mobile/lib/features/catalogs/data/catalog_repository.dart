import 'package:drift/drift.dart';

import '../../../core/database/app_database.dart';
import '../domain/catalog_models.dart';

/// Local catalog cache.
class CatalogRepository {
  CatalogRepository(this._db);

  final AppDatabase _db;

  /// Reads every catalog table.
  Future<Catalogs> load() async {
    final results = await Future.wait([
      _db.select(_db.currencies).get(),
      _db.select(_db.walletGroups).get(),
      _db.select(_db.wallets).get(),
      _db.select(_db.walletMembers).get(),
      (_db.select(_db.expenseTypes)..orderBy([(t) => OrderingTerm.asc(t.name)])).get(),
      (_db.select(_db.vendors)..orderBy([(t) => OrderingTerm.asc(t.name)])).get(),
      _db.select(_db.creditCards).get(),
    ]);
    return Catalogs(
      currencies: [
        for (final r in results[0] as List<CurrencyRow>)
          Currency(id: r.id, name: r.name, symbol: r.symbol, conversion: r.conversion),
      ],
      walletGroups: [
        for (final r in results[1] as List<WalletGroupRow>)
          WalletGroup(id: r.id, name: r.name, isActive: r.isActive),
      ],
      wallets: [
        for (final r in results[2] as List<WalletRow>) Wallet(id: r.id, name: r.name, currencyId: r.currencyId),
      ],
      walletMembers: [
        for (final r in results[3] as List<WalletMemberRow>)
          WalletMember(
            id: r.id,
            walletId: r.walletId,
            walletGroupId: r.walletGroupId,
            forwardWalletId: r.forwardWalletId,
          ),
      ],
      expenseTypes: [
        for (final r in results[4] as List<ExpenseTypeRow>) ExpenseType(id: r.id, name: r.name, icon: r.icon),
      ],
      vendors: [for (final r in results[5] as List<VendorRow>) Vendor(id: r.id, name: r.name)],
      creditCards: [
        for (final r in results[6] as List<CreditCardRow>)
          CreditCard(id: r.id, walletGroupId: r.walletGroupId, active: r.active),
      ],
    );
  }

  /// Emits the catalogs now and whenever any catalog table changes.
  Stream<Catalogs> watch() => _db
      .customSelect('SELECT 1', readsFrom: {
        _db.currencies,
        _db.walletGroups,
        _db.wallets,
        _db.walletMembers,
        _db.expenseTypes,
        _db.vendors,
        _db.creditCards,
      })
      .watch()
      .asyncMap((_) => load());

  /// Validates [snapshot] and replaces every catalog table in one transaction.
  /// A validation error leaves the existing cache untouched. When called
  /// inside an outer transaction it joins it (drift uses a savepoint).
  Future<void> replaceAll(CatalogSnapshot snapshot) async {
    snapshot.validate();
    await _db.transaction(() async {
      await _db.delete(_db.walletMembers).go();
      await _db.delete(_db.wallets).go();
      await _db.delete(_db.walletGroups).go();
      await _db.delete(_db.currencies).go();
      await _db.delete(_db.expenseTypes).go();
      await _db.delete(_db.vendors).go();
      await _db.delete(_db.creditCards).go();

      await _db.batch((b) {
        b.insertAll(_db.currencies, [
          for (final c in snapshot.currencies)
            CurrenciesCompanion.insert(id: Value(c.id), name: c.name, symbol: c.symbol, conversion: c.conversion),
        ]);
        b.insertAll(_db.walletGroups, [
          for (final g in snapshot.walletGroups)
            WalletGroupsCompanion.insert(id: Value(g.id), name: g.name, isActive: Value(g.isActive)),
        ]);
        b.insertAll(_db.wallets, [
          for (final w in snapshot.wallets)
            WalletsCompanion.insert(id: Value(w.id), name: w.name, currencyId: w.currencyId),
        ]);
        b.insertAll(_db.walletMembers, [
          for (final m in snapshot.walletMembers)
            WalletMembersCompanion.insert(
              id: Value(m.id),
              walletId: m.walletId,
              walletGroupId: m.walletGroupId,
              forwardWalletId: Value(m.forwardWalletId),
            ),
        ]);
        b.insertAll(_db.expenseTypes, [
          for (final t in snapshot.expenseTypes)
            ExpenseTypesCompanion.insert(id: Value(t.id), name: t.name, icon: Value(t.icon)),
        ]);
        b.insertAll(_db.vendors, [
          for (final v in snapshot.vendors) VendorsCompanion.insert(id: Value(v.id), name: v.name),
        ]);
        b.insertAll(_db.creditCards, [
          for (final c in snapshot.creditCards)
            CreditCardsCompanion.insert(id: Value(c.id), walletGroupId: c.walletGroupId, active: c.active),
        ]);
      });
    });
  }
}
