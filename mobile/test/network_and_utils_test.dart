import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ledger_mobile/core/configuration/api_config.dart';
import 'package:ledger_mobile/core/errors/app_exception.dart';
import 'package:ledger_mobile/core/formatting/formatters.dart';
import 'package:ledger_mobile/core/network/api_client.dart';
import 'package:ledger_mobile/core/network/paginator.dart';
import 'package:ledger_mobile/core/utilities/iso_date.dart';
import 'package:ledger_mobile/features/expenses/data/expense_remote_data_source.dart';

void main() {
  group('sync window', () {
    test('October → August 1 .. October 31', () {
      expect(DateRange.syncWindow(DateTime(2026, 10, 3)), const DateRange('2026-08-01', '2026-10-31'));
    });

    test('crosses the year boundary', () {
      expect(DateRange.syncWindow(DateTime(2026, 1, 15)), const DateRange('2025-11-01', '2026-01-31'));
    });

    test('leap year February', () {
      expect(DateRange.month(DateTime(2028, 2, 10)), const DateRange('2028-02-01', '2028-02-29'));
    });
  });

  group('Paginator', () {
    test('keeps requesting pages until the reported total is reached', () async {
      final data = List.generate(25, (i) => i);
      final requested = <int>[];
      final paginator = Paginator<int>(
        pageSize: 10,
        idOf: (i) => i,
        fetchPage: (page, size) async {
          requested.add(page);
          return PageResult(items: data.skip((page - 1) * size).take(size).toList(), totalCount: data.length);
        },
      );
      expect(await paginator.fetchAll(), data);
      expect(requested, [1, 2, 3]);
    });

    test('fails instead of returning an incomplete dataset', () async {
      final paginator = Paginator<int>(
        pageSize: 10,
        idOf: (i) => i,
        fetchPage: (page, size) async => PageResult(items: page == 1 ? List.generate(10, (i) => i) : const [], totalCount: 30),
      );
      await expectLater(paginator.fetchAll(), throwsA(isA<ApiException>()));
    });

    test('empty result', () async {
      final paginator = Paginator<int>(idOf: (i) => i, fetchPage: (_, _) async => const PageResult(items: [], totalCount: 0));
      expect(await paginator.fetchAll(), isEmpty);
    });
  });

  group('GET /expenses parsing', () {
    test('parses the real Ledger item shape', () {
      final page = LedgerExpenseRemoteDataSource.parsePage({
        'result': [
          {
            'id': 1937,
            'walletId': 30,
            'expenseTypeId': 52,
            'vendorId': 23,
            'description': 'Membresía YouTube Premium Octubre 2026',
            'total': r'MXN $159.00',
            'currencyFactor': null,
            'buyDate': 'October 26, 2026',
            'sortId': 0,
            'wallet': 'Santander World Elite MXN',
            'rawTotal': 159,
            'value': 159,
          },
        ],
        'pagination': {'page': '1', 'pageSize': 2, 'total': 183},
        'total': 119698.74,
      });
      expect(page.totalCount, 183);
      final e = page.items.single;
      expect(e.id, 1937);
      expect(e.total, 159);
      expect(e.buyDate, '2026-10-26');
      expect(e.currencyFactor, isNull);
    });

    test('accepts ISO dates and rejects garbage', () {
      expect(LedgerExpenseRemoteDataSource.parseLedgerDate('2026-05-17'), '2026-05-17');
      expect(LedgerExpenseRemoteDataSource.parseLedgerDate('May 7, 2023'), '2023-05-07');
      expect(() => LedgerExpenseRemoteDataSource.parseLedgerDate('17/05/2023'), throwsA(isA<ApiException>()));
    });

    test('missing envelope is an invalid response', () {
      expect(() => ApiClient.unwrapEnvelope([1, 2]), throwsA(isA<ApiException>()));
      expect(ApiClient.unwrapEnvelope({'data': 5}), 5);
    });
  });

  test('expense download excludes interest-free purchase parents', () async {
    final queries = <Map<String, dynamic>>[];
    final dio = Dio(BaseOptions(baseUrl: 'http://ledger.test'))
      ..interceptors.add(InterceptorsWrapper(onRequest: (options, handler) {
        queries.add(options.queryParameters);
        handler.resolve(Response(requestOptions: options, statusCode: 200, data: {
          'data': {'result': [], 'pagination': {'total': 0}, 'total': 0},
        }));
      }));
    final source = LedgerExpenseRemoteDataSource(ApiClient(baseUrl: 'http://ledger.test', dio: dio));
    await source.fetchRange(const DateRange('2026-08-01', '2026-10-31'));
    expect(queries.single['excludeInstallmentParents'], 'true');
  });

  group('error mapping', () {
    DioException badResponse(int status) => DioException(
          requestOptions: RequestOptions(path: '/x'),
          type: DioExceptionType.badResponse,
          response: Response(requestOptions: RequestOptions(path: '/x'), statusCode: status),
        );

    test('HTTP statuses', () {
      expect(ApiClient.mapDioException(badResponse(400)).kind, ApiErrorKind.badRequest);
      expect(ApiClient.mapDioException(badResponse(404)).kind, ApiErrorKind.notFound);
      expect(ApiClient.mapDioException(badResponse(409)).kind, ApiErrorKind.conflict);
      expect(ApiClient.mapDioException(badResponse(500)).kind, ApiErrorKind.server);
    });

    test('timeouts', () {
      final e = DioException(requestOptions: RequestOptions(path: '/x'), type: DioExceptionType.receiveTimeout);
      expect(ApiClient.mapDioException(e).kind, ApiErrorKind.timeout);
      expect(ApiClient.mapDioException(e).isConnectivityFailure, isTrue);
    });
  });

  group('ApiConfig', () {
    test('builds the base URL from host and port', () {
      expect(ApiConfig.fromInput(hostInput: '192.168.1.100', portInput: '3002').baseUrl, 'http://192.168.1.100:3002');
    });

    test('accepts a full URL and defaults the port', () {
      expect(ApiConfig.fromInput(hostInput: 'http://ledger.lan', portInput: '').baseUrl, 'http://ledger.lan:3002');
      expect(ApiConfig.fromInput(hostInput: 'https://ledger.lan:8443', portInput: '').baseUrl, 'https://ledger.lan:8443');
    });

    test('rejects invalid input', () {
      expect(() => ApiConfig.fromInput(hostInput: '', portInput: '3002'), throwsFormatException);
      expect(() => ApiConfig.fromInput(hostInput: '10.0.0.1', portInput: '70000'), throwsFormatException);
      expect(() => ApiConfig.fromInput(hostInput: 'http://10.0.0.1/api', portInput: ''), throwsFormatException);
    });

    test('round-trips through the stored base URL', () {
      final config = ApiConfig.fromInput(hostInput: '10.0.2.2', portInput: '3002');
      expect(ApiConfig.tryParseBaseUrl(config.baseUrl), config);
    });
  });

  group('formatting', () {
    test('Mexican amount format', () {
      expect(Formatters.amount(1250), '1,250.00');
      expect(Formatters.money(1250, 'MXN'), r'$1,250.00 MXN');
      expect(Formatters.parseAmount('1,250.50'), 1250.5);
      expect(Formatters.parseAmount('abc'), isNull);
    });

    test('ISO date helpers', () {
      expect(IsoDate.format(DateTime(2026, 3, 7, 23, 59)), '2026-03-07');
      expect(IsoDate.isValid('2026-02-29'), isFalse);
      expect(IsoDate.isValid('2028-02-29'), isTrue);
    });
  });
}
