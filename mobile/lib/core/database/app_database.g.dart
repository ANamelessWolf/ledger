// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $CurrenciesTable extends Currencies
    with TableInfo<$CurrenciesTable, CurrencyRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CurrenciesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _symbolMeta = const VerificationMeta('symbol');
  @override
  late final GeneratedColumn<String> symbol = GeneratedColumn<String>(
    'symbol',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _conversionMeta = const VerificationMeta(
    'conversion',
  );
  @override
  late final GeneratedColumn<double> conversion = GeneratedColumn<double>(
    'conversion',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [id, name, symbol, conversion];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'currencies';
  @override
  VerificationContext validateIntegrity(
    Insertable<CurrencyRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('symbol')) {
      context.handle(
        _symbolMeta,
        symbol.isAcceptableOrUnknown(data['symbol']!, _symbolMeta),
      );
    } else if (isInserting) {
      context.missing(_symbolMeta);
    }
    if (data.containsKey('conversion')) {
      context.handle(
        _conversionMeta,
        conversion.isAcceptableOrUnknown(data['conversion']!, _conversionMeta),
      );
    } else if (isInserting) {
      context.missing(_conversionMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CurrencyRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CurrencyRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      symbol: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}symbol'],
      )!,
      conversion: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}conversion'],
      )!,
    );
  }

  @override
  $CurrenciesTable createAlias(String alias) {
    return $CurrenciesTable(attachedDatabase, alias);
  }
}

class CurrencyRow extends DataClass implements Insertable<CurrencyRow> {
  final int id;
  final String name;
  final String symbol;
  final double conversion;
  const CurrencyRow({
    required this.id,
    required this.name,
    required this.symbol,
    required this.conversion,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['name'] = Variable<String>(name);
    map['symbol'] = Variable<String>(symbol);
    map['conversion'] = Variable<double>(conversion);
    return map;
  }

  CurrenciesCompanion toCompanion(bool nullToAbsent) {
    return CurrenciesCompanion(
      id: Value(id),
      name: Value(name),
      symbol: Value(symbol),
      conversion: Value(conversion),
    );
  }

  factory CurrencyRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CurrencyRow(
      id: serializer.fromJson<int>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      symbol: serializer.fromJson<String>(json['symbol']),
      conversion: serializer.fromJson<double>(json['conversion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'name': serializer.toJson<String>(name),
      'symbol': serializer.toJson<String>(symbol),
      'conversion': serializer.toJson<double>(conversion),
    };
  }

  CurrencyRow copyWith({
    int? id,
    String? name,
    String? symbol,
    double? conversion,
  }) => CurrencyRow(
    id: id ?? this.id,
    name: name ?? this.name,
    symbol: symbol ?? this.symbol,
    conversion: conversion ?? this.conversion,
  );
  CurrencyRow copyWithCompanion(CurrenciesCompanion data) {
    return CurrencyRow(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      symbol: data.symbol.present ? data.symbol.value : this.symbol,
      conversion: data.conversion.present
          ? data.conversion.value
          : this.conversion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CurrencyRow(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('symbol: $symbol, ')
          ..write('conversion: $conversion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, symbol, conversion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CurrencyRow &&
          other.id == this.id &&
          other.name == this.name &&
          other.symbol == this.symbol &&
          other.conversion == this.conversion);
}

class CurrenciesCompanion extends UpdateCompanion<CurrencyRow> {
  final Value<int> id;
  final Value<String> name;
  final Value<String> symbol;
  final Value<double> conversion;
  const CurrenciesCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.symbol = const Value.absent(),
    this.conversion = const Value.absent(),
  });
  CurrenciesCompanion.insert({
    this.id = const Value.absent(),
    required String name,
    required String symbol,
    required double conversion,
  }) : name = Value(name),
       symbol = Value(symbol),
       conversion = Value(conversion);
  static Insertable<CurrencyRow> custom({
    Expression<int>? id,
    Expression<String>? name,
    Expression<String>? symbol,
    Expression<double>? conversion,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (symbol != null) 'symbol': symbol,
      if (conversion != null) 'conversion': conversion,
    });
  }

  CurrenciesCompanion copyWith({
    Value<int>? id,
    Value<String>? name,
    Value<String>? symbol,
    Value<double>? conversion,
  }) {
    return CurrenciesCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      symbol: symbol ?? this.symbol,
      conversion: conversion ?? this.conversion,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (symbol.present) {
      map['symbol'] = Variable<String>(symbol.value);
    }
    if (conversion.present) {
      map['conversion'] = Variable<double>(conversion.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CurrenciesCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('symbol: $symbol, ')
          ..write('conversion: $conversion')
          ..write(')'))
        .toString();
  }
}

class $WalletGroupsTable extends WalletGroups
    with TableInfo<$WalletGroupsTable, WalletGroupRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $WalletGroupsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _isActiveMeta = const VerificationMeta(
    'isActive',
  );
  @override
  late final GeneratedColumn<bool> isActive = GeneratedColumn<bool>(
    'is_active',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("is_active" IN (0, 1))',
    ),
    defaultValue: const Constant(true),
  );
  @override
  List<GeneratedColumn> get $columns => [id, name, isActive];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'wallet_groups';
  @override
  VerificationContext validateIntegrity(
    Insertable<WalletGroupRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('is_active')) {
      context.handle(
        _isActiveMeta,
        isActive.isAcceptableOrUnknown(data['is_active']!, _isActiveMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  WalletGroupRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return WalletGroupRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      isActive: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}is_active'],
      )!,
    );
  }

  @override
  $WalletGroupsTable createAlias(String alias) {
    return $WalletGroupsTable(attachedDatabase, alias);
  }
}

class WalletGroupRow extends DataClass implements Insertable<WalletGroupRow> {
  final int id;
  final String name;
  final bool isActive;
  const WalletGroupRow({
    required this.id,
    required this.name,
    required this.isActive,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['name'] = Variable<String>(name);
    map['is_active'] = Variable<bool>(isActive);
    return map;
  }

  WalletGroupsCompanion toCompanion(bool nullToAbsent) {
    return WalletGroupsCompanion(
      id: Value(id),
      name: Value(name),
      isActive: Value(isActive),
    );
  }

  factory WalletGroupRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return WalletGroupRow(
      id: serializer.fromJson<int>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      isActive: serializer.fromJson<bool>(json['isActive']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'name': serializer.toJson<String>(name),
      'isActive': serializer.toJson<bool>(isActive),
    };
  }

  WalletGroupRow copyWith({int? id, String? name, bool? isActive}) =>
      WalletGroupRow(
        id: id ?? this.id,
        name: name ?? this.name,
        isActive: isActive ?? this.isActive,
      );
  WalletGroupRow copyWithCompanion(WalletGroupsCompanion data) {
    return WalletGroupRow(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      isActive: data.isActive.present ? data.isActive.value : this.isActive,
    );
  }

  @override
  String toString() {
    return (StringBuffer('WalletGroupRow(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('isActive: $isActive')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, isActive);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is WalletGroupRow &&
          other.id == this.id &&
          other.name == this.name &&
          other.isActive == this.isActive);
}

class WalletGroupsCompanion extends UpdateCompanion<WalletGroupRow> {
  final Value<int> id;
  final Value<String> name;
  final Value<bool> isActive;
  const WalletGroupsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.isActive = const Value.absent(),
  });
  WalletGroupsCompanion.insert({
    this.id = const Value.absent(),
    required String name,
    this.isActive = const Value.absent(),
  }) : name = Value(name);
  static Insertable<WalletGroupRow> custom({
    Expression<int>? id,
    Expression<String>? name,
    Expression<bool>? isActive,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (isActive != null) 'is_active': isActive,
    });
  }

  WalletGroupsCompanion copyWith({
    Value<int>? id,
    Value<String>? name,
    Value<bool>? isActive,
  }) {
    return WalletGroupsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      isActive: isActive ?? this.isActive,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (isActive.present) {
      map['is_active'] = Variable<bool>(isActive.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('WalletGroupsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('isActive: $isActive')
          ..write(')'))
        .toString();
  }
}

class $WalletsTable extends Wallets with TableInfo<$WalletsTable, WalletRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $WalletsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _currencyIdMeta = const VerificationMeta(
    'currencyId',
  );
  @override
  late final GeneratedColumn<int> currencyId = GeneratedColumn<int>(
    'currency_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [id, name, currencyId];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'wallets';
  @override
  VerificationContext validateIntegrity(
    Insertable<WalletRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('currency_id')) {
      context.handle(
        _currencyIdMeta,
        currencyId.isAcceptableOrUnknown(data['currency_id']!, _currencyIdMeta),
      );
    } else if (isInserting) {
      context.missing(_currencyIdMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  WalletRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return WalletRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      currencyId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}currency_id'],
      )!,
    );
  }

  @override
  $WalletsTable createAlias(String alias) {
    return $WalletsTable(attachedDatabase, alias);
  }
}

class WalletRow extends DataClass implements Insertable<WalletRow> {
  final int id;
  final String name;
  final int currencyId;
  const WalletRow({
    required this.id,
    required this.name,
    required this.currencyId,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['name'] = Variable<String>(name);
    map['currency_id'] = Variable<int>(currencyId);
    return map;
  }

  WalletsCompanion toCompanion(bool nullToAbsent) {
    return WalletsCompanion(
      id: Value(id),
      name: Value(name),
      currencyId: Value(currencyId),
    );
  }

  factory WalletRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return WalletRow(
      id: serializer.fromJson<int>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      currencyId: serializer.fromJson<int>(json['currencyId']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'name': serializer.toJson<String>(name),
      'currencyId': serializer.toJson<int>(currencyId),
    };
  }

  WalletRow copyWith({int? id, String? name, int? currencyId}) => WalletRow(
    id: id ?? this.id,
    name: name ?? this.name,
    currencyId: currencyId ?? this.currencyId,
  );
  WalletRow copyWithCompanion(WalletsCompanion data) {
    return WalletRow(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      currencyId: data.currencyId.present
          ? data.currencyId.value
          : this.currencyId,
    );
  }

  @override
  String toString() {
    return (StringBuffer('WalletRow(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('currencyId: $currencyId')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, currencyId);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is WalletRow &&
          other.id == this.id &&
          other.name == this.name &&
          other.currencyId == this.currencyId);
}

class WalletsCompanion extends UpdateCompanion<WalletRow> {
  final Value<int> id;
  final Value<String> name;
  final Value<int> currencyId;
  const WalletsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.currencyId = const Value.absent(),
  });
  WalletsCompanion.insert({
    this.id = const Value.absent(),
    required String name,
    required int currencyId,
  }) : name = Value(name),
       currencyId = Value(currencyId);
  static Insertable<WalletRow> custom({
    Expression<int>? id,
    Expression<String>? name,
    Expression<int>? currencyId,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (currencyId != null) 'currency_id': currencyId,
    });
  }

