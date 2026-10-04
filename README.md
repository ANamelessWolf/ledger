# Ledger

A personal finance manager: track expenses, credit/debit cards, wallets, budgets, subscriptions, and financing accounts. Monorepo with an Angular frontend, an Express/TypeORM backend, and a versioned MySQL schema.

## Project structure

```
ledger/
├── backend/     Express + TypeORM API (TypeScript)
├── frontend/    Angular 17 SPA
├── mobile/      Flutter Android app (offline-first expenses)
├── database/    MySQL schema: migrations, seeds, and admin scripts
└── wiki/        Extra docs (Swagger usage, setup notes)
```

Each sub-project has its own README with details specific to it:

- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)
- [mobile/README.md](mobile/README.md)
- [database/README.md](database/README.md)

## Prerequisites

- Node.js 20, npm 10
- Docker + Docker Compose (for the containerized workflow)
- Angular CLI 17.3.x (`npm install -g @angular/cli`) if you want to run `ng` directly

## Quick start

### Option A — Docker (recommended)

Brings up MySQL, runs migrations + seeds automatically, then starts the backend and frontend:

```bash
npm run docker:dev
```

- Frontend: http://localhost:4202
- Backend: http://localhost:3002 (API docs at `/api-docs`)
- MySQL: `localhost:3307`

Tear it down with `npm run docker:dev:down`. A production-flavored stack (compiled backend, Angular build served by nginx) is available via `npm run docker:prod` / `docker:prod:down`. See [docker-compose.dev.yml](docker-compose.dev.yml) and [docker-compose.prod.yml](docker-compose.prod.yml).

Both compose files read secrets from `backend/.env` and `database/.env` — see **Environment files** below before running them.

### Option B — Run locally without Docker

Requires a MySQL instance you manage yourself (matching `backend/.env`), with the schema and seed data already applied via the `database/` scripts (see [database/README.md](database/README.md)).

```bash
npm install
npm run dev
```

This runs the backend (`ts-node-dev`) and the frontend (`ng serve`) concurrently.

## Environment files

Both `backend/` and `database/` need their own `.env`, copied from the `.env.example` in the same folder:

```bash
cp backend/.env.example backend/.env
cp database/.env.example database/.env
```

Fill in `DB_PASSWORD` in both — the Docker Compose files require it (`MYSQL_ROOT_PASSWORD` is sourced from `database/.env`, never hardcoded) and will refuse to start otherwise.

## Docker images

- `backend/Dockerfile` — dev image, runs `ts-node-dev` with hot reload.
- `backend/Dockerfile.prod` — multi-stage: `tsc` build, then a slim `node:20-alpine` runtime.
- `frontend/Dockerfile` — dev image, runs the Angular dev server.
- `frontend/Dockerfile.prod` — multi-stage: Angular production build served by nginx.
- `database/Dockerfile` — plain `mysql:8.0`, no baked-in credentials or seed data.
- `database/Dockerfile.migrate` — one-shot Node image that runs `db:migrate` then `db:seed` against the `mysql` service and exits; the `backend` service waits for it to finish successfully before starting.

## Documentation

- [wiki/backend-setup.md](wiki/backend-setup.md) — backend architecture and conventions.
- [wiki/frontend.md](wiki/frontend.md) — frontend structure and dev server usage.
- [wiki/swagger-use.md](wiki/swagger-use.md) — documenting API routes with Swagger.
