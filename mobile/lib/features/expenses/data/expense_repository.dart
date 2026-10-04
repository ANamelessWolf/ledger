import 'package:drift/drift.dart';
import 'package:uuid/uuid.dart';

import '../../../core/database/app_database.dart';
import '../../../core/errors/app_exception.dart';
import '../../../core/utilities/clock.dart';
import '../../../core/utilities/iso_date.dart';
import '../domain/expense.dart';
import '../domain/expense_draft.dart';
import '../domain/expense_filter.dart';
import '../domain/remote_expense.dart';
import '../domain/sync_status.dart';

/// Counts used by the Sync screen.
class SyncCounts {
  const SyncCounts({required this.pending, required this.failed});

  final int pending;
  final int failed;

  int get total => pending + failed;
}

/// Outcome of reconciling a downloaded remote dataset.
class ReconcileResult {
  const ReconcileResult({required this.inserted, required this.updated, required this.deleted});

  final int inserted;
  final int updated;
  final int deleted;
}

/// Local expense persistence. All multi-row changes run in transactions.
class ExpenseRepository {
  ExpenseRepository(this._db, {this._clock = systemClock, String Function()? newSyncKey})
      : _newSyncKey = newSyncKey ?? _uuid.v4;

  static const _uuid = Uuid();

  final AppDatabase _db;
  final Clock _clock;
  final String Function() _newSyncKey;

  // ---------------------------------------------------------------- queries

  /// Expenses matching [filter], newest first. Uses the
  /// `(column, buy_date)` indexes for the optional criteria.
  Stream<List<Expense>> watchFiltered(ExpenseFilter filter) => _filteredQuery(filter).watch().map(_mapRows);

  Future<List<Expense>> getFiltered(ExpenseFilter filter) async => _mapRows(await _filteredQuery(filter).get());

  SimpleSelectStatement<$ExpensesTable, ExpenseRow> _filteredQuery(ExpenseFilter filter) {
    final q = _db.select(_db.expenses)
      ..where((e) => e.buyDate.isBetweenValues(filter.range.start, filter.range.end));
    if (filter.walletId != null) q.where((e) => e.walletId.equals(filter.walletId!));
    if (filter.vendorId != null) q.where((e) => e.vendorId.equals(filter.vendorId!));
    if (filter.expenseTypeId != null) q.where((e) => e.expenseTypeId.equals(filter.expenseTypeId!));
    q.orderBy([
      (e) => OrderingTerm.desc(e.buyDate),
      (e) => OrderingTerm.asc(e.sortId),
      (e) => OrderingTerm.desc(e.id),
    ]);
    return q;
  }

  Stream<Expense?> watchById(int id) =>
      (_db.select(_db.expenses)..where((e) => e.id.equals(id))).watchSingleOrNull().map((r) => r == null ? null : _map(r));

  Future<Expense?> findById(int id) async {
    final row = await (_db.select(_db.expenses)..where((e) => e.id.equals(id))).getSingleOrNull();
    return row == null ? null : _map(row);
  }

  /// Local expenses that still have to be uploaded, in creation order.
  Future<List<Expense>> pendingUploads() async {
    final rows = await (_db.select(_db.expenses)
          ..where((e) => e.remoteId.isNull() & e.syncStatus.isIn([SyncStatus.pending.value, SyncStatus.failed.value]))
          ..orderBy([(e) => OrderingTerm.asc(e.id)]))
        .get();
    return _mapRows(rows);
  }

  /// Pending/failed counts, kept up to date.
  Stream<SyncCounts> watchSyncCounts() {
    final count = _db.expenses.id.count();
    final query = _db.selectOnly(_db.expenses)
      ..addColumns([_db.expenses.syncStatus, count])
      ..where(_db.expenses.remoteId.isNull())
      ..groupBy([_db.expenses.syncStatus]);
    return query.watch().map((rows) {
      var pending = 0, failed = 0;
      for (final row in rows) {
        final status = SyncStatus.fromValue(row.read(_db.expenses.syncStatus)!);
        final n = row.read(count) ?? 0;
        if (status == SyncStatus.pending) pending += n;
        if (status == SyncStatus.failed) failed += n;
      }
      return SyncCounts(pending: pending, failed: failed);
    });
  }

