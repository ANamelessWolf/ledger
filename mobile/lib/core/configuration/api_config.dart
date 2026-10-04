/// User-configurable location of the Ledger API.
///
/// The API has no `/api` prefix, so [baseUrl] is the scheme + host + port and
/// request paths (e.g. `/catalog/currencies`) are appended to it.
class ApiConfig {
  const ApiConfig({required this.scheme, required this.host, required this.port});

  /// `http` or `https`.
  final String scheme;
  final String host;
  final int port;

  /// Default Ledger backend port.
  static const int defaultPort = 3002;

  /// Resulting base URL, e.g. `http://192.168.1.100:3002`.
  String get baseUrl => '$scheme://$host:$port';

  /// Builds a config from the raw form fields. [hostInput] may include a
  /// scheme (`http://192.168.1.10`) and/or a port, which then overrides
  /// [portInput] only when that field is empty.
  ///
  /// Throws [FormatException] with a user-facing message for invalid input.
  factory ApiConfig.fromInput({required String hostInput, required String portInput}) {
    var raw = hostInput.trim();
    if (raw.isEmpty) throw const FormatException('Enter the API host or URL.');
    if (!raw.contains('://')) raw = 'http://$raw';

    final uri = Uri.tryParse(raw);
    if (uri == null || uri.host.isEmpty) {
      throw const FormatException('The host is not a valid address.');
    }
    if (uri.scheme != 'http' && uri.scheme != 'https') {
      throw const FormatException('Only http and https are supported.');
    }
    if (uri.path.isNotEmpty && uri.path != '/') {
      throw const FormatException('Do not include a path; Ledger routes have no prefix.');
    }

    final portText = portInput.trim();
    int port;
    if (portText.isNotEmpty) {
      final parsed = int.tryParse(portText);
      if (parsed == null || parsed < 1 || parsed > 65535) {
        throw const FormatException('The port must be a number between 1 and 65535.');
      }
      port = parsed;
    } else if (uri.hasPort) {
      port = uri.port;
    } else {
      port = defaultPort;
    }
    return ApiConfig(scheme: uri.scheme, host: uri.host, port: port);
  }

  /// Parses a stored [baseUrl]; returns null when it is not usable.
  static ApiConfig? tryParseBaseUrl(String? value) {
    if (value == null || value.isEmpty) return null;
    final uri = Uri.tryParse(value);
    if (uri == null || uri.host.isEmpty || !uri.hasPort) return null;
    return ApiConfig(scheme: uri.scheme, host: uri.host, port: uri.port);
  }

  /// True when the host points to the device itself, which is almost never
  /// what the user wants on a phone.
  bool get pointsToDeviceItself => host == 'localhost' || host == '127.0.0.1';

  @override
  bool operator ==(Object other) =>
      other is ApiConfig && other.scheme == scheme && other.host == host && other.port == port;

  @override
  int get hashCode => Object.hash(scheme, host, port);
}
