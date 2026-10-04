/// Category of a failed API call. Each kind maps to one user-facing message.
enum ApiErrorKind {
  noNetwork,
  timeout,
  connectionRefused,
  badRequest,
  notFound,
  conflict,
  server,
  http,
  invalidResponse,
  notConfigured,
}

/// Base type for errors surfaced to the UI. [message] is safe to show to the
/// user; [technicalDetails] is for logs only.
abstract class AppException implements Exception {
  const AppException(this.message, {this.technicalDetails});

  final String message;
  final String? technicalDetails;

  @override
  String toString() => '$runtimeType: $message${technicalDetails == null ? '' : ' ($technicalDetails)'}';
}

/// An API request failed.
class ApiException extends AppException {
  const ApiException(this.kind, super.message, {this.statusCode, super.technicalDetails});

  final ApiErrorKind kind;
  final int? statusCode;

  /// True when the failure means the server could not be reached at all, so
  /// further requests in the same operation are pointless.
  bool get isConnectivityFailure =>
      kind == ApiErrorKind.noNetwork ||
      kind == ApiErrorKind.timeout ||
      kind == ApiErrorKind.connectionRefused ||
      kind == ApiErrorKind.notConfigured;

  factory ApiException.fromStatus(int status, {String? serverMessage}) {
    final details = 'HTTP $status${serverMessage == null ? '' : ': $serverMessage'}';
    return switch (status) {
      400 => ApiException(ApiErrorKind.badRequest,
          'Ledger rejected the request (400). ${serverMessage ?? ''}'.trim(),
          statusCode: status, technicalDetails: details),
      404 => ApiException(ApiErrorKind.notFound,
          'The Ledger endpoint was not found (404). Check that the URL points to the Ledger API and that the backend is up to date.',
          statusCode: status, technicalDetails: details),
      409 => ApiException(ApiErrorKind.conflict,
          'Ledger reported a conflict (409). Refresh your data and try again.',
          statusCode: status, technicalDetails: details),
      >= 500 => ApiException(ApiErrorKind.server,
          'The Ledger server had an internal error ($status). Try again later.',
          statusCode: status, technicalDetails: details),
      _ => ApiException(ApiErrorKind.http, 'Ledger answered with an unexpected status ($status).',
          statusCode: status, technicalDetails: details),
    };
  }

  factory ApiException.invalidResponse(String details) => ApiException(
        ApiErrorKind.invalidResponse,
        'Ledger returned a response the app could not understand. Is this the Ledger API?',
        technicalDetails: details,
      );

  factory ApiException.notConfigured() => const ApiException(
        ApiErrorKind.notConfigured,
        'The Ledger API is not configured yet.',
      );
}

/// A local SQLite operation failed.
class DatabaseException extends AppException {
  const DatabaseException(super.message, {super.technicalDetails});
}

/// Local data required for an operation is missing or invalid.
class DataUnavailableException extends AppException {
  const DataUnavailableException(super.message, {super.technicalDetails});
}

/// Another synchronization is already running.
class SyncInProgressException extends AppException {
  const SyncInProgressException() : super('A synchronization is already running.');
}

/// Converts any thrown value into a user-facing message without leaking stack traces.
String userMessageFor(Object error) {
  if (error is AppException) return error.message;
  if (error is FormatException) return error.message;
  return 'Something went wrong. Please try again.';
}