  /// Local failed expenses with their error messages.
  Stream<List<Expense>> watchFailed() => (_db.select(_db.expenses)
        ..where((e) => e.remoteId.isNull() & e.syncStatus.equals(SyncStatus.failed.value))
        ..orderBy([(e) => OrderingTerm.asc(e.id)]))
      .watch()
      .map(_mapRows);

  // ----------------------------------------------------------- local edits

  /// Saves a new local expense: local id + stable sync key, `remote_id = null`,
  /// `sync_status = pending`. No network involved.
  Future<Expense> createLocal(ValidExpense value) => _guard(() async {
        final now = _clock();
        final id = await _db.transaction(() => _db.into(_db.expenses).insert(ExpensesCompanion.insert(
              remoteId: const Value(null),
              syncKey: Value(_newSyncKey()),
              walletId: value.walletId,
              expenseTypeId: value.expenseTypeId,
              vendorId: value.vendorId,
              description: value.description,
              total: value.total,
              currencyFactor: Value(value.currencyFactor),
              buyDate: value.buyDate,
              syncStatus: SyncStatus.pending.value,
              createdAt: now,
              updatedAt: now,
            )));
        return (await findById(id))!;
      });

  /// Updates an unsynchronized expense. The sync key is kept so an upload
  /// that may already have reached the server is still recognized.
  Future<Expense> updateLocal(int id, ValidExpense value) => _guard(() async {
        await _db.transaction(() async {
          final current = await _requireEditable(id);
          await (_db.update(_db.expenses)..where((e) => e.id.equals(current.id))).write(ExpensesCompanion(
            walletId: Value(value.walletId),
            expenseTypeId: Value(value.expenseTypeId),
            vendorId: Value(value.vendorId),
            description: Value(value.description),
            total: Value(value.total),
            currencyFactor: Value(value.currencyFactor),
            buyDate: Value(value.buyDate),
            syncStatus: Value(SyncStatus.pending.value),
            syncError: const Value(null),
            updatedAt: Value(_clock()),
          ));
        });
        return (await findById(id))!;
      });

  /// Permanently deletes an unsynchronized expense.
  Future<void> deleteLocal(int id) => _guard(() async {
        await _db.transaction(() async {
          await _requireEditable(id);
          await (_db.delete(_db.expenses)..where((e) => e.id.equals(id))).go();
        });
      });

  Future<ExpenseRow> _requireEditable(int id) async {
    final row = await (_db.select(_db.expenses)..where((e) => e.id.equals(id))).getSingleOrNull();
    if (row == null) throw const DataUnavailableException('This expense no longer exists on the device.');
    if (row.remoteId != null) {
      throw const DataUnavailableException(
          'This expense has already been synchronized. Edit or delete it from the Ledger web application.');
    }
    return row;
  }

  // ------------------------------------------------------- sync bookkeeping

  /// Stores the Ledger id returned for a local expense. If a refresh already
  /// downloaded that same Ledger expense as a separate row (because an
  /// earlier response was lost), the downloaded copy is removed so the
  /// expense is not counted twice.
  Future<void> markSynced(int localId, int remoteId) => _guard(() => _db.transaction(() async {
        await (_db.delete(_db.expenses)
              ..where((e) => e.remoteId.equals(remoteId) & e.id.equals(localId).not()))
            .go();
        await (_db.update(_db.expenses)..where((e) => e.id.equals(localId))).write(ExpensesCompanion(
          remoteId: Value(remoteId),
          syncStatus: Value(SyncStatus.synced.value),
          syncError: const Value(null),
          updatedAt: Value(_clock()),
        ));
      }));

  /// Marks local expenses as failed; they stay available for retry.
  Future<void> markFailed(Map<int, String> errorsByLocalId) => _guard(() => _db.transaction(() async {
        final now = _clock();
        for (final entry in errorsByLocalId.entries) {
          await (_db.update(_db.expenses)
                ..where((e) => e.id.equals(entry.key) & e.remoteId.isNull()))
              .write(ExpensesCompanion(
            syncStatus: Value(SyncStatus.failed.value),
            syncError: Value(entry.value),
            updatedAt: Value(now),
          ));
        }
      }));