  WalletsCompanion copyWith({
    Value<int>? id,
    Value<String>? name,
    Value<int>? currencyId,
  }) {
    return WalletsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      currencyId: currencyId ?? this.currencyId,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (currencyId.present) {
      map['currency_id'] = Variable<int>(currencyId.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('WalletsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('currencyId: $currencyId')
          ..write(')'))
        .toString();
  }
}

class $WalletMembersTable extends WalletMembers
    with TableInfo<$WalletMembersTable, WalletMemberRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $WalletMembersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _walletIdMeta = const VerificationMeta(
    'walletId',
  );
  @override
  late final GeneratedColumn<int> walletId = GeneratedColumn<int>(
    'wallet_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _walletGroupIdMeta = const VerificationMeta(
    'walletGroupId',
  );
  @override
  late final GeneratedColumn<int> walletGroupId = GeneratedColumn<int>(
    'wallet_group_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _forwardWalletIdMeta = const VerificationMeta(
    'forwardWalletId',
  );
  @override
  late final GeneratedColumn<int> forwardWalletId = GeneratedColumn<int>(
    'forward_wallet_id',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    walletId,
    walletGroupId,
    forwardWalletId,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'wallet_members';
  @override
  VerificationContext validateIntegrity(
    Insertable<WalletMemberRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('wallet_id')) {
      context.handle(
        _walletIdMeta,
        walletId.isAcceptableOrUnknown(data['wallet_id']!, _walletIdMeta),
      );
    } else if (isInserting) {
      context.missing(_walletIdMeta);
    }
    if (data.containsKey('wallet_group_id')) {
      context.handle(
        _walletGroupIdMeta,
        walletGroupId.isAcceptableOrUnknown(
          data['wallet_group_id']!,
          _walletGroupIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_walletGroupIdMeta);
    }
    if (data.containsKey('forward_wallet_id')) {
      context.handle(
        _forwardWalletIdMeta,
        forwardWalletId.isAcceptableOrUnknown(
          data['forward_wallet_id']!,
          _forwardWalletIdMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  WalletMemberRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return WalletMemberRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      walletId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}wallet_id'],
      )!,
      walletGroupId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}wallet_group_id'],
      )!,
      forwardWalletId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}forward_wallet_id'],
      ),
    );
  }

  @override
  $WalletMembersTable createAlias(String alias) {
    return $WalletMembersTable(attachedDatabase, alias);
  }
}

class WalletMemberRow extends DataClass implements Insertable<WalletMemberRow> {
  final int id;
  final int walletId;
  final int walletGroupId;
  final int? forwardWalletId;
  const WalletMemberRow({
    required this.id,
    required this.walletId,
    required this.walletGroupId,
    this.forwardWalletId,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['wallet_id'] = Variable<int>(walletId);
    map['wallet_group_id'] = Variable<int>(walletGroupId);
    if (!nullToAbsent || forwardWalletId != null) {
      map['forward_wallet_id'] = Variable<int>(forwardWalletId);
    }
    return map;
  }

  WalletMembersCompanion toCompanion(bool nullToAbsent) {
    return WalletMembersCompanion(
      id: Value(id),
      walletId: Value(walletId),
      walletGroupId: Value(walletGroupId),
      forwardWalletId: forwardWalletId == null && nullToAbsent
          ? const Value.absent()
          : Value(forwardWalletId),
    );
  }

  factory WalletMemberRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return WalletMemberRow(
      id: serializer.fromJson<int>(json['id']),
      walletId: serializer.fromJson<int>(json['walletId']),
      walletGroupId: serializer.fromJson<int>(json['walletGroupId']),
      forwardWalletId: serializer.fromJson<int?>(json['forwardWalletId']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'walletId': serializer.toJson<int>(walletId),
      'walletGroupId': serializer.toJson<int>(walletGroupId),
      'forwardWalletId': serializer.toJson<int?>(forwardWalletId),
    };
  }

  WalletMemberRow copyWith({
    int? id,
    int? walletId,
    int? walletGroupId,
    Value<int?> forwardWalletId = const Value.absent(),
  }) => WalletMemberRow(
    id: id ?? this.id,
    walletId: walletId ?? this.walletId,
    walletGroupId: walletGroupId ?? this.walletGroupId,
    forwardWalletId: forwardWalletId.present
        ? forwardWalletId.value
        : this.forwardWalletId,
  );
  WalletMemberRow copyWithCompanion(WalletMembersCompanion data) {
    return WalletMemberRow(
      id: data.id.present ? data.id.value : this.id,
      walletId: data.walletId.present ? data.walletId.value : this.walletId,
      walletGroupId: data.walletGroupId.present
          ? data.walletGroupId.value
          : this.walletGroupId,
      forwardWalletId: data.forwardWalletId.present
          ? data.forwardWalletId.value
          : this.forwardWalletId,
    );
  }

  @override
  String toString() {
    return (StringBuffer('WalletMemberRow(')
          ..write('id: $id, ')
          ..write('walletId: $walletId, ')
          ..write('walletGroupId: $walletGroupId, ')
          ..write('forwardWalletId: $forwardWalletId')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, walletId, walletGroupId, forwardWalletId);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is WalletMemberRow &&
          other.id == this.id &&
          other.walletId == this.walletId &&
          other.walletGroupId == this.walletGroupId &&
          other.forwardWalletId == this.forwardWalletId);
}

class WalletMembersCompanion extends UpdateCompanion<WalletMemberRow> {
  final Value<int> id;
  final Value<int> walletId;
  final Value<int> walletGroupId;
  final Value<int?> forwardWalletId;
  const WalletMembersCompanion({
    this.id = const Value.absent(),
    this.walletId = const Value.absent(),
    this.walletGroupId = const Value.absent(),
    this.forwardWalletId = const Value.absent(),
  });
  WalletMembersCompanion.insert({
    this.id = const Value.absent(),
    required int walletId,
    required int walletGroupId,
    this.forwardWalletId = const Value.absent(),
  }) : walletId = Value(walletId),
       walletGroupId = Value(walletGroupId);
  static Insertable<WalletMemberRow> custom({
    Expression<int>? id,
    Expression<int>? walletId,
    Expression<int>? walletGroupId,
    Expression<int>? forwardWalletId,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (walletId != null) 'wallet_id': walletId,
      if (walletGroupId != null) 'wallet_group_id': walletGroupId,
      if (forwardWalletId != null) 'forward_wallet_id': forwardWalletId,
    });
  }

  WalletMembersCompanion copyWith({
    Value<int>? id,
    Value<int>? walletId,
    Value<int>? walletGroupId,
    Value<int?>? forwardWalletId,
  }) {
    return WalletMembersCompanion(
      id: id ?? this.id,
      walletId: walletId ?? this.walletId,
      walletGroupId: walletGroupId ?? this.walletGroupId,
      forwardWalletId: forwardWalletId ?? this.forwardWalletId,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (walletId.present) {
      map['wallet_id'] = Variable<int>(walletId.value);
    }
    if (walletGroupId.present) {
      map['wallet_group_id'] = Variable<int>(walletGroupId.value);
    }
    if (forwardWalletId.present) {
      map['forward_wallet_id'] = Variable<int>(forwardWalletId.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('WalletMembersCompanion(')
          ..write('id: $id, ')
          ..write('walletId: $walletId, ')
          ..write('walletGroupId: $walletGroupId, ')
          ..write('forwardWalletId: $forwardWalletId')
          ..write(')'))
        .toString();
  }
}

class $ExpenseTypesTable extends ExpenseTypes
    with TableInfo<$ExpenseTypesTable, ExpenseTypeRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ExpenseTypesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _iconMeta = const VerificationMeta('icon');
  @override
  late final GeneratedColumn<String> icon = GeneratedColumn<String>(
    'icon',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [id, name, icon];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'expense_types';
  @override
  VerificationContext validateIntegrity(
    Insertable<ExpenseTypeRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('icon')) {
      context.handle(
        _iconMeta,
        icon.isAcceptableOrUnknown(data['icon']!, _iconMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  ExpenseTypeRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ExpenseTypeRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      icon: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}icon'],
      ),
    );
  }

  @override
  $ExpenseTypesTable createAlias(String alias) {
    return $ExpenseTypesTable(attachedDatabase, alias);
  }
}

class ExpenseTypeRow extends DataClass implements Insertable<ExpenseTypeRow> {
  final int id;
  final String name;
  final String? icon;
  const ExpenseTypeRow({required this.id, required this.name, this.icon});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || icon != null) {
      map['icon'] = Variable<String>(icon);
    }
    return map;
  }

  ExpenseTypesCompanion toCompanion(bool nullToAbsent) {
    return ExpenseTypesCompanion(
      id: Value(id),
      name: Value(name),
      icon: icon == null && nullToAbsent ? const Value.absent() : Value(icon),
    );
  }

  factory ExpenseTypeRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ExpenseTypeRow(
      id: serializer.fromJson<int>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      icon: serializer.fromJson<String?>(json['icon']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'name': serializer.toJson<String>(name),
      'icon': serializer.toJson<String?>(icon),
    };
  }

  ExpenseTypeRow copyWith({
    int? id,
    String? name,
    Value<String?> icon = const Value.absent(),
  }) => ExpenseTypeRow(
    id: id ?? this.id,
    name: name ?? this.name,
    icon: icon.present ? icon.value : this.icon,
  );
  ExpenseTypeRow copyWithCompanion(ExpenseTypesCompanion data) {
    return ExpenseTypeRow(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      icon: data.icon.present ? data.icon.value : this.icon,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ExpenseTypeRow(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('icon: $icon')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, icon);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ExpenseTypeRow &&
          other.id == this.id &&
          other.name == this.name &&
          other.icon == this.icon);
}

class ExpenseTypesCompanion extends UpdateCompanion<ExpenseTypeRow> {
  final Value<int> id;
  final Value<String> name;
  final Value<String?> icon;
  const ExpenseTypesCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.icon = const Value.absent(),
  });
  ExpenseTypesCompanion.insert({
    this.id = const Value.absent(),
    required String name,
    this.icon = const Value.absent(),
  }) : name = Value(name);
  static Insertable<ExpenseTypeRow> custom({
    Expression<int>? id,
    Expression<String>? name,
    Expression<String>? icon,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (icon != null) 'icon': icon,
    });
  }

  ExpenseTypesCompanion copyWith({
    Value<int>? id,
    Value<String>? name,
    Value<String?>? icon,
  }) {
    return ExpenseTypesCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      icon: icon ?? this.icon,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (icon.present) {
      map['icon'] = Variable<String>(icon.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ExpenseTypesCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('icon: $icon')
          ..write(')'))
        .toString();
  }
}

