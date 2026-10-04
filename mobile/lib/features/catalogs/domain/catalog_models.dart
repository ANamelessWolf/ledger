/// Catalog domain models. Ids are Ledger ids.
library;

class Currency {
  const Currency({required this.id, required this.name, required this.symbol, required this.conversion});

  final int id;
  final String name;

  /// ISO-like code, e.g. `MXN`.
  final String symbol;

  /// Default-currency units per 1 unit of this currency (USD → 17.31 MXN).
  final double conversion;

  /// The backend default currency is the one whose conversion is exactly 1.
  bool get isDefault => conversion == 1;
}

class WalletGroup {
  const WalletGroup({required this.id, required this.name, required this.isActive});

  final int id;
  final String name;
  final bool isActive;
}

/// A wallet holds exactly one currency.
class Wallet {
  const Wallet({required this.id, required this.name, required this.currencyId});

  final int id;
  final String name;
  final int currencyId;
}

class WalletMember {
  const WalletMember({
    required this.id,
    required this.walletId,
    required this.walletGroupId,
    this.forwardWalletId,
  });

  final int id;
  final int walletId;
  final int walletGroupId;
  final int? forwardWalletId;
}

class ExpenseType {
  const ExpenseType({required this.id, required this.name, this.icon});

  final int id;
  final String name;

  /// Material icon name as stored in Ledger (e.g. `set_meal`).
  final String? icon;
}

class Vendor {
  const Vendor({required this.id, required this.name});

  final int id;
  final String name;
}

/// A credit card linked to a wallet group (`credit_card`). Only used to hide
/// wallet groups whose card is not active.
class CreditCard {
  const CreditCard({required this.id, required this.walletGroupId, required this.active});

  final int id;
  final int walletGroupId;

  /// Ledger's `credit_card.active` (1 = active; 0/2 = inactive/cancelled).
  final int active;

  bool get isActive => active == 1;
}

/// A complete, validated set of catalogs, downloaded together and replaced
/// atomically.
class CatalogSnapshot {
  const CatalogSnapshot({
    required this.currencies,
    required this.walletGroups,
    required this.wallets,
    required this.walletMembers,
    required this.expenseTypes,
    required this.vendors,
    this.creditCards = const [],
  });

  final List<Currency> currencies;
  final List<WalletGroup> walletGroups;
  final List<Wallet> wallets;
  final List<WalletMember> walletMembers;
  final List<ExpenseType> expenseTypes;
  final List<Vendor> vendors;
  final List<CreditCard> creditCards;

  /// Throws [FormatException] when the snapshot is not usable, so a broken
  /// download never replaces a valid cache.
  void validate() {
    if (currencies.isEmpty) throw const FormatException('No currencies received.');
    if (!currencies.any((c) => c.isDefault)) {
      throw const FormatException('No default currency (conversion = 1) received.');
    }
    if (wallets.isEmpty) throw const FormatException('No wallets received.');
    if (expenseTypes.isEmpty) throw const FormatException('No expense types received.');
    if (vendors.isEmpty) throw const FormatException('No vendors received.');
    final currencyIds = currencies.map((c) => c.id).toSet();
    for (final w in wallets) {
      if (!currencyIds.contains(w.currencyId)) {
        throw FormatException('Wallet ${w.id} references unknown currency ${w.currencyId}.');
      }
    }
  }
}

/// Wallet enriched with its currency and wallet group, for pickers and display.
class WalletOption {
  const WalletOption({required this.wallet, required this.currency, this.group});

  final Wallet wallet;
  final Currency? currency;
  final WalletGroup? group;

  /// Wallets in inactive groups are hidden from the creation form (same as the web app).
  bool get isSelectable => group?.isActive ?? true;

  String get groupLabel => group?.name ?? 'Other wallets';
}

/// What the expense form lets the user pick as "Wallet": a wallet group (the
/// multi-currency account, holding one wallet per currency) or a wallet that
/// belongs to no group. The concrete wallet sent to Ledger is resolved from
/// the account + the selected currency.
class WalletAccount {
  const WalletAccount({
    required this.key,
    required this.label,
    required this.wallets,
    this.group,
    this.isSelectable = true,
  });

  /// Stable identity: `group:<id>` or `wallet:<id>`.
  final String key;
  final String label;
  final WalletGroup? group;

  /// One wallet per currency; the default-currency wallet first.
  final List<WalletOption> wallets;

  /// False for inactive groups and for groups whose credit card is not
  /// active; such accounts are hidden from the expense form.
  final bool isSelectable;

  List<Currency> get currencies => [for (final w in wallets) ?w.currency];

  /// The wallet of this account in [currencyId], if the account has one.
  WalletOption? walletForCurrency(int currencyId) {
    for (final w in wallets) {
      if (w.wallet.currencyId == currencyId) return w;
    }
    return null;
  }

  /// Default selection: the default-currency wallet, otherwise the first one.
  WalletOption get defaultWallet => wallets.first;

  /// The wallet in [currencyId] when the account has it, otherwise the default.
  WalletOption resolve(int? currencyId) =>
      (currencyId == null ? null : walletForCurrency(currencyId)) ?? defaultWallet;
}

/// Locally cached catalogs, used by forms, filters and display.
class Catalogs {
  Catalogs({
    required List<Currency> currencies,
    required List<WalletGroup> walletGroups,
    required List<Wallet> wallets,
    required this.walletMembers,
    required this.expenseTypes,
    required this.vendors,
    this.creditCards = const [],
  })  : currencies = {for (final c in currencies) c.id: c},
        walletGroups = {for (final g in walletGroups) g.id: g},
        wallets = {for (final w in wallets) w.id: w};

