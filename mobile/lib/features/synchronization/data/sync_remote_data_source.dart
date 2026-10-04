import '../../../core/network/api_client.dart';
import '../../../core/network/json_reader.dart';

/// Maximum batch size accepted by `POST /expenses/sync`.
const int syncBatchSize = 10;

/// One expense sent to the mobile sync endpoint.
class SyncUploadItem {
  const SyncUploadItem({
    required this.syncKey,
    required this.walletId,
    required this.expenseTypeId,
    required this.vendorId,
    required this.description,
    required this.total,
    required this.currencyFactor,
    required this.buyDate,
  });

  final String syncKey;
  final int walletId;
  final int expenseTypeId;
  final int vendorId;
  final String description;
  final double total;
  final double? currencyFactor;
  final String buyDate;

  Map<String, Object?> toJson() => {
        'syncKey': syncKey,
        'walletId': walletId,
        'expenseTypeId': expenseTypeId,
        'vendorId': vendorId,
        'description': description,
        'total': total,
        'currencyFactor': currencyFactor,
        'buyDate': buyDate,
      };
}

/// Per-item server outcome.
class SyncUploadResult {
  const SyncUploadResult({
    required this.syncKey,
    required this.success,
    this.remoteId,
    this.alreadySynced = false,
    this.errorCode,
    this.databaseErrorCode,
    this.message,
  });

  final String? syncKey;
  final bool success;
  final int? remoteId;
  final bool alreadySynced;

  /// `VALIDATION_ERROR` or `BATCH_FAILED`.
  final String? errorCode;
  final String? databaseErrorCode;
  final String? message;

  /// True when the whole batch transaction was rolled back (the item itself
  /// may be fine and can succeed in a different batch).
  bool get isBatchFailure => !success && errorCode == batchFailedCode;

  static const batchFailedCode = 'BATCH_FAILED';

  factory SyncUploadResult.fromJson(Map<String, Object?> j) {
    const ctx = 'syncResult';
    final success = JsonReader.flag(j, 'success', ctx);
    return SyncUploadResult(
      syncKey: JsonReader.nullableString(j, 'syncKey', ctx),
      success: success,
      remoteId: success ? JsonReader.integer(j, 'remoteId', ctx) : null,
      alreadySynced: JsonReader.flag(j, 'alreadySynced', ctx),
      errorCode: JsonReader.nullableString(j, 'errorCode', ctx),
      databaseErrorCode: JsonReader.nullableString(j, 'databaseErrorCode', ctx),
      message: JsonReader.nullableString(j, 'message', ctx),
    );
  }
}

/// Uploads local expenses.
abstract interface class SyncRemoteDataSource {
  /// Sends at most [syncBatchSize] items; returns one result per item.
  Future<List<SyncUploadResult>> uploadBatch(List<SyncUploadItem> items);
}

/// [SyncRemoteDataSource] over `POST /expenses/sync`.
class LedgerSyncRemoteDataSource implements SyncRemoteDataSource {
  LedgerSyncRemoteDataSource(this._client);

  final ApiClient _client;

  @override
  Future<List<SyncUploadResult>> uploadBatch(List<SyncUploadItem> items) async {
    assert(items.isNotEmpty && items.length <= syncBatchSize);
    final data = await _client.post('/expenses/sync', {
      'expenses': items.map((i) => i.toJson()).toList(),
    });
    return JsonReader.list(data, 'syncResults')
        .map((raw) => SyncUploadResult.fromJson(JsonReader.map(raw, 'syncResult')))
        .toList();
  }
}