class $VendorsTable extends Vendors with TableInfo<$VendorsTable, VendorRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $VendorsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [id, name];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'vendors';
  @override
  VerificationContext validateIntegrity(
    Insertable<VendorRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  VendorRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return VendorRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
    );
  }

  @override
  $VendorsTable createAlias(String alias) {
    return $VendorsTable(attachedDatabase, alias);
  }
}

class VendorRow extends DataClass implements Insertable<VendorRow> {
  final int id;
  final String name;
  const VendorRow({required this.id, required this.name});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['name'] = Variable<String>(name);
    return map;
  }

  VendorsCompanion toCompanion(bool nullToAbsent) {
    return VendorsCompanion(id: Value(id), name: Value(name));
  }

  factory VendorRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return VendorRow(
      id: serializer.fromJson<int>(json['id']),
      name: serializer.fromJson<String>(json['name']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'name': serializer.toJson<String>(name),
    };
  }

  VendorRow copyWith({int? id, String? name}) =>
      VendorRow(id: id ?? this.id, name: name ?? this.name);
  VendorRow copyWithCompanion(VendorsCompanion data) {
    return VendorRow(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
    );
  }

  @override
  String toString() {
    return (StringBuffer('VendorRow(')
          ..write('id: $id, ')
          ..write('name: $name')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is VendorRow && other.id == this.id && other.name == this.name);
}

class VendorsCompanion extends UpdateCompanion<VendorRow> {
  final Value<int> id;
  final Value<String> name;
  const VendorsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
  });
  VendorsCompanion.insert({
    this.id = const Value.absent(),
    required String name,
  }) : name = Value(name);
  static Insertable<VendorRow> custom({
    Expression<int>? id,
    Expression<String>? name,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
    });
  }

  VendorsCompanion copyWith({Value<int>? id, Value<String>? name}) {
    return VendorsCompanion(id: id ?? this.id, name: name ?? this.name);
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('VendorsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name')
          ..write(')'))
        .toString();
  }
}

class $CreditCardsTable extends CreditCards
    with TableInfo<$CreditCardsTable, CreditCardRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CreditCardsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _walletGroupIdMeta = const VerificationMeta(
    'walletGroupId',
  );
  @override
  late final GeneratedColumn<int> walletGroupId = GeneratedColumn<int>(
    'wallet_group_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _activeMeta = const VerificationMeta('active');
  @override
  late final GeneratedColumn<int> active = GeneratedColumn<int>(
    'active',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [id, walletGroupId, active];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'credit_cards';
  @override
  VerificationContext validateIntegrity(
    Insertable<CreditCardRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('wallet_group_id')) {
      context.handle(
        _walletGroupIdMeta,
        walletGroupId.isAcceptableOrUnknown(
          data['wallet_group_id']!,
          _walletGroupIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_walletGroupIdMeta);
    }
    if (data.containsKey('active')) {
      context.handle(
        _activeMeta,
        active.isAcceptableOrUnknown(data['active']!, _activeMeta),
      );
    } else if (isInserting) {
      context.missing(_activeMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CreditCardRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CreditCardRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      walletGroupId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}wallet_group_id'],
      )!,
      active: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}active'],
      )!,
    );
  }

  @override
  $CreditCardsTable createAlias(String alias) {
    return $CreditCardsTable(attachedDatabase, alias);
  }
}

class CreditCardRow extends DataClass implements Insertable<CreditCardRow> {
  final int id;
  final int walletGroupId;

  /// Ledger's `active` flag (1 = active).
  final int active;
  const CreditCardRow({
    required this.id,
    required this.walletGroupId,
    required this.active,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['wallet_group_id'] = Variable<int>(walletGroupId);
    map['active'] = Variable<int>(active);
    return map;
  }

  CreditCardsCompanion toCompanion(bool nullToAbsent) {
    return CreditCardsCompanion(
      id: Value(id),
      walletGroupId: Value(walletGroupId),
      active: Value(active),
    );
  }

  factory CreditCardRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CreditCardRow(
      id: serializer.fromJson<int>(json['id']),
      walletGroupId: serializer.fromJson<int>(json['walletGroupId']),
      active: serializer.fromJson<int>(json['active']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'walletGroupId': serializer.toJson<int>(walletGroupId),
      'active': serializer.toJson<int>(active),
    };
  }

  CreditCardRow copyWith({int? id, int? walletGroupId, int? active}) =>
      CreditCardRow(
        id: id ?? this.id,
        walletGroupId: walletGroupId ?? this.walletGroupId,
        active: active ?? this.active,
      );
  CreditCardRow copyWithCompanion(CreditCardsCompanion data) {
    return CreditCardRow(
      id: data.id.present ? data.id.value : this.id,
      walletGroupId: data.walletGroupId.present
          ? data.walletGroupId.value
          : this.walletGroupId,
      active: data.active.present ? data.active.value : this.active,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CreditCardRow(')
          ..write('id: $id, ')
          ..write('walletGroupId: $walletGroupId, ')
          ..write('active: $active')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, walletGroupId, active);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CreditCardRow &&
          other.id == this.id &&
          other.walletGroupId == this.walletGroupId &&
          other.active == this.active);
}

class CreditCardsCompanion extends UpdateCompanion<CreditCardRow> {
  final Value<int> id;
  final Value<int> walletGroupId;
  final Value<int> active;
  const CreditCardsCompanion({
    this.id = const Value.absent(),
    this.walletGroupId = const Value.absent(),
    this.active = const Value.absent(),
  });
  CreditCardsCompanion.insert({
    this.id = const Value.absent(),
    required int walletGroupId,
    required int active,
  }) : walletGroupId = Value(walletGroupId),
       active = Value(active);
  static Insertable<CreditCardRow> custom({
    Expression<int>? id,
    Expression<int>? walletGroupId,
    Expression<int>? active,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (walletGroupId != null) 'wallet_group_id': walletGroupId,
      if (active != null) 'active': active,
    });
  }

  CreditCardsCompanion copyWith({
    Value<int>? id,
    Value<int>? walletGroupId,
    Value<int>? active,
  }) {
    return CreditCardsCompanion(
      id: id ?? this.id,
      walletGroupId: walletGroupId ?? this.walletGroupId,
      active: active ?? this.active,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (walletGroupId.present) {
      map['wallet_group_id'] = Variable<int>(walletGroupId.value);
    }
    if (active.present) {
      map['active'] = Variable<int>(active.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CreditCardsCompanion(')
          ..write('id: $id, ')
          ..write('walletGroupId: $walletGroupId, ')
          ..write('active: $active')
          ..write(')'))
        .toString();
  }
}

class $ExpensesTable extends Expenses
    with TableInfo<$ExpensesTable, ExpenseRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ExpensesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _remoteIdMeta = const VerificationMeta(
    'remoteId',
  );
  @override
  late final GeneratedColumn<int> remoteId = GeneratedColumn<int>(
    'remote_id',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _syncKeyMeta = const VerificationMeta(
    'syncKey',
  );
  @override
  late final GeneratedColumn<String> syncKey = GeneratedColumn<String>(
    'sync_key',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _walletIdMeta = const VerificationMeta(
    'walletId',
  );
  @override
  late final GeneratedColumn<int> walletId = GeneratedColumn<int>(
    'wallet_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _expenseTypeIdMeta = const VerificationMeta(
    'expenseTypeId',
  );
  @override
  late final GeneratedColumn<int> expenseTypeId = GeneratedColumn<int>(
    'expense_type_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _vendorIdMeta = const VerificationMeta(
    'vendorId',
  );
  @override
  late final GeneratedColumn<int> vendorId = GeneratedColumn<int>(
    'vendor_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _descriptionMeta = const VerificationMeta(
    'description',
  );
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
    'description',
    aliasedName,
    false,
    additionalChecks: GeneratedColumn.checkTextLength(
      minTextLength: 1,
      maxTextLength: 120,
    ),
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _totalMeta = const VerificationMeta('total');
  @override
  late final GeneratedColumn<double> total = GeneratedColumn<double>(
    'total',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _currencyFactorMeta = const VerificationMeta(
    'currencyFactor',
  );
  @override
  late final GeneratedColumn<double> currencyFactor = GeneratedColumn<double>(
    'currency_factor',
    aliasedName,
    true,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _buyDateMeta = const VerificationMeta(
    'buyDate',
  );
  @override
  late final GeneratedColumn<String> buyDate = GeneratedColumn<String>(
    'buy_date',
    aliasedName,
    false,
    additionalChecks: GeneratedColumn.checkTextLength(
      minTextLength: 10,
      maxTextLength: 10,
    ),
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _sortIdMeta = const VerificationMeta('sortId');
  @override
  late final GeneratedColumn<int> sortId = GeneratedColumn<int>(
    'sort_id',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _syncStatusMeta = const VerificationMeta(
    'syncStatus',
  );
  @override
  late final GeneratedColumn<String> syncStatus = GeneratedColumn<String>(
    'sync_status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _syncErrorMeta = const VerificationMeta(
    'syncError',
  );
  @override
  late final GeneratedColumn<String> syncError = GeneratedColumn<String>(
    'sync_error',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    remoteId,
    syncKey,
    walletId,
    expenseTypeId,
    vendorId,
    description,
    total,
    currencyFactor,
    buyDate,
    sortId,
    syncStatus,
    syncError,
    createdAt,
    updatedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'expenses';
  @override
  VerificationContext validateIntegrity(
    Insertable<ExpenseRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('remote_id')) {
      context.handle(
        _remoteIdMeta,
        remoteId.isAcceptableOrUnknown(data['remote_id']!, _remoteIdMeta),
      );
    }
    if (data.containsKey('sync_key')) {
      context.handle(
        _syncKeyMeta,
        syncKey.isAcceptableOrUnknown(data['sync_key']!, _syncKeyMeta),
      );
    }
    if (data.containsKey('wallet_id')) {
      context.handle(
        _walletIdMeta,
        walletId.isAcceptableOrUnknown(data['wallet_id']!, _walletIdMeta),
      );
    } else if (isInserting) {
      context.missing(_walletIdMeta);
    }
    if (data.containsKey('expense_type_id')) {
      context.handle(
        _expenseTypeIdMeta,
        expenseTypeId.isAcceptableOrUnknown(
          data['expense_type_id']!,
          _expenseTypeIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_expenseTypeIdMeta);
    }
    if (data.containsKey('vendor_id')) {
      context.handle(
        _vendorIdMeta,
        vendorId.isAcceptableOrUnknown(data['vendor_id']!, _vendorIdMeta),
      );
    } else if (isInserting) {
      context.missing(_vendorIdMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
        _descriptionMeta,
        description.isAcceptableOrUnknown(
          data['description']!,
          _descriptionMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_descriptionMeta);
    }
    if (data.containsKey('total')) {
      context.handle(
        _totalMeta,
        total.isAcceptableOrUnknown(data['total']!, _totalMeta),
      );
    } else if (isInserting) {
      context.missing(_totalMeta);
    }
    if (data.containsKey('currency_factor')) {
      context.handle(
        _currencyFactorMeta,
        currencyFactor.isAcceptableOrUnknown(
          data['currency_factor']!,
          _currencyFactorMeta,
        ),
      );
    }
    if (data.containsKey('buy_date')) {
      context.handle(
        _buyDateMeta,
        buyDate.isAcceptableOrUnknown(data['buy_date']!, _buyDateMeta),
      );
    } else if (isInserting) {
      context.missing(_buyDateMeta);
    }
    if (data.containsKey('sort_id')) {
      context.handle(
        _sortIdMeta,
        sortId.isAcceptableOrUnknown(data['sort_id']!, _sortIdMeta),
      );
    }
    if (data.containsKey('sync_status')) {
      context.handle(
        _syncStatusMeta,
        syncStatus.isAcceptableOrUnknown(data['sync_status']!, _syncStatusMeta),
      );
    } else if (isInserting) {
      context.missing(_syncStatusMeta);
    }
    if (data.containsKey('sync_error')) {
      context.handle(
        _syncErrorMeta,
        syncError.isAcceptableOrUnknown(data['sync_error']!, _syncErrorMeta),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  ExpenseRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ExpenseRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      remoteId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}remote_id'],
      ),
      syncKey: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}sync_key'],
      ),
      walletId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}wallet_id'],
      )!,
      expenseTypeId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}expense_type_id'],
      )!,
      vendorId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}vendor_id'],
      )!,
      description: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}description'],
      )!,
      total: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}total'],
      )!,
      currencyFactor: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}currency_factor'],
      ),
      buyDate: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}buy_date'],
      )!,
      sortId: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}sort_id'],
      )!,
      syncStatus: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}sync_status'],
      )!,
      syncError: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}sync_error'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $ExpensesTable createAlias(String alias) {
    return $ExpensesTable(attachedDatabase, alias);
  }
}

