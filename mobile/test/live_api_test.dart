// Read-only integration test against a running Ledger backend.
//
// Skipped unless LEDGER_API_URL is set, e.g.:
//   LEDGER_API_URL=http://localhost:3002 flutter test test/live_api_test.dart
//
// It never writes to Ledger: it only exercises the connection test, the
// catalog download and the paginated expense window download.
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:ledger_mobile/core/configuration/api_config.dart';
import 'package:ledger_mobile/core/network/api_client.dart';
import 'package:ledger_mobile/core/utilities/iso_date.dart';
import 'package:ledger_mobile/features/catalogs/data/catalog_remote_data_source.dart';
import 'package:ledger_mobile/features/expenses/data/expense_remote_data_source.dart';
import 'package:ledger_mobile/features/settings/application/connection_tester.dart';

void main() {
  final baseUrl = Platform.environment['LEDGER_API_URL'];
  final skip = baseUrl == null ? 'Set LEDGER_API_URL to run against a live Ledger API' : null;

  group('live Ledger API (read-only)', () {
    late ApiClient client;
    setUp(() => client = ApiClient(baseUrl: baseUrl!));

    test('connection test succeeds', () async {
      final result = await const ConnectionTester().test(ApiConfig.tryParseBaseUrl(baseUrl)!);
      expect(result.isSuccess, isTrue, reason: result.message);
    });

    test('catalog snapshot is complete and valid', () async {
      final snapshot = await LedgerCatalogRemoteDataSource(client).fetchSnapshot();
      snapshot.validate();
      expect(snapshot.walletMembers, isNotEmpty);
      // ignore: avoid_print
      print('catalogs: ${snapshot.currencies.length} currencies, ${snapshot.wallets.length} wallets, '
          '${snapshot.walletGroups.length} groups, ${snapshot.walletMembers.length} members, '
          '${snapshot.expenseTypes.length} types, ${snapshot.vendors.length} vendors');
    });

    test('expense window downloads every page and matches a direct count', () async {
      final window = DateRange.syncWindow(DateTime.now());
      var pages = 0;
      final expenses = await LedgerExpenseRemoteDataSource(client, pageSize: 50)
          .fetchRange(window, onProgress: (page, total) => pages = total);
      expect(expenses.every((e) => window.contains(e.buyDate)), isTrue);
      expect(expenses.map((e) => e.id).toSet(), hasLength(expenses.length));

      final direct = await client.get('/expenses', query: {
        'start': window.start,
        'end': window.end,
        'page': 1,
        'pageSize': 1,
        'excludeInstallmentParents': 'true',
      });
      final serverCount = ((direct as Map)['pagination'] as Map)['total'] as int;
      // ignore: avoid_print
      print('window $window: ${expenses.length} expenses in $pages pages (server count for exact range: $serverCount)');
      expect(expenses.length, serverCount);
    });
  }, skip: skip);
}
