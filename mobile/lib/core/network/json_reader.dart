import '../errors/app_exception.dart';

/// Strict readers for Ledger JSON payloads. Any shape mismatch becomes an
/// [ApiException] of kind `invalidResponse` instead of a runtime type error.
abstract final class JsonReader {
  static List<Object?> list(Object? value, String context) {
    if (value is List) return value;
    throw ApiException.invalidResponse('$context: expected a list, got ${value.runtimeType}');
  }

  static Map<String, Object?> map(Object? value, String context) {
    if (value is Map) return value.cast<String, Object?>();
    throw ApiException.invalidResponse('$context: expected an object, got ${value.runtimeType}');
  }

  static int integer(Map<String, Object?> json, String key, String context) {
    final value = json[key];
    if (value is int) return value;
    if (value is num && value == value.roundToDouble()) return value.toInt();
    if (value is String) {
      final parsed = int.tryParse(value);
      if (parsed != null) return parsed;
    }
    throw ApiException.invalidResponse('$context.$key: expected an integer, got "$value"');
  }

  static int? nullableInteger(Map<String, Object?> json, String key, String context) =>
      json[key] == null ? null : integer(json, key, context);

  static double number(Map<String, Object?> json, String key, String context) {
    final value = json[key];
    if (value is num) return value.toDouble();
    if (value is String) {
      final parsed = double.tryParse(value);
      if (parsed != null) return parsed;
    }
    throw ApiException.invalidResponse('$context.$key: expected a number, got "$value"');
  }

  static double? nullableNumber(Map<String, Object?> json, String key, String context) =>
      json[key] == null ? null : number(json, key, context);

  static String string(Map<String, Object?> json, String key, String context) {
    final value = json[key];
    if (value is String) return value;
    if (value is num) return value.toString();
    throw ApiException.invalidResponse('$context.$key: expected a string, got "$value"');
  }

  static String? nullableString(Map<String, Object?> json, String key, String context) {
    final value = json[key];
    if (value == null) return null;
    return string(json, key, context);
  }

  /// Ledger returns MySQL tinyints (0/1) for booleans.
  static bool flag(Map<String, Object?> json, String key, String context, {bool fallback = false}) {
    final value = json[key];
    if (value == null) return fallback;
    if (value is bool) return value;
    if (value is num) return value != 0;
    throw ApiException.invalidResponse('$context.$key: expected a boolean, got "$value"');
  }
}
