import 'package:dio/dio.dart';

import '../../../core/configuration/api_config.dart';
import '../../../core/errors/app_exception.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/json_reader.dart';

/// Outcome category of a connection test.
enum ConnectionTestStatus { success, networkUnavailable, timeout, httpError, invalidResponse }

class ConnectionTestResult {
  const ConnectionTestResult(this.status, this.message, {this.latency});

  final ConnectionTestStatus status;
  final String message;
  final Duration? latency;

  bool get isSuccess => status == ConnectionTestStatus.success;
}

/// Checks that a base URL points to a reachable Ledger API.
///
/// Ledger has no health endpoint; `GET /catalog/currencies` is the lightest
/// database-backed route and also proves the response has Ledger's shape.
class ConnectionTester {
  const ConnectionTester({this.timeout = const Duration(seconds: 6), this.clientFactory});

  final Duration timeout;

  /// Test seam.
  final ApiClient Function(ApiConfig config)? clientFactory;

  Future<ConnectionTestResult> test(ApiConfig config) async {
    final client = clientFactory?.call(config) ??
        ApiClient(
          baseUrl: config.baseUrl,
          dio: Dio(BaseOptions(
            baseUrl: config.baseUrl,
            connectTimeout: timeout,
            receiveTimeout: timeout,
            sendTimeout: timeout,
          )),
        );
    final watch = Stopwatch()..start();
    try {
      final data = await client.get('/catalog/currencies');
      final currencies = JsonReader.list(data, 'currencies');
      for (final raw in currencies) {
        final j = JsonReader.map(raw, 'currency');
        JsonReader.number(j, 'conversion', 'currency');
      }
      watch.stop();
      return ConnectionTestResult(
        ConnectionTestStatus.success,
        'Connected to Ledger (${currencies.length} currencies, ${watch.elapsedMilliseconds} ms).',
        latency: watch.elapsed,
      );
    } on ApiException catch (e) {
      final status = switch (e.kind) {
        ApiErrorKind.timeout => ConnectionTestStatus.timeout,
        ApiErrorKind.invalidResponse => ConnectionTestStatus.invalidResponse,
        ApiErrorKind.badRequest ||
        ApiErrorKind.notFound ||
        ApiErrorKind.conflict ||
        ApiErrorKind.server ||
        ApiErrorKind.http =>
          ConnectionTestStatus.httpError,
        _ => ConnectionTestStatus.networkUnavailable,
      };
      final hint = config.pointsToDeviceItself && status == ConnectionTestStatus.networkUnavailable
          ? ' On a phone, "localhost" is the phone itself — use your computer\'s LAN IP (or 10.0.2.2 on the emulator).'
          : '';
      return ConnectionTestResult(status, '${e.message}$hint');
    }
  }
}
