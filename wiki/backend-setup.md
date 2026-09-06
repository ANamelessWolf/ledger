# Backend setup

How the backend project is put together today. For day-to-day commands, see
[../backend/README.md](../backend/README.md); this page is the deeper
"why it's built this way" reference.

## Stack

- **Express 4** for HTTP routing/middleware.
- **TypeORM 0.3** as the ORM, connecting to MySQL via `mysql2`.
- **Swagger** (`swagger-jsdoc` + `swagger-ui-express`) for API docs, generated
  from JSDoc comments on route files.
- **TypeScript**, compiled with plain `tsc` (no bundler) — `target: es2016`,
  `module: CommonJS`.
- **ts-node-dev** for local development (hot reload, `--transpile-only` so it
  doesn't type-check on every save).

## tsconfig

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "experimentalDecorators": true,
    "strictPropertyInitialization": false
  },
  "paths": {
    "@controller/*": ["./src/controllers/*"],
    "@model/*": ["./src/models/*"],
    "@utils/*": ["./src/utils/*"],
    "@common/*": ["./src/common/*"],
    "@route/*": ["./src/routes/*"]
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

Notes:

- `experimentalDecorators` is required by TypeORM's `@Entity`/`@Column`
  decorators.
- `strictPropertyInitialization` is off because TypeORM entity properties are
  populated by the ORM, not by a constructor.
- `paths` are resolved relative to `tsconfig.json` itself (no `baseUrl` —
  that option is being removed in a future TypeScript version). None of the
  current source files actually use these aliases yet, but they're wired up
  for when they do.

## Project structure

```
src/
├── index.ts             Entry point: creates the Express app and DB connection
├── data-source.ts        TypeORM DataSource configuration
├── routes/                One router module per resource, mounted in routes/index.ts
├── controllers/           Request handlers
├── services/               Business logic shared across controllers
├── models/                 TypeORM entities
├── middlewares/            Error handling, Swagger UI mounting, etc.
├── types/                   Shared request/response TypeScript types
├── common/                  Shared constants, enums, interfaces
├── scripts/                 One-off utility scripts (run with ts-node, not part of the server)
└── swaggerOptions.ts        Swagger/OpenAPI definition
```

## Express server bootstrap

`src/index.ts` starts the HTTP server first, then initializes the TypeORM
`DataSource`:

```ts
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("unhandledRejection", (err: Error) => {
  server.close(() => process.exit(1));
});

const connResult = await AppDataSource.initialize();
```

Anything that throws an unhandled rejection anywhere in the app brings the
whole process down (by design, to fail fast rather than run in a half-broken
state). This matters most at startup: if the database isn't reachable yet
(e.g. DNS for a Docker Compose service not resolving for a moment), the
process exits immediately rather than retrying. That's why
`docker-compose.dev.yml`/`docker-compose.prod.yml` gate the backend on a
MySQL healthcheck (`condition: service_healthy`) instead of just
`depends_on: [mysql]` — the latter only waits for the container to start, not
for MySQL to actually accept connections.

## CORS

Enabled globally with a permissive `origin: "*"` in `src/routes/index.ts`. If
requests ever need credentials (cookies, `Authorization` with
`credentials: 'include'`), this will need to change — browsers reject
`Access-Control-Allow-Origin: *` combined with credentialed requests.

## Docker

- `Dockerfile` — dev image: installs deps, copies source, runs
  `ts-node-dev --respawn --transpile-only src/index.ts`.
- `Dockerfile.prod` — multi-stage: builds with `tsc` in a `node:20` stage,
  then copies just `dist/` into a slim `node:20-alpine` runtime and runs
  `node dist/index.js`.

Neither Dockerfile hardcodes credentials. Runtime config (`DB_HOST`,
`DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`) comes from
environment variables injected by `docker-compose` (`env_file: backend/.env`
plus a couple of overrides for the in-network DB host/port).

## Adding a new endpoint

1. Add a TypeORM entity in `src/models/` if a new table is involved.
2. Add a controller in `src/controllers/` (and a service in `src/services/`
   if the logic is non-trivial or reused).
3. Add a route file in `src/routes/` (or extend an existing one) and mount it
   in `src/routes/index.ts`.
4. Annotate the route with a `@swagger` JSDoc block (see
   [swagger-use.md](swagger-use.md)) and run `npm run generate-docs`.
