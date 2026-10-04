# Ledger Mobile

Offline-first Android app (Flutter) for Ledger expenses. It downloads the
catalogs and the last three calendar months of expenses into SQLite, works
fully offline (view, filter, dashboards, create/edit/delete pending
expenses), and uploads new expenses through an idempotent batch endpoint.

Stack: Flutter 3.44 / Dart 3.12, Material 3 (always-dark theme), Riverpod 3,
Drift (SQLite), Dio.

## Run the app

```bash
cd mobile
flutter pub get
flutter run                 # on a connected device or running emulator
flutter build apk --release # → build/app/outputs/flutter-apk/app-release.apk
```

If you change the Drift tables (`lib/core/database/app_database.dart`),
regenerate the code with `dart run build_runner build`.

> Windows note: `android/gradle.properties` sets `kotlin.incremental=false`
> because the project and the pub cache live on different drives, which
> breaks Kotlin's incremental caches.

## Configure the API

On first launch Home shows **Configure API**. Enter the host (or full URL)
and the port (default `3002`); the screen previews the resulting base URL,
e.g. `http://192.168.1.100:3002`. **Test connection** calls
`GET /catalog/currencies` and reports success, network unavailable, timeout,
HTTP error or invalid response. **Save and synchronize** runs the initial
sync. You can change the URL at any time from the drawer → *API connection*
or *Settings*.

The URL is stored in shared preferences (it is not a secret). Ledger has no
authentication, so use it only on a trusted network. If authentication is
added later, store credentials in Android Keystore-backed secure storage,
never in SQLite.

### Android emulator networking

`localhost` inside the emulator is the emulator itself. Use **`10.0.2.2`**
to reach the backend running on your computer: `http://10.0.2.2:3002`.

### Physical device networking

Use your computer's LAN IP (`ipconfig` / `ip addr`), e.g.
`http://192.168.1.100:3002`. Both devices must be on the same network and the
firewall must allow inbound TCP 3002. The app allows cleartext HTTP
(`android:usesCleartextTraffic="true"`) because Ledger is served over plain
HTTP on the LAN.

## Architecture

```
lib/
  app/        bootstrap, root widget, theme, shell (bottom nav + drawer)
  core/       database (Drift), network (ApiClient, Paginator, JsonReader),
              configuration (ApiConfig, AppPreferences), errors, formatting,
              utilities (IsoDate, DateRange, Clock), providers (DI)
  features/
    catalogs/         remote data source + local repository + models
    expenses/         domain (Expense, validator, CurrencyConversionService),
                      data (repository, remote), application (ExpenseService,
                      ExpenseViewMapper), presentation (form, detail, tile)
    home/             DashboardService, filter state, Home + Filter screens
    synchronization/  SyncService, SyncLock, sync API, metadata, Sync screen
    settings/         ConnectionTester, API status, Settings + API screens
  shared/widgets/     pickers, empty/error/skeleton states, offline banner
```

