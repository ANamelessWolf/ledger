# Frontend

How the Angular app is put together today. For day-to-day commands, see
[../frontend/README.md](../frontend/README.md); this page is the deeper
reference.

## Stack

- **Angular 17** (standalone components, the `application` builder — no
  `NgModule`-based bootstrap).
- **Angular Material** for UI components (`src/app/shared/material`).
- Feature-folder architecture: each domain area (`card`, `expense`, `wallet`,
  `budget`, ...) owns its own `pages/`, `components/`, `services/`, and route
  file, lazy-loaded from `app.routes.ts`.

## Running the dev server

```bash
npm start                              # ng serve, http://localhost:4200
npm run serve                          # ng serve --host 0.0.0.0 --public-host <lan-ip>:4200
```

Use `npm run serve` (or the equivalent `ng serve --host 0.0.0.0 --public-host <your-lan-ip>:4200`) when you need to reach the dev server from another device on the same network — Angular's dev server otherwise rejects requests whose `Host` header doesn't match `localhost`.

## API base URL

Hardcoded in `src/app/config/environment.ts`:

```ts
const environment = {
  LEDGER_API_URL: 'http://localhost:3002',
};
```

There's no Angular environment-file setup (`environment.prod.ts` etc.) —
update this value directly if the backend runs somewhere other than
`localhost:3002`.

## Path aliases

`tsconfig.json` defines `paths` resolved relative to the config file itself
(no `baseUrl` — that option is being removed in a future TypeScript
version):

```
@home/*, @card/*, @expense/*, @wallet/*, @moNoInt/*, @common/*,
@config/*, @subscription/*, @budget/*, @account/*, @settings/*
```

each mapping to the matching folder under `src/app/`. A handful of older
files also use bare `app/...` imports (e.g.
`from 'app/shared/material/material.module'`); those are covered by a
catch-all `"app/*": ["./src/app/*"]` entry rather than being rewritten to a
named alias.

## Production build

```bash
npm run build   # ng build, output in dist/frontend/
```

`angular.json` sets production budgets at 1.5 MB (warning) / 3 MB (error)
for the initial bundle, and 4 KB / 8 KB per component stylesheet — raised
from Angular's defaults (500 KB / 1 MB and 2 KB / 4 KB) because the app has
grown past them. If a future build starts failing on the budget, that's the
place to look — either trim the bundle (lazy-load more routes, drop unused
Material modules) or raise the ceiling again.

## Docker

- `Dockerfile` — dev image, runs `ng serve --host 0.0.0.0 --port 4202`.
  Notably, it copies only `package.json` (not `package-lock.json`) before
  `npm install`. The committed lockfile was generated on Windows and, due to
  a known npm bug ([npm/cli#4828](https://github.com/npm/cli/issues/4828)),
  doesn't include the Linux build of Rollup's native binary
  (`@rollup/rollup-linux-x64-gnu`) that Vite (used by Angular's dev server)
  needs — installing fresh inside the container resolves the right platform
  binaries instead of failing with `Cannot find module
  @rollup/rollup-linux-x64-gnu`.
- `Dockerfile.prod` — multi-stage: `ng build` in a `node:20` stage, then the
  static output is served by nginx (`nginx.conf`, SPA fallback to
  `index.html`) on port 80.
