# Database setup

This project manages the schema and base data of `db_ledger` through versioned
migrations and seeds in `migrations/` and `seeds/`. `init.sql` and
`migrate_icons_to_material.sql` were archived in `legacy/` and are no longer
used: the MySQL container starts empty and is populated with the commands
below.

## Requirements

- The MySQL container running (see `docker-compose.dev.yml` /
  `docker-compose.prod.yml` at the repo root, service `mysql`).
- `backend/.env` with the connection credentials (`DB_HOST`, `DB_PORT`,
  `DB_USER`, `DB_PASSWORD`, `DB_NAME`) — every script in this project
  connects using that file when run on the host. Inside a Docker container
  they connect with whatever environment variables `docker-compose` passes
  them (the `.env` file doesn't need to be present there).
- Dependencies installed: `npm install`.

## Via Docker (automatic)

The compose files at the repo root include a `migrate` service
(`Dockerfile.migrate`, a Node image) that waits for `mysql` to be healthy and
runs `db:migrate` followed by `db:seed` once; `backend` doesn't start until
that service finishes successfully. In other words, running
`npm run docker:dev` (or `docker:prod`) creates the schema and loads the
catalogs on its own, with no manual steps.

## Manual first run (empty database)

If you're running MySQL standalone (without the `migrate` service) or want to
apply something one-off:

```bash
npm run db:migrate   # creates the schema: tables, views, and routines (migrations/)
npm run db:seed      # loads base catalogs: currencies, types, vendors, etc. (seeds/)
```

Both commands are idempotent: `db:migrate` keeps track of what's applied in
the `schema_migrations` table and only runs what's missing; `db:seed` uses
`INSERT ... ON DUPLICATE KEY UPDATE`, so it can be run as many times as
needed without duplicating rows. That's why the `migrate` service is safe to
run on every startup, even against a database that already has data.

## Other commands

- `npm run db:backup` — generates a full dump (`mysqldump`) at
  `backups/dump-<db>-<timestamp>.sql`: tables, data, views, procedures,
  triggers, and events.
- `npm run db:restore -- --file backups/<file>.sql` — restores a specific
  backup (defaults to the most recent one in `backups/`). **Overwrites**
  the database configured in `backend/.env`; asks for confirmation
  (use `--yes` to skip it in non-interactive scripts).
- `npm run db:rebuild -- --yes` — drops and recreates the database from
  scratch (`DROP DATABASE` + `CREATE DATABASE`) and re-runs `db:migrate` and
  `db:seed`. Useful for resetting a test environment to a clean, known
  state. **Destructive**, asks for confirmation just like `db:restore`.
- `npm run db:cli` — interactive menu to run any of the commands above
  without remembering the exact npm script name (`npm run db:cli -- --help`
  for the non-interactive form).

## Adding a new migration or seed

- Migrations: add a `NNN_create_..._<name>.sql` file in `migrations/`
  (sequential numbering, in FK dependency order) and run
  `npm run db:migrate`.
- Seeds: add a `NNN_seed_<table>.sql` file in `seeds/` with
  `INSERT ... ON DUPLICATE KEY UPDATE` and run `npm run db:seed`. Source CSV
  data, when there is any, lives in `seeds/data/`.
