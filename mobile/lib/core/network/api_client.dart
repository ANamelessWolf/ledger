import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../errors/app_exception.dart';

/// Thin HTTP client for the Ledger API.
///
/// Ledger wraps every successful payload in `{ "data": ... }`; [get] and
/// [post] return that inner `data` value and translate every transport/HTTP
/// failure into an [ApiException].
class ApiClient {
  ApiClient({required String baseUrl, Dio? dio, Duration? receiveTimeout})
      : _dio = dio ??
            Dio(BaseOptions(
              baseUrl: baseUrl,
              connectTimeout: const Duration(seconds: 8),
              sendTimeout: const Duration(seconds: 15),
              receiveTimeout: receiveTimeout ?? const Duration(seconds: 45),
              responseType: ResponseType.json,
              headers: {'Accept': 'application/json'},
            ));

  final Dio _dio;

  /// GET [path] and return the unwrapped `data` value.
  Future<Object?> get(String path, {Map<String, Object?>? query}) =>
      _send(() => _dio.get<Object?>(path, queryParameters: query));

  /// POST [body] as JSON to [path] and return the unwrapped `data` value.
  Future<Object?> post(String path, Object? body) =>
      _send(() => _dio.post<Object?>(path, data: body));

  Future<Object?> _send(Future<Response<Object?>> Function() request) async {
    try {
      final response = await request();
      return unwrapEnvelope(response.data);
    } on DioException catch (e) {
      final mapped = mapDioException(e);
      debugPrint('[ApiClient] ${e.requestOptions.method} ${e.requestOptions.uri} -> $mapped');
      throw mapped;
    }
  }

  /// Extracts `data` from a Ledger envelope.
  @visibleForTesting
  static Object? unwrapEnvelope(Object? body) {
    if (body is Map && body.containsKey('data')) return body['data'];
    throw ApiException.invalidResponse('Missing "data" envelope: ${_preview(body)}');
  }

  /// Maps a Dio failure to an [ApiException].
  @visibleForTesting
  static ApiException mapDioException(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.transformTimeout:
        return ApiException(ApiErrorKind.timeout,
            'Ledger did not answer in time. Check that the server is running and reachable.',
            technicalDetails: e.type.name);
      case DioExceptionType.badResponse:
        final status = e.response?.statusCode ?? 0;
        final data = e.response?.data;
        final serverMessage = data is Map && data['message'] is String ? data['message'] as String : null;
        return ApiException.fromStatus(status, serverMessage: serverMessage);
      case DioExceptionType.connectionError:
      case DioExceptionType.unknown:
        final inner = e.error;
        if (inner is SocketException) return _mapSocketException(inner);
        if (inner is FormatException) return ApiException.invalidResponse(inner.message);
        return ApiException(ApiErrorKind.noNetwork,
            'Could not connect to Ledger. Check your network connection.',
            technicalDetails: '${e.type.name}: $inner');
      case DioExceptionType.badCertificate:
        return const ApiException(ApiErrorKind.noNetwork,
            'The server certificate is not trusted.', technicalDetails: 'badCertificate');
      case DioExceptionType.cancel:
        return const ApiException(ApiErrorKind.noNetwork, 'The request was cancelled.');
    }
  }

  static ApiException _mapSocketException(SocketException e) {
    final code = e.osError?.errorCode;
    final text = '${e.message} ${e.osError?.message ?? ''}'.toLowerCase();
    // 111 = ECONNREFUSED (Linux/Android), 61 = macOS, 10061 = Windows.
    if (code == 111 || code == 61 || code == 10061 || text.contains('refused')) {
      return ApiException(ApiErrorKind.connectionRefused,
          'The Ledger server refused the connection. Check the host, the port and that the backend is running.',
          technicalDetails: e.toString());
    }
    return ApiException(ApiErrorKind.noNetwork,
        'Could not reach Ledger. Check that your phone is on the same network as the server.',
        technicalDetails: e.toString());
  }

  static String _preview(Object? body) {
    final text = '$body';
    return text.length > 200 ? '${text.substring(0, 200)}…' : text;
  }
}