class ExpenseRow extends DataClass implements Insertable<ExpenseRow> {
  /// Local id, generated by SQLite.
  final int id;

  /// Ledger id; null until the server acknowledged the expense.
  final int? remoteId;

  /// Stable idempotency key (UUID v4) for expenses created on this device.
  /// Null for expenses downloaded from Ledger (they were never uploaded from here).
  final String? syncKey;
  final int walletId;
  final int expenseTypeId;
  final int vendorId;
  final String description;
  final double total;

  /// Optional expense-specific factor to the default currency.
  final double? currencyFactor;

  /// Date-only `YYYY-MM-DD`.
  final String buyDate;
  final int sortId;

  /// `pending`, `failed` or `synced` (see `SyncStatus`).
  final String syncStatus;
  final String? syncError;
  final DateTime createdAt;
  final DateTime updatedAt;
  const ExpenseRow({
    required this.id,
    this.remoteId,
    this.syncKey,
    required this.walletId,
    required this.expenseTypeId,
    required this.vendorId,
    required this.description,
    required this.total,
    this.currencyFactor,
    required this.buyDate,
    required this.sortId,
    required this.syncStatus,
    this.syncError,
    required this.createdAt,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || remoteId != null) {
      map['remote_id'] = Variable<int>(remoteId);
    }
    if (!nullToAbsent || syncKey != null) {
      map['sync_key'] = Variable<String>(syncKey);
    }
    map['wallet_id'] = Variable<int>(walletId);
    map['expense_type_id'] = Variable<int>(expenseTypeId);
    map['vendor_id'] = Variable<int>(vendorId);
    map['description'] = Variable<String>(description);
    map['total'] = Variable<double>(total);
    if (!nullToAbsent || currencyFactor != null) {
      map['currency_factor'] = Variable<double>(currencyFactor);
    }
    map['buy_date'] = Variable<String>(buyDate);
    map['sort_id'] = Variable<int>(sortId);
    map['sync_status'] = Variable<String>(syncStatus);
    if (!nullToAbsent || syncError != null) {
      map['sync_error'] = Variable<String>(syncError);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  ExpensesCompanion toCompanion(bool nullToAbsent) {
    return ExpensesCompanion(
      id: Value(id),
      remoteId: remoteId == null && nullToAbsent
          ? const Value.absent()
          : Value(remoteId),
      syncKey: syncKey == null && nullToAbsent
          ? const Value.absent()
          : Value(syncKey),
      walletId: Value(walletId),
      expenseTypeId: Value(expenseTypeId),
      vendorId: Value(vendorId),
      description: Value(description),
      total: Value(total),
      currencyFactor: currencyFactor == null && nullToAbsent
          ? const Value.absent()
          : Value(currencyFactor),
      buyDate: Value(buyDate),
      sortId: Value(sortId),
      syncStatus: Value(syncStatus),
      syncError: syncError == null && nullToAbsent
          ? const Value.absent()
          : Value(syncError),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory ExpenseRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ExpenseRow(
      id: serializer.fromJson<int>(json['id']),
      remoteId: serializer.fromJson<int?>(json['remoteId']),
      syncKey: serializer.fromJson<String?>(json['syncKey']),
      walletId: serializer.fromJson<int>(json['walletId']),
      expenseTypeId: serializer.fromJson<int>(json['expenseTypeId']),
      vendorId: serializer.fromJson<int>(json['vendorId']),
      description: serializer.fromJson<String>(json['description']),
      total: serializer.fromJson<double>(json['total']),
      currencyFactor: serializer.fromJson<double?>(json['currencyFactor']),
      buyDate: serializer.fromJson<String>(json['buyDate']),
      sortId: serializer.fromJson<int>(json['sortId']),
      syncStatus: serializer.fromJson<String>(json['syncStatus']),
      syncError: serializer.fromJson<String?>(json['syncError']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'remoteId': serializer.toJson<int?>(remoteId),
      'syncKey': serializer.toJson<String?>(syncKey),
      'walletId': serializer.toJson<int>(walletId),
      'expenseTypeId': serializer.toJson<int>(expenseTypeId),
      'vendorId': serializer.toJson<int>(vendorId),
      'description': serializer.toJson<String>(description),
      'total': serializer.toJson<double>(total),
      'currencyFactor': serializer.toJson<double?>(currencyFactor),
      'buyDate': serializer.toJson<String>(buyDate),
      'sortId': serializer.toJson<int>(sortId),
      'syncStatus': serializer.toJson<String>(syncStatus),
      'syncError': serializer.toJson<String?>(syncError),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  ExpenseRow copyWith({
    int? id,
    Value<int?> remoteId = const Value.absent(),
    Value<String?> syncKey = const Value.absent(),
    int? walletId,
    int? expenseTypeId,
    int? vendorId,
    String? description,
    double? total,
    Value<double?> currencyFactor = const Value.absent(),
    String? buyDate,
    int? sortId,
    String? syncStatus,
    Value<String?> syncError = const Value.absent(),
    DateTime? createdAt,
    DateTime? updatedAt,
  }) => ExpenseRow(
    id: id ?? this.id,
    remoteId: remoteId.present ? remoteId.value : this.remoteId,
    syncKey: syncKey.present ? syncKey.value : this.syncKey,
    walletId: walletId ?? this.walletId,
    expenseTypeId: expenseTypeId ?? this.expenseTypeId,
    vendorId: vendorId ?? this.vendorId,
    description: description ?? this.description,
    total: total ?? this.total,
    currencyFactor: currencyFactor.present
        ? currencyFactor.value
        : this.currencyFactor,
    buyDate: buyDate ?? this.buyDate,
    sortId: sortId ?? this.sortId,
    syncStatus: syncStatus ?? this.syncStatus,
    syncError: syncError.present ? syncError.value : this.syncError,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  ExpenseRow copyWithCompanion(ExpensesCompanion data) {
    return ExpenseRow(
      id: data.id.present ? data.id.value : this.id,
      remoteId: data.remoteId.present ? data.remoteId.value : this.remoteId,
      syncKey: data.syncKey.present ? data.syncKey.value : this.syncKey,
      walletId: data.walletId.present ? data.walletId.value : this.walletId,
      expenseTypeId: data.expenseTypeId.present
          ? data.expenseTypeId.value
          : this.expenseTypeId,
      vendorId: data.vendorId.present ? data.vendorId.value : this.vendorId,
      description: data.description.present
          ? data.description.value
          : this.description,
      total: data.total.present ? data.total.value : this.total,
      currencyFactor: data.currencyFactor.present
          ? data.currencyFactor.value
          : this.currencyFactor,
      buyDate: data.buyDate.present ? data.buyDate.value : this.buyDate,
      sortId: data.sortId.present ? data.sortId.value : this.sortId,
      syncStatus: data.syncStatus.present
          ? data.syncStatus.value
          : this.syncStatus,
      syncError: data.syncError.present ? data.syncError.value : this.syncError,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ExpenseRow(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('syncKey: $syncKey, ')
          ..write('walletId: $walletId, ')
          ..write('expenseTypeId: $expenseTypeId, ')
          ..write('vendorId: $vendorId, ')
          ..write('description: $description, ')
          ..write('total: $total, ')
          ..write('currencyFactor: $currencyFactor, ')
          ..write('buyDate: $buyDate, ')
          ..write('sortId: $sortId, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('syncError: $syncError, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    remoteId,
    syncKey,
    walletId,
    expenseTypeId,
    vendorId,
    description,
    total,
    currencyFactor,
    buyDate,
    sortId,
    syncStatus,
    syncError,
    createdAt,
    updatedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ExpenseRow &&
          other.id == this.id &&
          other.remoteId == this.remoteId &&
          other.syncKey == this.syncKey &&
          other.walletId == this.walletId &&
          other.expenseTypeId == this.expenseTypeId &&
          other.vendorId == this.vendorId &&
          other.description == this.description &&
          other.total == this.total &&
          other.currencyFactor == this.currencyFactor &&
          other.buyDate == this.buyDate &&
          other.sortId == this.sortId &&
          other.syncStatus == this.syncStatus &&
          other.syncError == this.syncError &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class ExpensesCompanion extends UpdateCompanion<ExpenseRow> {
  final Value<int> id;
  final Value<int?> remoteId;
  final Value<String?> syncKey;
  final Value<int> walletId;
  final Value<int> expenseTypeId;
  final Value<int> vendorId;
  final Value<String> description;
  final Value<double> total;
  final Value<double?> currencyFactor;
  final Value<String> buyDate;
  final Value<int> sortId;
  final Value<String> syncStatus;
  final Value<String?> syncError;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  const ExpensesCompanion({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    this.syncKey = const Value.absent(),
    this.walletId = const Value.absent(),
    this.expenseTypeId = const Value.absent(),
    this.vendorId = const Value.absent(),
    this.description = const Value.absent(),
    this.total = const Value.absent(),
    this.currencyFactor = const Value.absent(),
    this.buyDate = const Value.absent(),
    this.sortId = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.syncError = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
  });
  ExpensesCompanion.insert({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    this.syncKey = const Value.absent(),
    required int walletId,
    required int expenseTypeId,
    required int vendorId,
    required String description,
    required double total,
    this.currencyFactor = const Value.absent(),
    required String buyDate,
    this.sortId = const Value.absent(),
    required String syncStatus,
    this.syncError = const Value.absent(),
    required DateTime createdAt,
    required DateTime updatedAt,
  }) : walletId = Value(walletId),
       expenseTypeId = Value(expenseTypeId),
       vendorId = Value(vendorId),
       description = Value(description),
       total = Value(total),
       buyDate = Value(buyDate),
       syncStatus = Value(syncStatus),
       createdAt = Value(createdAt),
       updatedAt = Value(updatedAt);
  static Insertable<ExpenseRow> custom({
    Expression<int>? id,
    Expression<int>? remoteId,
    Expression<String>? syncKey,
    Expression<int>? walletId,
    Expression<int>? expenseTypeId,
    Expression<int>? vendorId,
    Expression<String>? description,
    Expression<double>? total,
    Expression<double>? currencyFactor,
    Expression<String>? buyDate,
    Expression<int>? sortId,
    Expression<String>? syncStatus,
    Expression<String>? syncError,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (remoteId != null) 'remote_id': remoteId,
      if (syncKey != null) 'sync_key': syncKey,
      if (walletId != null) 'wallet_id': walletId,
      if (expenseTypeId != null) 'expense_type_id': expenseTypeId,
      if (vendorId != null) 'vendor_id': vendorId,
      if (description != null) 'description': description,
      if (total != null) 'total': total,
      if (currencyFactor != null) 'currency_factor': currencyFactor,
      if (buyDate != null) 'buy_date': buyDate,
      if (sortId != null) 'sort_id': sortId,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (syncError != null) 'sync_error': syncError,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
    });
  }

  ExpensesCompanion copyWith({
    Value<int>? id,
    Value<int?>? remoteId,
    Value<String?>? syncKey,
    Value<int>? walletId,
    Value<int>? expenseTypeId,
    Value<int>? vendorId,
    Value<String>? description,
    Value<double>? total,
    Value<double?>? currencyFactor,
    Value<String>? buyDate,
    Value<int>? sortId,
    Value<String>? syncStatus,
    Value<String?>? syncError,
    Value<DateTime>? createdAt,
    Value<DateTime>? updatedAt,
  }) {
    return ExpensesCompanion(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      syncKey: syncKey ?? this.syncKey,
      walletId: walletId ?? this.walletId,
      expenseTypeId: expenseTypeId ?? this.expenseTypeId,
      vendorId: vendorId ?? this.vendorId,
      description: description ?? this.description,
      total: total ?? this.total,
      currencyFactor: currencyFactor ?? this.currencyFactor,
      buyDate: buyDate ?? this.buyDate,
      sortId: sortId ?? this.sortId,
      syncStatus: syncStatus ?? this.syncStatus,
      syncError: syncError ?? this.syncError,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (remoteId.present) {
      map['remote_id'] = Variable<int>(remoteId.value);
    }
    if (syncKey.present) {
      map['sync_key'] = Variable<String>(syncKey.value);
    }
    if (walletId.present) {
      map['wallet_id'] = Variable<int>(walletId.value);
    }
    if (expenseTypeId.present) {
      map['expense_type_id'] = Variable<int>(expenseTypeId.value);
    }
    if (vendorId.present) {
      map['vendor_id'] = Variable<int>(vendorId.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (total.present) {
      map['total'] = Variable<double>(total.value);
    }
    if (currencyFactor.present) {
      map['currency_factor'] = Variable<double>(currencyFactor.value);
    }
    if (buyDate.present) {
      map['buy_date'] = Variable<String>(buyDate.value);
    }
    if (sortId.present) {
      map['sort_id'] = Variable<int>(sortId.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<String>(syncStatus.value);
    }
    if (syncError.present) {
      map['sync_error'] = Variable<String>(syncError.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ExpensesCompanion(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('syncKey: $syncKey, ')
          ..write('walletId: $walletId, ')
          ..write('expenseTypeId: $expenseTypeId, ')
          ..write('vendorId: $vendorId, ')
          ..write('description: $description, ')
          ..write('total: $total, ')
          ..write('currencyFactor: $currencyFactor, ')
          ..write('buyDate: $buyDate, ')
          ..write('sortId: $sortId, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('syncError: $syncError, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }
}

class $SyncMetadataTable extends SyncMetadata
    with TableInfo<$SyncMetadataTable, SyncMetadataRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SyncMetadataTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _keyMeta = const VerificationMeta('key');
  @override
  late final GeneratedColumn<String> key = GeneratedColumn<String>(
    'key',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _valueMeta = const VerificationMeta('value');
  @override
  late final GeneratedColumn<String> value = GeneratedColumn<String>(
    'value',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [key, value];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sync_metadata';
  @override
  VerificationContext validateIntegrity(
    Insertable<SyncMetadataRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('key')) {
      context.handle(
        _keyMeta,
        key.isAcceptableOrUnknown(data['key']!, _keyMeta),
      );
    } else if (isInserting) {
      context.missing(_keyMeta);
    }
    if (data.containsKey('value')) {
      context.handle(
        _valueMeta,
        value.isAcceptableOrUnknown(data['value']!, _valueMeta),
      );
    } else if (isInserting) {
      context.missing(_valueMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {key};
  @override
  SyncMetadataRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SyncMetadataRow(
      key: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}key'],
      )!,
      value: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}value'],
      )!,
    );
  }

  @override
  $SyncMetadataTable createAlias(String alias) {
    return $SyncMetadataTable(attachedDatabase, alias);
  }
}

class SyncMetadataRow extends DataClass implements Insertable<SyncMetadataRow> {
  final String key;
  final String value;
  const SyncMetadataRow({required this.key, required this.value});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['key'] = Variable<String>(key);
    map['value'] = Variable<String>(value);
    return map;
  }

  SyncMetadataCompanion toCompanion(bool nullToAbsent) {
    return SyncMetadataCompanion(key: Value(key), value: Value(value));
  }

  factory SyncMetadataRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SyncMetadataRow(
      key: serializer.fromJson<String>(json['key']),
      value: serializer.fromJson<String>(json['value']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'key': serializer.toJson<String>(key),
      'value': serializer.toJson<String>(value),
    };
  }

  SyncMetadataRow copyWith({String? key, String? value}) =>
      SyncMetadataRow(key: key ?? this.key, value: value ?? this.value);
  SyncMetadataRow copyWithCompanion(SyncMetadataCompanion data) {
    return SyncMetadataRow(
      key: data.key.present ? data.key.value : this.key,
      value: data.value.present ? data.value.value : this.value,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SyncMetadataRow(')
          ..write('key: $key, ')
          ..write('value: $value')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(key, value);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SyncMetadataRow &&
          other.key == this.key &&
          other.value == this.value);
}

class SyncMetadataCompanion extends UpdateCompanion<SyncMetadataRow> {
  final Value<String> key;
  final Value<String> value;
  final Value<int> rowid;
  const SyncMetadataCompanion({
    this.key = const Value.absent(),
    this.value = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SyncMetadataCompanion.insert({
    required String key,
    required String value,
    this.rowid = const Value.absent(),
  }) : key = Value(key),
       value = Value(value);
  static Insertable<SyncMetadataRow> custom({
    Expression<String>? key,
    Expression<String>? value,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (key != null) 'key': key,
      if (value != null) 'value': value,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SyncMetadataCompanion copyWith({
    Value<String>? key,
    Value<String>? value,
    Value<int>? rowid,
  }) {
    return SyncMetadataCompanion(
      key: key ?? this.key,
      value: value ?? this.value,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (key.present) {
      map['key'] = Variable<String>(key.value);
    }
    if (value.present) {
      map['value'] = Variable<String>(value.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SyncMetadataCompanion(')
          ..write('key: $key, ')
          ..write('value: $value, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $CurrenciesTable currencies = $CurrenciesTable(this);
  late final $WalletGroupsTable walletGroups = $WalletGroupsTable(this);
  late final $WalletsTable wallets = $WalletsTable(this);
  late final $WalletMembersTable walletMembers = $WalletMembersTable(this);
  late final $ExpenseTypesTable expenseTypes = $ExpenseTypesTable(this);
  late final $VendorsTable vendors = $VendorsTable(this);
  late final $CreditCardsTable creditCards = $CreditCardsTable(this);
  late final $ExpensesTable expenses = $ExpensesTable(this);
  late final $SyncMetadataTable syncMetadata = $SyncMetadataTable(this);
  late final Index idxWalletsCurrency = Index(
    'idx_wallets_currency',
    'CREATE INDEX idx_wallets_currency ON wallets (currency_id)',
  );
  late final Index idxWalletMembersWallet = Index(
    'idx_wallet_members_wallet',
    'CREATE INDEX idx_wallet_members_wallet ON wallet_members (wallet_id)',
  );
  late final Index idxWalletMembersGroup = Index(
    'idx_wallet_members_group',
    'CREATE INDEX idx_wallet_members_group ON wallet_members (wallet_group_id)',
  );
  late final Index idxCreditCardsGroup = Index(
    'idx_credit_cards_group',
    'CREATE INDEX idx_credit_cards_group ON credit_cards (wallet_group_id)',
  );
  late final Index idxExpensesRemoteId = Index(
    'idx_expenses_remote_id',
    'CREATE UNIQUE INDEX idx_expenses_remote_id ON expenses (remote_id)',
  );
  late final Index idxExpensesSyncKey = Index(
    'idx_expenses_sync_key',
    'CREATE UNIQUE INDEX idx_expenses_sync_key ON expenses (sync_key)',
  );
  late final Index idxExpensesBuyDate = Index(
    'idx_expenses_buy_date',
    'CREATE INDEX idx_expenses_buy_date ON expenses (buy_date)',
  );
  late final Index idxExpensesWallet = Index(
    'idx_expenses_wallet',
    'CREATE INDEX idx_expenses_wallet ON expenses (wallet_id, buy_date)',
  );
  late final Index idxExpensesExpenseType = Index(
    'idx_expenses_expense_type',
    'CREATE INDEX idx_expenses_expense_type ON expenses (expense_type_id, buy_date)',
  );
  late final Index idxExpensesVendor = Index(
    'idx_expenses_vendor',
    'CREATE INDEX idx_expenses_vendor ON expenses (vendor_id, buy_date)',
  );
  late final Index idxExpensesSyncStatus = Index(
    'idx_expenses_sync_status',
    'CREATE INDEX idx_expenses_sync_status ON expenses (sync_status)',
  );
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
    currencies,
    walletGroups,
    wallets,
    walletMembers,
    expenseTypes,
    vendors,
    creditCards,
    expenses,
    syncMetadata,
    idxWalletsCurrency,
    idxWalletMembersWallet,
    idxWalletMembersGroup,
    idxCreditCardsGroup,
    idxExpensesRemoteId,
    idxExpensesSyncKey,
    idxExpensesBuyDate,
    idxExpensesWallet,
    idxExpensesExpenseType,
    idxExpensesVendor,
    idxExpensesSyncStatus,
  ];
}

typedef $$CurrenciesTableCreateCompanionBuilder =
    CurrenciesCompanion Function({
      Value<int> id,
      required String name,
      required String symbol,
      required double conversion,
    });
typedef $$CurrenciesTableUpdateCompanionBuilder =
    CurrenciesCompanion Function({
      Value<int> id,
      Value<String> name,
      Value<String> symbol,
      Value<double> conversion,
    });

class $$CurrenciesTableFilterComposer
    extends Composer<_$AppDatabase, $CurrenciesTable> {
  $$CurrenciesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get symbol => $composableBuilder(
    column: $table.symbol,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get conversion => $composableBuilder(
    column: $table.conversion,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CurrenciesTableOrderingComposer
    extends Composer<_$AppDatabase, $CurrenciesTable> {
  $$CurrenciesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get symbol => $composableBuilder(
    column: $table.symbol,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get conversion => $composableBuilder(
    column: $table.conversion,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CurrenciesTableAnnotationComposer
    extends Composer<_$AppDatabase, $CurrenciesTable> {
  $$CurrenciesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get symbol =>
      $composableBuilder(column: $table.symbol, builder: (column) => column);

  GeneratedColumn<double> get conversion => $composableBuilder(
    column: $table.conversion,
    builder: (column) => column,
  );
}

class $$CurrenciesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $CurrenciesTable,
          CurrencyRow,
          $$CurrenciesTableFilterComposer,
          $$CurrenciesTableOrderingComposer,
          $$CurrenciesTableAnnotationComposer,
          $$CurrenciesTableCreateCompanionBuilder,
          $$CurrenciesTableUpdateCompanionBuilder,
          (
            CurrencyRow,
            BaseReferences<_$AppDatabase, $CurrenciesTable, CurrencyRow>,
          ),
          CurrencyRow,
          PrefetchHooks Function()
        > {
  $$CurrenciesTableTableManager(_$AppDatabase db, $CurrenciesTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CurrenciesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CurrenciesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CurrenciesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String> symbol = const Value.absent(),
                Value<double> conversion = const Value.absent(),
              }) => CurrenciesCompanion(
                id: id,
                name: name,
                symbol: symbol,
                conversion: conversion,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String name,
                required String symbol,
                required double conversion,
              }) => CurrenciesCompanion.insert(
                id: id,
                name: name,
                symbol: symbol,
                conversion: conversion,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$CurrenciesTable, CurrencyRow>(table),
                  BaseReferences<_$AppDatabase, $CurrenciesTable, CurrencyRow>(
                    db,
                    table,
                    e,
                  ),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CurrenciesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $CurrenciesTable,
      CurrencyRow,
      $$CurrenciesTableFilterComposer,
      $$CurrenciesTableOrderingComposer,
      $$CurrenciesTableAnnotationComposer,
      $$CurrenciesTableCreateCompanionBuilder,
      $$CurrenciesTableUpdateCompanionBuilder,
      (
        CurrencyRow,
        BaseReferences<_$AppDatabase, $CurrenciesTable, CurrencyRow>,
      ),
      CurrencyRow,
      PrefetchHooks Function()
    >;
typedef $$WalletGroupsTableCreateCompanionBuilder =
    WalletGroupsCompanion Function({
      Value<int> id,
      required String name,
      Value<bool> isActive,
    });
typedef $$WalletGroupsTableUpdateCompanionBuilder =
    WalletGroupsCompanion Function({
      Value<int> id,
      Value<String> name,
      Value<bool> isActive,
    });

class $$WalletGroupsTableFilterComposer
    extends Composer<_$AppDatabase, $WalletGroupsTable> {
  $$WalletGroupsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get isActive => $composableBuilder(
    column: $table.isActive,
    builder: (column) => ColumnFilters(column),
  );
}

class $$WalletGroupsTableOrderingComposer
    extends Composer<_$AppDatabase, $WalletGroupsTable> {
  $$WalletGroupsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get isActive => $composableBuilder(
    column: $table.isActive,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$WalletGroupsTableAnnotationComposer
    extends Composer<_$AppDatabase, $WalletGroupsTable> {
  $$WalletGroupsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<bool> get isActive =>
      $composableBuilder(column: $table.isActive, builder: (column) => column);
}

class $$WalletGroupsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $WalletGroupsTable,
          WalletGroupRow,
          $$WalletGroupsTableFilterComposer,
          $$WalletGroupsTableOrderingComposer,
          $$WalletGroupsTableAnnotationComposer,
          $$WalletGroupsTableCreateCompanionBuilder,
          $$WalletGroupsTableUpdateCompanionBuilder,
          (
            WalletGroupRow,
            BaseReferences<_$AppDatabase, $WalletGroupsTable, WalletGroupRow>,
          ),
          WalletGroupRow,
          PrefetchHooks Function()
        > {
  $$WalletGroupsTableTableManager(_$AppDatabase db, $WalletGroupsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$WalletGroupsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$WalletGroupsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$WalletGroupsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<bool> isActive = const Value.absent(),
              }) =>
                  WalletGroupsCompanion(id: id, name: name, isActive: isActive),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String name,
                Value<bool> isActive = const Value.absent(),
              }) => WalletGroupsCompanion.insert(
                id: id,
                name: name,
                isActive: isActive,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$WalletGroupsTable, WalletGroupRow>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $WalletGroupsTable,
                    WalletGroupRow
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$WalletGroupsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $WalletGroupsTable,
      WalletGroupRow,
      $$WalletGroupsTableFilterComposer,
      $$WalletGroupsTableOrderingComposer,
      $$WalletGroupsTableAnnotationComposer,
      $$WalletGroupsTableCreateCompanionBuilder,
      $$WalletGroupsTableUpdateCompanionBuilder,
      (
        WalletGroupRow,
        BaseReferences<_$AppDatabase, $WalletGroupsTable, WalletGroupRow>,
      ),
      WalletGroupRow,
      PrefetchHooks Function()
    >;
typedef $$WalletsTableCreateCompanionBuilder =
    WalletsCompanion Function({
      Value<int> id,
      required String name,
      required int currencyId,
    });
typedef $$WalletsTableUpdateCompanionBuilder =
    WalletsCompanion Function({
      Value<int> id,
      Value<String> name,
      Value<int> currencyId,
    });

class $$WalletsTableFilterComposer
    extends Composer<_$AppDatabase, $WalletsTable> {
  $$WalletsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get currencyId => $composableBuilder(
    column: $table.currencyId,
    builder: (column) => ColumnFilters(column),
  );
}

class $$WalletsTableOrderingComposer
    extends Composer<_$AppDatabase, $WalletsTable> {
  $$WalletsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get currencyId => $composableBuilder(
    column: $table.currencyId,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$WalletsTableAnnotationComposer
    extends Composer<_$AppDatabase, $WalletsTable> {
  $$WalletsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<int> get currencyId => $composableBuilder(
    column: $table.currencyId,
    builder: (column) => column,
  );
}

class $$WalletsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $WalletsTable,
          WalletRow,
          $$WalletsTableFilterComposer,
          $$WalletsTableOrderingComposer,
          $$WalletsTableAnnotationComposer,
          $$WalletsTableCreateCompanionBuilder,
          $$WalletsTableUpdateCompanionBuilder,
          (WalletRow, BaseReferences<_$AppDatabase, $WalletsTable, WalletRow>),
          WalletRow,
          PrefetchHooks Function()
        > {
  $$WalletsTableTableManager(_$AppDatabase db, $WalletsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$WalletsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$WalletsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$WalletsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<int> currencyId = const Value.absent(),
              }) =>
                  WalletsCompanion(id: id, name: name, currencyId: currencyId),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String name,
                required int currencyId,
              }) => WalletsCompanion.insert(
                id: id,
                name: name,
                currencyId: currencyId,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$WalletsTable, WalletRow>(table),
                  BaseReferences<_$AppDatabase, $WalletsTable, WalletRow>(
                    db,
                    table,
                    e,
                  ),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$WalletsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $WalletsTable,
      WalletRow,
      $$WalletsTableFilterComposer,
      $$WalletsTableOrderingComposer,
      $$WalletsTableAnnotationComposer,
      $$WalletsTableCreateCompanionBuilder,
      $$WalletsTableUpdateCompanionBuilder,
      (WalletRow, BaseReferences<_$AppDatabase, $WalletsTable, WalletRow>),
      WalletRow,
      PrefetchHooks Function()
    >;
typedef $$WalletMembersTableCreateCompanionBuilder =
    WalletMembersCompanion Function({
      Value<int> id,
      required int walletId,
      required int walletGroupId,
      Value<int?> forwardWalletId,
    });
typedef $$WalletMembersTableUpdateCompanionBuilder =
    WalletMembersCompanion Function({
      Value<int> id,
      Value<int> walletId,
      Value<int> walletGroupId,
      Value<int?> forwardWalletId,
    });

class $$WalletMembersTableFilterComposer
    extends Composer<_$AppDatabase, $WalletMembersTable> {
  $$WalletMembersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get walletId => $composableBuilder(
    column: $table.walletId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get walletGroupId => $composableBuilder(
    column: $table.walletGroupId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get forwardWalletId => $composableBuilder(
    column: $table.forwardWalletId,
    builder: (column) => ColumnFilters(column),
  );
}

class $$WalletMembersTableOrderingComposer
    extends Composer<_$AppDatabase, $WalletMembersTable> {
  $$WalletMembersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get walletId => $composableBuilder(
    column: $table.walletId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get walletGroupId => $composableBuilder(
    column: $table.walletGroupId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get forwardWalletId => $composableBuilder(
    column: $table.forwardWalletId,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$WalletMembersTableAnnotationComposer
    extends Composer<_$AppDatabase, $WalletMembersTable> {
  $$WalletMembersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<int> get walletId =>
      $composableBuilder(column: $table.walletId, builder: (column) => column);

  GeneratedColumn<int> get walletGroupId => $composableBuilder(
    column: $table.walletGroupId,
    builder: (column) => column,
  );

  GeneratedColumn<int> get forwardWalletId => $composableBuilder(
    column: $table.forwardWalletId,
    builder: (column) => column,
  );
}

class $$WalletMembersTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $WalletMembersTable,
          WalletMemberRow,
          $$WalletMembersTableFilterComposer,
          $$WalletMembersTableOrderingComposer,
          $$WalletMembersTableAnnotationComposer,
          $$WalletMembersTableCreateCompanionBuilder,
          $$WalletMembersTableUpdateCompanionBuilder,
          (
            WalletMemberRow,
            BaseReferences<_$AppDatabase, $WalletMembersTable, WalletMemberRow>,
          ),
          WalletMemberRow,
          PrefetchHooks Function()
        > {
  $$WalletMembersTableTableManager(_$AppDatabase db, $WalletMembersTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$WalletMembersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$WalletMembersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$WalletMembersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int> walletId = const Value.absent(),
                Value<int> walletGroupId = const Value.absent(),
                Value<int?> forwardWalletId = const Value.absent(),
              }) => WalletMembersCompanion(
                id: id,
                walletId: walletId,
                walletGroupId: walletGroupId,
                forwardWalletId: forwardWalletId,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required int walletId,
                required int walletGroupId,
                Value<int?> forwardWalletId = const Value.absent(),
              }) => WalletMembersCompanion.insert(
                id: id,
                walletId: walletId,
                walletGroupId: walletGroupId,
                forwardWalletId: forwardWalletId,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$WalletMembersTable, WalletMemberRow>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $WalletMembersTable,
                    WalletMemberRow
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$WalletMembersTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $WalletMembersTable,
      WalletMemberRow,
      $$WalletMembersTableFilterComposer,
      $$WalletMembersTableOrderingComposer,
      $$WalletMembersTableAnnotationComposer,
      $$WalletMembersTableCreateCompanionBuilder,
      $$WalletMembersTableUpdateCompanionBuilder,
      (
        WalletMemberRow,
        BaseReferences<_$AppDatabase, $WalletMembersTable, WalletMemberRow>,
      ),
      WalletMemberRow,
      PrefetchHooks Function()
    >;
typedef $$ExpenseTypesTableCreateCompanionBuilder =
    ExpenseTypesCompanion Function({
      Value<int> id,
      required String name,
      Value<String?> icon,
    });
typedef $$ExpenseTypesTableUpdateCompanionBuilder =
    ExpenseTypesCompanion Function({
      Value<int> id,
      Value<String> name,
      Value<String?> icon,
    });

class $$ExpenseTypesTableFilterComposer
    extends Composer<_$AppDatabase, $ExpenseTypesTable> {
  $$ExpenseTypesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get icon => $composableBuilder(
    column: $table.icon,
    builder: (column) => ColumnFilters(column),
  );
}

class $$ExpenseTypesTableOrderingComposer
    extends Composer<_$AppDatabase, $ExpenseTypesTable> {
  $$ExpenseTypesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get icon => $composableBuilder(
    column: $table.icon,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$ExpenseTypesTableAnnotationComposer
    extends Composer<_$AppDatabase, $ExpenseTypesTable> {
  $$ExpenseTypesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get icon =>
      $composableBuilder(column: $table.icon, builder: (column) => column);
}

class $$ExpenseTypesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $ExpenseTypesTable,
          ExpenseTypeRow,
          $$ExpenseTypesTableFilterComposer,
          $$ExpenseTypesTableOrderingComposer,
          $$ExpenseTypesTableAnnotationComposer,
          $$ExpenseTypesTableCreateCompanionBuilder,
          $$ExpenseTypesTableUpdateCompanionBuilder,
          (
            ExpenseTypeRow,
            BaseReferences<_$AppDatabase, $ExpenseTypesTable, ExpenseTypeRow>,
          ),
          ExpenseTypeRow,
          PrefetchHooks Function()
        > {
  $$ExpenseTypesTableTableManager(_$AppDatabase db, $ExpenseTypesTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ExpenseTypesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ExpenseTypesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ExpenseTypesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String?> icon = const Value.absent(),
              }) => ExpenseTypesCompanion(id: id, name: name, icon: icon),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String name,
                Value<String?> icon = const Value.absent(),
              }) =>
                  ExpenseTypesCompanion.insert(id: id, name: name, icon: icon),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$ExpenseTypesTable, ExpenseTypeRow>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $ExpenseTypesTable,
                    ExpenseTypeRow
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$ExpenseTypesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $ExpenseTypesTable,
      ExpenseTypeRow,
      $$ExpenseTypesTableFilterComposer,
      $$ExpenseTypesTableOrderingComposer,
      $$ExpenseTypesTableAnnotationComposer,
      $$ExpenseTypesTableCreateCompanionBuilder,
      $$ExpenseTypesTableUpdateCompanionBuilder,
      (
        ExpenseTypeRow,
        BaseReferences<_$AppDatabase, $ExpenseTypesTable, ExpenseTypeRow>,
      ),
      ExpenseTypeRow,
      PrefetchHooks Function()
    >;
typedef $$VendorsTableCreateCompanionBuilder =
    VendorsCompanion Function({Value<int> id, required String name});
typedef $$VendorsTableUpdateCompanionBuilder =
    VendorsCompanion Function({Value<int> id, Value<String> name});

class $$VendorsTableFilterComposer
    extends Composer<_$AppDatabase, $VendorsTable> {
  $$VendorsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );
}

class $$VendorsTableOrderingComposer
    extends Composer<_$AppDatabase, $VendorsTable> {
  $$VendorsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$VendorsTableAnnotationComposer
    extends Composer<_$AppDatabase, $VendorsTable> {
  $$VendorsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);
}

class $$VendorsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $VendorsTable,
          VendorRow,
          $$VendorsTableFilterComposer,
          $$VendorsTableOrderingComposer,
          $$VendorsTableAnnotationComposer,
          $$VendorsTableCreateCompanionBuilder,
          $$VendorsTableUpdateCompanionBuilder,
          (VendorRow, BaseReferences<_$AppDatabase, $VendorsTable, VendorRow>),
          VendorRow,
          PrefetchHooks Function()
        > {
  $$VendorsTableTableManager(_$AppDatabase db, $VendorsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$VendorsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$VendorsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$VendorsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> name = const Value.absent(),
              }) => VendorsCompanion(id: id, name: name),
          createCompanionCallback:
              ({Value<int> id = const Value.absent(), required String name}) =>
                  VendorsCompanion.insert(id: id, name: name),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$VendorsTable, VendorRow>(table),
                  BaseReferences<_$AppDatabase, $VendorsTable, VendorRow>(
                    db,
                    table,
                    e,
                  ),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$VendorsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $VendorsTable,
      VendorRow,
      $$VendorsTableFilterComposer,
      $$VendorsTableOrderingComposer,
      $$VendorsTableAnnotationComposer,
      $$VendorsTableCreateCompanionBuilder,
      $$VendorsTableUpdateCompanionBuilder,
      (VendorRow, BaseReferences<_$AppDatabase, $VendorsTable, VendorRow>),
      VendorRow,
      PrefetchHooks Function()
    >;
typedef $$CreditCardsTableCreateCompanionBuilder =
    CreditCardsCompanion Function({
      Value<int> id,
      required int walletGroupId,
      required int active,
    });
typedef $$CreditCardsTableUpdateCompanionBuilder =
    CreditCardsCompanion Function({
      Value<int> id,
      Value<int> walletGroupId,
      Value<int> active,
    });

class $$CreditCardsTableFilterComposer
    extends Composer<_$AppDatabase, $CreditCardsTable> {
  $$CreditCardsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get walletGroupId => $composableBuilder(
    column: $table.walletGroupId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get active => $composableBuilder(
    column: $table.active,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CreditCardsTableOrderingComposer
    extends Composer<_$AppDatabase, $CreditCardsTable> {
  $$CreditCardsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get walletGroupId => $composableBuilder(
    column: $table.walletGroupId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get active => $composableBuilder(
    column: $table.active,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CreditCardsTableAnnotationComposer
    extends Composer<_$AppDatabase, $CreditCardsTable> {
  $$CreditCardsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<int> get walletGroupId => $composableBuilder(
    column: $table.walletGroupId,
    builder: (column) => column,
  );

  GeneratedColumn<int> get active =>
      $composableBuilder(column: $table.active, builder: (column) => column);
}

class $$CreditCardsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $CreditCardsTable,
          CreditCardRow,
          $$CreditCardsTableFilterComposer,
          $$CreditCardsTableOrderingComposer,
          $$CreditCardsTableAnnotationComposer,
          $$CreditCardsTableCreateCompanionBuilder,
          $$CreditCardsTableUpdateCompanionBuilder,
          (
            CreditCardRow,
            BaseReferences<_$AppDatabase, $CreditCardsTable, CreditCardRow>,
          ),
          CreditCardRow,
          PrefetchHooks Function()
        > {
  $$CreditCardsTableTableManager(_$AppDatabase db, $CreditCardsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CreditCardsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CreditCardsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CreditCardsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int> walletGroupId = const Value.absent(),
                Value<int> active = const Value.absent(),
              }) => CreditCardsCompanion(
                id: id,
                walletGroupId: walletGroupId,
                active: active,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required int walletGroupId,
                required int active,
              }) => CreditCardsCompanion.insert(
                id: id,
                walletGroupId: walletGroupId,
                active: active,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$CreditCardsTable, CreditCardRow>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $CreditCardsTable,
                    CreditCardRow
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CreditCardsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $CreditCardsTable,
      CreditCardRow,
      $$CreditCardsTableFilterComposer,
      $$CreditCardsTableOrderingComposer,
      $$CreditCardsTableAnnotationComposer,
      $$CreditCardsTableCreateCompanionBuilder,
      $$CreditCardsTableUpdateCompanionBuilder,
      (
        CreditCardRow,
        BaseReferences<_$AppDatabase, $CreditCardsTable, CreditCardRow>,
      ),
      CreditCardRow,
      PrefetchHooks Function()
    >;
typedef $$ExpensesTableCreateCompanionBuilder =
    ExpensesCompanion Function({
      Value<int> id,
      Value<int?> remoteId,
      Value<String?> syncKey,
      required int walletId,
      required int expenseTypeId,
      required int vendorId,
      required String description,
      required double total,
      Value<double?> currencyFactor,
      required String buyDate,
      Value<int> sortId,
      required String syncStatus,
      Value<String?> syncError,
      required DateTime createdAt,
      required DateTime updatedAt,
    });
typedef $$ExpensesTableUpdateCompanionBuilder =
    ExpensesCompanion Function({
      Value<int> id,
      Value<int?> remoteId,
      Value<String?> syncKey,
      Value<int> walletId,
      Value<int> expenseTypeId,
      Value<int> vendorId,
      Value<String> description,
      Value<double> total,
      Value<double?> currencyFactor,
      Value<String> buyDate,
      Value<int> sortId,
      Value<String> syncStatus,
      Value<String?> syncError,
      Value<DateTime> createdAt,
      Value<DateTime> updatedAt,
    });

class $$ExpensesTableFilterComposer
    extends Composer<_$AppDatabase, $ExpensesTable> {
  $$ExpensesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get remoteId => $composableBuilder(
    column: $table.remoteId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get syncKey => $composableBuilder(
    column: $table.syncKey,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get walletId => $composableBuilder(
    column: $table.walletId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get expenseTypeId => $composableBuilder(
    column: $table.expenseTypeId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get vendorId => $composableBuilder(
    column: $table.vendorId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get total => $composableBuilder(
    column: $table.total,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get currencyFactor => $composableBuilder(
    column: $table.currencyFactor,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get buyDate => $composableBuilder(
    column: $table.buyDate,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get sortId => $composableBuilder(
    column: $table.sortId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get syncStatus => $composableBuilder(
    column: $table.syncStatus,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get syncError => $composableBuilder(
    column: $table.syncError,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$ExpensesTableOrderingComposer
    extends Composer<_$AppDatabase, $ExpensesTable> {
  $$ExpensesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get remoteId => $composableBuilder(
    column: $table.remoteId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get syncKey => $composableBuilder(
    column: $table.syncKey,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get walletId => $composableBuilder(
    column: $table.walletId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get expenseTypeId => $composableBuilder(
    column: $table.expenseTypeId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get vendorId => $composableBuilder(
    column: $table.vendorId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get total => $composableBuilder(
    column: $table.total,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get currencyFactor => $composableBuilder(
    column: $table.currencyFactor,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get buyDate => $composableBuilder(
    column: $table.buyDate,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get sortId => $composableBuilder(
    column: $table.sortId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get syncStatus => $composableBuilder(
    column: $table.syncStatus,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get syncError => $composableBuilder(
    column: $table.syncError,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$ExpensesTableAnnotationComposer
    extends Composer<_$AppDatabase, $ExpensesTable> {
  $$ExpensesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<int> get remoteId =>
      $composableBuilder(column: $table.remoteId, builder: (column) => column);

  GeneratedColumn<String> get syncKey =>
      $composableBuilder(column: $table.syncKey, builder: (column) => column);

  GeneratedColumn<int> get walletId =>
      $composableBuilder(column: $table.walletId, builder: (column) => column);

  GeneratedColumn<int> get expenseTypeId => $composableBuilder(
    column: $table.expenseTypeId,
    builder: (column) => column,
  );

  GeneratedColumn<int> get vendorId =>
      $composableBuilder(column: $table.vendorId, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => column,
  );

  GeneratedColumn<double> get total =>
      $composableBuilder(column: $table.total, builder: (column) => column);

  GeneratedColumn<double> get currencyFactor => $composableBuilder(
    column: $table.currencyFactor,
    builder: (column) => column,
  );

  GeneratedColumn<String> get buyDate =>
      $composableBuilder(column: $table.buyDate, builder: (column) => column);

  GeneratedColumn<int> get sortId =>
      $composableBuilder(column: $table.sortId, builder: (column) => column);

  GeneratedColumn<String> get syncStatus => $composableBuilder(
    column: $table.syncStatus,
    builder: (column) => column,
  );

  GeneratedColumn<String> get syncError =>
      $composableBuilder(column: $table.syncError, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$ExpensesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $ExpensesTable,
          ExpenseRow,
          $$ExpensesTableFilterComposer,
          $$ExpensesTableOrderingComposer,
          $$ExpensesTableAnnotationComposer,
          $$ExpensesTableCreateCompanionBuilder,
          $$ExpensesTableUpdateCompanionBuilder,
          (
            ExpenseRow,
            BaseReferences<_$AppDatabase, $ExpensesTable, ExpenseRow>,
          ),
          ExpenseRow,
          PrefetchHooks Function()
        > {
  $$ExpensesTableTableManager(_$AppDatabase db, $ExpensesTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ExpensesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ExpensesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ExpensesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int?> remoteId = const Value.absent(),
                Value<String?> syncKey = const Value.absent(),
                Value<int> walletId = const Value.absent(),
                Value<int> expenseTypeId = const Value.absent(),
                Value<int> vendorId = const Value.absent(),
                Value<String> description = const Value.absent(),
                Value<double> total = const Value.absent(),
                Value<double?> currencyFactor = const Value.absent(),
                Value<String> buyDate = const Value.absent(),
                Value<int> sortId = const Value.absent(),
                Value<String> syncStatus = const Value.absent(),
                Value<String?> syncError = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
              }) => ExpensesCompanion(
                id: id,
                remoteId: remoteId,
                syncKey: syncKey,
                walletId: walletId,
                expenseTypeId: expenseTypeId,
                vendorId: vendorId,
                description: description,
                total: total,
                currencyFactor: currencyFactor,
                buyDate: buyDate,
                sortId: sortId,
                syncStatus: syncStatus,
                syncError: syncError,
                createdAt: createdAt,
                updatedAt: updatedAt,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int?> remoteId = const Value.absent(),
                Value<String?> syncKey = const Value.absent(),
                required int walletId,
                required int expenseTypeId,
                required int vendorId,
                required String description,
                required double total,
                Value<double?> currencyFactor = const Value.absent(),
                required String buyDate,
                Value<int> sortId = const Value.absent(),
                required String syncStatus,
                Value<String?> syncError = const Value.absent(),
                required DateTime createdAt,
                required DateTime updatedAt,
              }) => ExpensesCompanion.insert(
                id: id,
                remoteId: remoteId,
                syncKey: syncKey,
                walletId: walletId,
                expenseTypeId: expenseTypeId,
                vendorId: vendorId,
                description: description,
                total: total,
                currencyFactor: currencyFactor,
                buyDate: buyDate,
                sortId: sortId,
                syncStatus: syncStatus,
                syncError: syncError,
                createdAt: createdAt,
                updatedAt: updatedAt,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$ExpensesTable, ExpenseRow>(table),
                  BaseReferences<_$AppDatabase, $ExpensesTable, ExpenseRow>(
                    db,
                    table,
                    e,
                  ),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$ExpensesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $ExpensesTable,
      ExpenseRow,
      $$ExpensesTableFilterComposer,
      $$ExpensesTableOrderingComposer,
      $$ExpensesTableAnnotationComposer,
      $$ExpensesTableCreateCompanionBuilder,
      $$ExpensesTableUpdateCompanionBuilder,
      (ExpenseRow, BaseReferences<_$AppDatabase, $ExpensesTable, ExpenseRow>),
      ExpenseRow,
      PrefetchHooks Function()
    >;
typedef $$SyncMetadataTableCreateCompanionBuilder =
    SyncMetadataCompanion Function({
      required String key,
      required String value,
      Value<int> rowid,
    });
typedef $$SyncMetadataTableUpdateCompanionBuilder =
    SyncMetadataCompanion Function({
      Value<String> key,
      Value<String> value,
      Value<int> rowid,
    });

class $$SyncMetadataTableFilterComposer
    extends Composer<_$AppDatabase, $SyncMetadataTable> {
  $$SyncMetadataTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get key => $composableBuilder(
    column: $table.key,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get value => $composableBuilder(
    column: $table.value,
    builder: (column) => ColumnFilters(column),
  );
}

class $$SyncMetadataTableOrderingComposer
    extends Composer<_$AppDatabase, $SyncMetadataTable> {
  $$SyncMetadataTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get key => $composableBuilder(
    column: $table.key,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get value => $composableBuilder(
    column: $table.value,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$SyncMetadataTableAnnotationComposer
    extends Composer<_$AppDatabase, $SyncMetadataTable> {
  $$SyncMetadataTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get key =>
      $composableBuilder(column: $table.key, builder: (column) => column);

  GeneratedColumn<String> get value =>
      $composableBuilder(column: $table.value, builder: (column) => column);
}

class $$SyncMetadataTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $SyncMetadataTable,
          SyncMetadataRow,
          $$SyncMetadataTableFilterComposer,
          $$SyncMetadataTableOrderingComposer,
          $$SyncMetadataTableAnnotationComposer,
          $$SyncMetadataTableCreateCompanionBuilder,
          $$SyncMetadataTableUpdateCompanionBuilder,
          (
            SyncMetadataRow,
            BaseReferences<_$AppDatabase, $SyncMetadataTable, SyncMetadataRow>,
          ),
          SyncMetadataRow,
          PrefetchHooks Function()
        > {
  $$SyncMetadataTableTableManager(_$AppDatabase db, $SyncMetadataTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SyncMetadataTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SyncMetadataTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SyncMetadataTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> key = const Value.absent(),
                Value<String> value = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => SyncMetadataCompanion(key: key, value: value, rowid: rowid),
          createCompanionCallback:
              ({
                required String key,
                required String value,
                Value<int> rowid = const Value.absent(),
              }) => SyncMetadataCompanion.insert(
                key: key,
                value: value,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$SyncMetadataTable, SyncMetadataRow>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $SyncMetadataTable,
                    SyncMetadataRow
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$SyncMetadataTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $SyncMetadataTable,
      SyncMetadataRow,
      $$SyncMetadataTableFilterComposer,
      $$SyncMetadataTableOrderingComposer,
      $$SyncMetadataTableAnnotationComposer,
      $$SyncMetadataTableCreateCompanionBuilder,
      $$SyncMetadataTableUpdateCompanionBuilder,
      (
        SyncMetadataRow,
        BaseReferences<_$AppDatabase, $SyncMetadataTable, SyncMetadataRow>,
      ),
      SyncMetadataRow,
      PrefetchHooks Function()
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$CurrenciesTableTableManager get currencies =>
      $$CurrenciesTableTableManager(_db, _db.currencies);
  $$WalletGroupsTableTableManager get walletGroups =>
      $$WalletGroupsTableTableManager(_db, _db.walletGroups);
  $$WalletsTableTableManager get wallets =>
      $$WalletsTableTableManager(_db, _db.wallets);
  $$WalletMembersTableTableManager get walletMembers =>
      $$WalletMembersTableTableManager(_db, _db.walletMembers);
  $$ExpenseTypesTableTableManager get expenseTypes =>
      $$ExpenseTypesTableTableManager(_db, _db.expenseTypes);
  $$VendorsTableTableManager get vendors =>
      $$VendorsTableTableManager(_db, _db.vendors);
  $$CreditCardsTableTableManager get creditCards =>
      $$CreditCardsTableTableManager(_db, _db.creditCards);
  $$ExpensesTableTableManager get expenses =>
      $$ExpensesTableTableManager(_db, _db.expenses);
  $$SyncMetadataTableTableManager get syncMetadata =>
      $$SyncMetadataTableTableManager(_db, _db.syncMetadata);
}