  /// Reconciles a complete remote dataset with the local synchronized rows.
  ///
  /// - Updates local rows whose `remote_id` is in [remote]; inserts new ones.
  /// - Deletes synchronized rows missing from [remote] — only those dated
  ///   inside [window], or every synchronized row when [window] is null
  ///   (full replacement).
  /// - Never touches rows with `remote_id IS NULL` (pending/failed).
  ///
  /// Runs in one transaction; joins an outer transaction if there is one.
  Future<ReconcileResult> reconcileRemote(List<RemoteExpense> remote, {DateRange? window}) =>
      _guard(() => _db.transaction(() async {
            final now = _clock();
            final existing = <int, ExpenseRow>{
              for (final row in await (_db.select(_db.expenses)..where((e) => e.remoteId.isNotNull())).get())
                row.remoteId!: row,
            };
            var inserted = 0, updated = 0, deleted = 0;
            final remoteIds = <int>{};

            for (final r in remote) {
              remoteIds.add(r.id);
              final local = existing[r.id];
              final values = ExpensesCompanion(
                walletId: Value(r.walletId),
                expenseTypeId: Value(r.expenseTypeId),
                vendorId: Value(r.vendorId),
                description: Value(_fitDescription(r.description)),
                total: Value(r.total),
                currencyFactor: Value(r.currencyFactor),
                buyDate: Value(r.buyDate),
                sortId: Value(r.sortId),
                syncStatus: Value(SyncStatus.synced.value),
                syncError: const Value(null),
              );
              if (local == null) {
                await _db.into(_db.expenses).insert(values.copyWith(
                      remoteId: Value(r.id),
                      createdAt: Value(now),
                      updatedAt: Value(now),
                    ));
                inserted++;
              } else if (_differs(local, r)) {
                await (_db.update(_db.expenses)..where((e) => e.id.equals(local.id)))
                    .write(values.copyWith(updatedAt: Value(now)));
                updated++;
              }
            }

            for (final row in existing.values) {
              if (remoteIds.contains(row.remoteId)) continue;
              if (window != null && !window.contains(row.buyDate)) continue;
              await (_db.delete(_db.expenses)..where((e) => e.id.equals(row.id))).go();
              deleted++;
            }
            return ReconcileResult(inserted: inserted, updated: updated, deleted: deleted);
          }));

  // ---------------------------------------------------------------- helpers

  static bool _differs(ExpenseRow l, RemoteExpense r) =>
      l.walletId != r.walletId ||
      l.expenseTypeId != r.expenseTypeId ||
      l.vendorId != r.vendorId ||
      l.description != _fitDescription(r.description) ||
      l.total != r.total ||
      l.currencyFactor != r.currencyFactor ||
      l.buyDate != r.buyDate ||
      l.sortId != r.sortId ||
      l.syncStatus != SyncStatus.synced.value;

  /// The server column is VARCHAR(120); guard the local length constraint anyway.
  static String _fitDescription(String value) {
    final text = value.isEmpty ? '-' : value;
    return text.length <= expenseDescriptionMaxLength ? text : text.substring(0, expenseDescriptionMaxLength);
  }

  List<Expense> _mapRows(List<ExpenseRow> rows) => rows.map(_map).toList(growable: false);

  Expense _map(ExpenseRow r) => Expense(
        id: r.id,
        remoteId: r.remoteId,
        syncKey: r.syncKey,
        walletId: r.walletId,
        expenseTypeId: r.expenseTypeId,
        vendorId: r.vendorId,
        description: r.description,
        total: r.total,
        currencyFactor: r.currencyFactor,
        buyDate: r.buyDate,
        sortId: r.sortId,
        syncStatus: SyncStatus.fromValue(r.syncStatus),
        syncError: r.syncError,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      );

  Future<T> _guard<T>(Future<T> Function() action) async {
    try {
      return await action();
    } on AppException {
      rethrow;
    } catch (e) {
      throw DatabaseException('Could not save the data on this device.', technicalDetails: '$e');
    }
  }
}
