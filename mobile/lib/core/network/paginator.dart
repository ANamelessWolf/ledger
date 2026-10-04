import '../errors/app_exception.dart';

/// One page returned by a paginated endpoint.
class PageResult<T> {
  const PageResult({required this.items, required this.totalCount});

  final List<T> items;

  /// Total number of records that match the query, as reported by the server.
  final int totalCount;
}

/// Progress callback: [page] pages of [totalPages] downloaded so far.
typedef PageProgress = void Function(int page, int totalPages);

/// Downloads every page of a paginated endpoint.
///
/// Never assumes a single page is complete: it keeps requesting until the
/// number of unique records equals the server-reported total. Records are
/// de-duplicated by [idOf]; if the data changes while paging so the final
/// count does not match, the whole download is retried once and then fails
/// instead of returning an incomplete dataset.
class Paginator<T> {
  Paginator({
    required this.fetchPage,
    required this.idOf,
    this.pageSize = 100,
    this.maxAttempts = 2,
  }) : assert(pageSize > 0);

  /// Fetches the 1-based [page] with [pageSize] records.
  final Future<PageResult<T>> Function(int page, int pageSize) fetchPage;

  /// Unique identity of a record.
  final Object Function(T item) idOf;

  final int pageSize;
  final int maxAttempts;

  Future<List<T>> fetchAll({PageProgress? onProgress}) async {
    for (var attempt = 1; ; attempt++) {
      final result = await _fetchOnce(onProgress);
      if (result != null) return result;
      if (attempt >= maxAttempts) {
        throw ApiException.invalidResponse(
            'Pagination did not converge: the record count changed while downloading.');
      }
    }
  }

  /// Returns null when the downloaded set is inconsistent with the total.
  Future<List<T>?> _fetchOnce(PageProgress? onProgress) async {
    final byId = <Object, T>{};
    var page = 1;
    var total = 0;
    while (true) {
      final result = await fetchPage(page, pageSize);
      total = result.totalCount;
      for (final item in result.items) {
        byId[idOf(item)] = item;
      }
      final totalPages = total == 0 ? 1 : (total / pageSize).ceil();
      onProgress?.call(page, totalPages);

      final exhausted = result.items.isEmpty || result.items.length < pageSize;
      if (byId.length >= total || exhausted) break;
      // Safety net against a server that never reports completion.
      if (page > totalPages + 1) break;
      page++;
    }
    return byId.length == total ? byId.values.toList(growable: false) : null;
  }
}
