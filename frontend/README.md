# Frontend

Angular 17 single-page app for Ledger.

## Development server

```bash
npm start          # ng serve — http://localhost:4200
npm run serve       # ng serve --host 0.0.0.0 --public-host <lan-ip>:4200 (for LAN access)
```

The API base URL is hardcoded in `src/app/config/environment.ts` (`LEDGER_API_URL`, defaults to `http://localhost:3002`) — update it there if the backend runs somewhere else.

## Build

```bash
npm run build        # production build, output in dist/frontend/
npm run watch         # dev build, rebuilds on file changes
```

## Tests

```bash
npm test    # unit tests via Karma/Jasmine
```

## Project structure

Feature-folder layout under `src/app/`, one folder per domain area:

```
src/app/
├── home/            Landing/dashboard
├── account/         Accounts overview
├── card/            Credit/debit card management
├── expense/         Expense tracking
├── wallet/           Wallets and wallet groups
├── monthly/           Monthly no-interest installments
├── budget/            Budgets
├── subscription/       Recurring subscriptions
├── settings/            Catalog/settings management
├── config/               Environment config, constants, enums, guards, interceptors
├── common/                Shared components, directives, pipes, services, types, utils
└── shared/                  Shared layouts, standalone components, Angular Material module
```

Each feature folder typically has its own `pages/`, `components/`, `services/`, and route file, lazy-loaded from `app.routes.ts`.

### Path aliases

Configured in `tsconfig.json` (`paths`, resolved relative to the config file — no `baseUrl`):

```
@home/*         -> src/app/home/*
@card/*         -> src/app/card/*
@expense/*      -> src/app/expense/*
@wallet/*       -> src/app/wallet/*
@moNoInt/*      -> src/app/monthly/*
@common/*       -> src/app/common/*
@config/*       -> src/app/config/*
@subscription/* -> src/app/subscription/*
@budget/*       -> src/app/budget/*
@account/*      -> src/app/account/*
@settings/*     -> src/app/settings/*
app/*           -> src/app/*   (bare imports used in a few older files)
```

## Docker

- `Dockerfile` — dev image, runs `ng serve --host 0.0.0.0` (used by `docker-compose.dev.yml`). Only `package.json` (not `package-lock.json`) is copied in before `npm install`, so each build resolves dependencies fresh for the container's platform — the committed lockfile is Windows-generated and can miss Linux-only optional native binaries (e.g. `@rollup/rollup-linux-x64-gnu`), a known npm bug ([npm/cli#4828](https://github.com/npm/cli/issues/4828)).
- `Dockerfile.prod` — multi-stage: Angular production build, served as static files by nginx (`nginx.conf`) on port 80 (used by `docker-compose.prod.yml`).