  final Map<int, Currency> currencies;
  final Map<int, WalletGroup> walletGroups;
  final Map<int, Wallet> wallets;
  final List<WalletMember> walletMembers;
  final List<ExpenseType> expenseTypes;
  final List<Vendor> vendors;
  final List<CreditCard> creditCards;

  late final Map<int, ExpenseType> _expenseTypesById = {for (final t in expenseTypes) t.id: t};
  late final Map<int, Vendor> _vendorsById = {for (final v in vendors) v.id: v};

  /// Primary wallet group per wallet: the membership with the lowest id, which
  /// matches the `walletGroupId` that Ledger's `GET /wallet/all` reports and
  /// the web app uses for its "expenses by wallet" chart.
  late final Map<int, WalletGroup> _primaryGroupByWallet = () {
    final sorted = [...walletMembers]..sort((a, b) => a.id.compareTo(b.id));
    final result = <int, WalletGroup>{};
    for (final m in sorted) {
      final group = walletGroups[m.walletGroupId];
      if (group != null) result.putIfAbsent(m.walletId, () => group);
    }
    return result;
  }();

  bool get isEmpty => wallets.isEmpty || expenseTypes.isEmpty || vendors.isEmpty || currencies.isEmpty;

  /// The backend default currency, if the catalog has one.
  Currency? get defaultCurrency {
    for (final c in currencies.values) {
      if (c.isDefault) return c;
    }
    return null;
  }

  ExpenseType? expenseType(int id) => _expenseTypesById[id];
  Vendor? vendor(int id) => _vendorsById[id];
  WalletGroup? primaryGroupOf(int walletId) => _primaryGroupByWallet[walletId];
  Currency? currencyOfWallet(int walletId) {
    final wallet = wallets[walletId];
    return wallet == null ? null : currencies[wallet.currencyId];
  }

  /// All wallets with currency/group, sorted by group then wallet name.
  List<WalletOption> walletOptions() {
    final options = wallets.values
        .map((w) => WalletOption(wallet: w, currency: currencies[w.currencyId], group: primaryGroupOf(w.id)))
        .toList()
      ..sort((a, b) {
        final byGroup = a.groupLabel.toLowerCase().compareTo(b.groupLabel.toLowerCase());
        return byGroup != 0 ? byGroup : a.wallet.name.toLowerCase().compareTo(b.wallet.name.toLowerCase());
      });
    return options;
  }

  /// Selectable accounts for the expense form, sorted by name: one per wallet
  /// group (with its member wallets) plus one per wallet without any group.
  late final List<WalletAccount> walletAccounts = () {
    WalletOption option(Wallet w, WalletGroup? g) =>
        WalletOption(wallet: w, currency: currencies[w.currencyId], group: g);

    final membersByGroup = <int, List<WalletMember>>{};
    for (final m in [...walletMembers]..sort((a, b) => a.id.compareTo(b.id))) {
      membersByGroup.putIfAbsent(m.walletGroupId, () => []).add(m);
    }

    final accounts = <WalletAccount>[];
    for (final group in walletGroups.values) {
      // One wallet per currency; if a group ever had two wallets in the same
      // currency, the earliest membership wins.
      final byCurrency = <int, WalletOption>{};
      for (final m in membersByGroup[group.id] ?? const <WalletMember>[]) {
        final wallet = wallets[m.walletId];
        if (wallet != null) byCurrency.putIfAbsent(wallet.currencyId, () => option(wallet, group));
      }
      if (byCurrency.isEmpty) continue;
      accounts.add(WalletAccount(
        key: 'group:${group.id}',
        label: group.name,
        group: group,
        wallets: _sortByCurrency(byCurrency.values),
        isSelectable: isGroupSelectable(group),
      ));
    }

    final grouped = walletMembers.map((m) => m.walletId).toSet();
    for (final wallet in wallets.values.where((w) => !grouped.contains(w.id))) {
      accounts.add(WalletAccount(key: 'wallet:${wallet.id}', label: wallet.name, wallets: [option(wallet, null)]));
    }
    return accounts..sort((a, b) => a.label.toLowerCase().compareTo(b.label.toLowerCase()));
  }();

  /// A group can be used for new expenses when it is active and, if it is
  /// linked to credit cards, at least one of them has `active == 1`.
  bool isGroupSelectable(WalletGroup group) {
    if (!group.isActive) return false;
    final cards = creditCards.where((c) => c.walletGroupId == group.id);
    return cards.isEmpty || cards.any((c) => c.isActive);
  }

  /// The account that contains [walletId] (its primary group, or the wallet itself).
  WalletAccount? accountOfWallet(int walletId) {
    final group = primaryGroupOf(walletId);
    final key = group == null ? 'wallet:$walletId' : 'group:${group.id}';
    return accountByKey(key);
  }

  WalletAccount? accountByKey(String key) {
    for (final a in walletAccounts) {
      if (a.key == key) return a;
    }
    return null;
  }

  /// Default currency first, then alphabetical by currency code.
  List<WalletOption> _sortByCurrency(Iterable<WalletOption> options) => options.toList()
    ..sort((a, b) {
      final aDefault = a.currency?.isDefault ?? false;
      final bDefault = b.currency?.isDefault ?? false;
      if (aDefault != bDefault) return aDefault ? -1 : 1;
      return (a.currency?.symbol ?? '').compareTo(b.currency?.symbol ?? '');
    });

  static final Catalogs empty = Catalogs(
    currencies: const [],
    walletGroups: const [],
    wallets: const [],
    walletMembers: const [],
    expenseTypes: const [],
    vendors: const [],
  );
}