Layers: widgets → Riverpod notifiers/providers → services → repositories →
Drift / Dio. Widgets never run SQL or HTTP. Dependencies are injected through
providers (`core/providers.dart` and each feature's `*_providers.dart`).

### Database

| Table | Key | Notes |
|---|---|---|
| `currencies` | Ledger id | `conversion` = default-currency units per 1 unit; default = `conversion == 1` |
| `wallet_groups` | Ledger id | `is_active` |
| `wallets` | Ledger id | exactly one `currency_id` |
| `wallet_members` | Ledger member id | wallet ↔ group, `forward_wallet_id` |
| `expense_types`, `vendors` | Ledger id | |
| `credit_cards` | Ledger id | `wallet_group_id`, `active` (schema v2) |
| `expenses` | **local** autoincrement id | `remote_id` (nullable, unique), `sync_key` (UUID, unique), `sync_status` (`pending`/`failed`/`synced`), `sync_error`, ISO `buy_date`, `created_at`, `updated_at` |
| `sync_metadata` | key | last successful / full / catalog sync, last error |

Indexes cover `remote_id`, `sync_key`, `buy_date`, `sync_status`, and
`(wallet_id | vendor_id | expense_type_id, buy_date)` for the filtered Home
query. There are no SQLite foreign keys from expenses to catalogs on purpose:
a catalog refresh must never be blocked by (or cascade into) pending local
expenses. Rows referencing a catalog entry that disappeared show as
"Unknown" and are rejected by the server on upload.

### Currency conversion

One function, `CurrencyConversionService.normalize`, used everywhere
(list, detail, form preview, every dashboard widget):

```
factor = expense.currencyFactor if > 0, else wallet currency conversion
normalized = total × factor          (in the backend default currency)
```

The direction matches the backend (`value = total × currency.conversion`).
A factor of 0 is treated as missing, as in Ledger's budget procedure. The
display currency is the backend default currency.

### Wallet selection in the expense form

The **Wallet** picker lists wallet groups (the multi-currency accounts) plus
wallets that belong to no group. Hidden: inactive groups, and groups linked to
a credit card (`credit_card.wallet_group_id`) where no card has `active = 1`
(data from `GET /catalog/credit-cards`, refreshed on full sync). **Currency**
offers only the currencies of the chosen group and defaults to the default
currency (or the group's only/first currency). The wallet stored and sent to
Ledger is resolved from group + currency (`WalletAccount.resolve`). Changing
the group keeps the currency when the new group has it, otherwise it falls
back to the default. The currency factor field appears only for
non-default currencies.

New expenses start with the **wallet, currency and date of the last created
expense** (stored in shared preferences), since expenses are usually entered
for the same account and day. A remembered wallet is ignored if it no longer
exists or its group is now hidden. Toggle in Settings → *New expenses*
(on by default; turning it off forgets the stored values).

### Filters and sorting

Filters (date range with presets Today / This month / Last month / Last 3
months, wallet, vendor, expense type) and the sort order are
applied locally. Sort by **Date** (default, newest first) or **Total**,
ascending or descending; totals are compared by their normalized value in the
default currency. Sorting only changes the list order, not the dashboard.

### Synchronization

- **Local save**: validate → local id + UUID `sync_key` → `remote_id = null`,
  `sync_status = pending` → SQLite. No network.
- **Normal sync** (Sync tab, pull-to-refresh on Home): uploads
  pending/failed rows to `POST /expenses/sync` in batches of ≤ 10 with their
  stable keys; stores returned remote ids; marks failures `failed` (kept for
  retry). If the server rolled back a whole batch, each item is retried alone
  (safe: the endpoint is idempotent) so one bad row cannot block the rest.
  Then it downloads the window (current + previous two calendar months) page
  by page and reconciles it in one transaction.
- **Full sync** (Settings): uploads first, then downloads all catalogs and
  the whole window, and replaces catalogs + synchronized expenses in a single
  transaction only after every request succeeded.
- **Initial sync**: a full sync on first setup.
- Reconciliation updates/inserts synced rows and deletes synced rows missing
  from the server (inside the window; everywhere on full sync). Rows with
  `remote_id = null` are never deleted or overwritten.
- `SyncLock` prevents concurrent syncs. Downloads are staged in memory, so a
  failure leaves the previous offline dataset untouched.
- Expenses are downloaded with `GET /expenses?excludeInstallmentParents=true`:
  an interest-free monthly purchase exists in Ledger as the full purchase
  (`monthly_with_no_interest.expense_id`) plus one expense per installment;
  only the installments are synced so the purchase is not counted twice.
  Parents already on the device are removed by the next refresh.
- Pagination (`Paginator`) loops until the unique record count equals the
  server-reported total, sorting by `id` so offset paging is stable, and
  fails rather than returning a partial dataset.

### Backend mobile sync endpoint

`POST /expenses/sync` (in `backend/`):

```json
{ "expenses": [ { "syncKey": "uuid", "walletId": 7, "expenseTypeId": 3, "vendorId": 23,
                  "description": "Groceries", "total": 1250.5, "currencyFactor": null,
                  "buyDate": "2026-10-03" } ] }
```

Response (HTTP 200 whenever the batch was processed):

```json
{ "success": false, "data": [
  { "syncKey": "…", "success": true, "remoteId": 123, "alreadySynced": false },
  { "syncKey": "…", "success": false, "errorCode": "BATCH_FAILED",
    "databaseErrorCode": "ER_NO_REFERENCED_ROW_2", "message": "…" } ] }
```

- Keys are stored in `expense_sync_key` (primary key = `sync_key`); a repeated
  key returns the existing id and never inserts again.
- Valid items are inserted in one transaction; on a database error it is
  rolled back and one row per item (request JSON, driver code/message,
  `created_at`) is written to `expense_sync_error_log` independently.
- Invalid items get `VALIDATION_ERROR` individually. Envelope errors (not an
  array, 0 or > 10 items, duplicate keys) return HTTP 400.
- Migrations: `database/migrations/051_create_table_expense_sync_key.sql`,
  `052_create_table_expense_sync_error_log.sql`.

## Tests

```bash
cd mobile && flutter test          # unit + database + sync + dashboard + widget
cd backend && npm test             # MobileSyncService (idempotency, rollback, logging)

# Optional read-only checks against a running backend:
LEDGER_API_URL=http://localhost:3002 flutter test test/live_api_test.dart
```

Database and sync tests use an in-memory SQLite database and a fake Ledger
server that mimics the real endpoint (idempotent keys, transactional batches,
pagination, injected timeouts and lost responses).

## Known limitations

- `GET /expenses` does not return `syncKey`. If an upload's response is lost
  and a refresh runs before the retry, the expense briefly appears twice until
  the retry returns its remote id (the duplicate is then removed).
- Editing a failed expense whose earlier upload actually reached the server:
  the retry returns the existing id (no duplicate) and the next refresh shows
  the server's version, so that local edit is not applied.
- Catalogs have no change cursor; they are fully re-downloaded on full sync.
  Wallet memberships require one request per wallet group.
- Expenses older than the three-month window are only on the device if they
  were synchronized before; they are not refreshed.
- Wallet-group totals use the wallet's primary membership (same as the web
  app's expense chart); `forward_wallet_id` is stored but not applied.
