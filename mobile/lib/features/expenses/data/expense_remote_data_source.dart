import 'package:intl/intl.dart';

import '../../../core/errors/app_exception.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/json_reader.dart';
import '../../../core/network/paginator.dart';
import '../../../core/utilities/iso_date.dart';
import '../domain/remote_expense.dart';

/// Downloads expenses from Ledger.
abstract interface class ExpenseRemoteDataSource {
  /// Downloads every expense whose date is inside [range] (inclusive),
  /// following pagination until the server-reported total is reached.
  Future<List<RemoteExpense>> fetchRange(DateRange range, {PageProgress? onProgress});
}

/// [ExpenseRemoteDataSource] over `GET /expenses` (with
/// `excludeInstallmentParents=true`).
class LedgerExpenseRemoteDataSource implements ExpenseRemoteDataSource {
  LedgerExpenseRemoteDataSource(this._client, {this.pageSize = 100});

  final ApiClient _client;
  final int pageSize;

  @override
  Future<List<RemoteExpense>> fetchRange(DateRange range, {PageProgress? onProgress}) async {
    // The backend turns `start`/`end` into JS Dates (UTC midnight) before
    // comparing them with the DATE column, so on a server whose timezone is
    // not UTC the boundary days could be shifted. Ask for one extra day on
    // each side and filter locally to the exact inclusive window.
    final start = IsoDate.parse(range.start).subtract(const Duration(days: 1));
    final end = IsoDate.parse(range.end).add(const Duration(days: 1));

    final paginator = Paginator<RemoteExpense>(
      pageSize: pageSize,
      idOf: (e) => e.id,
      fetchPage: (page, size) async {
        final data = await _client.get('/expenses', query: {
          'start': IsoDate.format(start),
          'end': IsoDate.format(end),
          'page': page,
          'pageSize': size,
          // A unique sort key keeps offset pagination stable (the default
          // buyDate order has ties, which can skip or repeat rows).
          'orderBy': 'id',
          'orderDirection': 'ASC',
          // Interest-free monthly purchases are stored twice in Ledger: the
          // full purchase plus one expense per installment. Only download the
          // installments so the purchase is not counted twice.
          'excludeInstallmentParents': 'true',
        });
        return parsePage(data);
      },
    );
    final all = await paginator.fetchAll(onProgress: onProgress);
    return all.where((e) => range.contains(e.buyDate)).toList(growable: false);
  }

  /// Parses one `{ result, pagination, total }` page.
  static PageResult<RemoteExpense> parsePage(Object? data) {
    final body = JsonReader.map(data, 'expenses');
    final pagination = JsonReader.map(body['pagination'], 'expenses.pagination');
    final items = JsonReader.list(body['result'], 'expenses.result')
        .map((raw) => parseExpense(JsonReader.map(raw, 'expense')))
        .toList();
    return PageResult(items: items, totalCount: JsonReader.integer(pagination, 'total', 'pagination'));
  }

  static final DateFormat _ledgerDateFormat = DateFormat('MMMM d, y', 'en_US');

  /// Parses one expense item. `total` in this response is a formatted string,
  /// so the numeric amount is read from `rawTotal`; `buyDate` is formatted as
  /// `October 26, 2026` (en-US) and converted back to `YYYY-MM-DD`.
  static RemoteExpense parseExpense(Map<String, Object?> j) {
    const ctx = 'expense';
    final factor = JsonReader.nullableNumber(j, 'currencyFactor', ctx);
    return RemoteExpense(
      id: JsonReader.integer(j, 'id', ctx),
      walletId: JsonReader.integer(j, 'walletId', ctx),
      expenseTypeId: JsonReader.integer(j, 'expenseTypeId', ctx),
      vendorId: JsonReader.integer(j, 'vendorId', ctx),
      description: JsonReader.string(j, 'description', ctx),
      total: j.containsKey('rawTotal')
          ? JsonReader.number(j, 'rawTotal', ctx)
          : JsonReader.number(j, 'total', ctx),
      currencyFactor: factor,
      buyDate: parseLedgerDate(JsonReader.string(j, 'buyDate', ctx)),
      sortId: JsonReader.nullableInteger(j, 'sortId', ctx) ?? 0,
    );
  }

  /// Accepts `YYYY-MM-DD`, ISO timestamps and Ledger's `Month D, YYYY`.
  static String parseLedgerDate(String value) {
    final trimmed = value.trim();
    if (IsoDate.isValid(trimmed)) return trimmed;
    if (trimmed.length > 10 && IsoDate.isValid(trimmed.substring(0, 10)) && trimmed[10] == 'T') {
      return trimmed.substring(0, 10);
    }
    try {
      return IsoDate.format(_ledgerDateFormat.parseStrict(trimmed));
    } on FormatException {
      throw ApiException.invalidResponse('Unrecognized expense date "$value"');
    }
  }
}
