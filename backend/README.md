# Backend

Express + TypeORM API for Ledger, written in TypeScript.

## Stack

- Express 4
- TypeORM 0.3 (MySQL)
- Swagger (`swagger-jsdoc` + `swagger-ui-express`) for API docs
- `ts-node-dev` for local development, plain `tsc` for production builds

## Environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable      | Purpose                                        |
| ------------- | ----------------------------------------------- |
| `DB_HOST`     | MySQL host (`localhost` outside Docker)          |
| `DB_PORT`     | MySQL port (`3307` published by Docker Compose)  |
| `DB_USER`     | MySQL user (`root` in dev)                       |
| `DB_PASSWORD` | MySQL password — must match `database/.env`      |
| `DB_NAME`     | Database name (`db_ledger`)                      |
| `PORT`        | Port the API listens on (`3002`)                 |

Inside Docker, `DB_HOST`/`DB_PORT` are overridden by `docker-compose.dev.yml`/`docker-compose.prod.yml` to reach the `mysql` service over the container network (`mysql:3306`) instead of the host-published port.

## Scripts

```bash
npm run dev            # start with ts-node-dev (hot reload)
npm run build           # compile to dist/ with tsc
npm start               # run the compiled build (node dist/index.js)
npm run generate-docs   # regenerate swagger.json from route annotations
npm run lint             # eslint
npm run lint-fix         # eslint --fix
```

## Project structure

```
src/
├── index.ts             Entry point: creates the Express app and DB connection
├── data-source.ts        TypeORM DataSource configuration
├── routes/                One router module per resource, mounted in routes/index.ts
├── controllers/           Request handlers
├── services/               Business logic shared across controllers
├── models/                 TypeORM entities
├── middlewares/            Express middlewares (error handling, swagger, ...)
├── types/                   Shared request/response TypeScript types
├── common/                  Shared constants, enums, interfaces
├── scripts/                 One-off utility scripts (e.g. upload.ts)
└── swaggerOptions.ts        Swagger/OpenAPI definition
```

### Path aliases

Configured in `tsconfig.json` (`paths`, resolved relative to the config file — no `baseUrl`):

```
@controller/*  -> src/controllers/*
@model/*       -> src/models/*
@utils/*       -> src/utils/*
@common/*      -> src/common/*
@route/*       -> src/routes/*
```

## API docs

Swagger UI is served at `/api-docs` (e.g. http://localhost:3002/api-docs) once the server is running. See [../wiki/swagger-use.md](../wiki/swagger-use.md) for how to annotate a new route.

## Docker

- `Dockerfile` — dev image (`ts-node-dev`, hot reload via `docker-compose.dev.yml`).
- `Dockerfile.prod` — multi-stage build: compiles with `tsc`, then runs `node dist/index.js` on `node:20-alpine` (used by `docker-compose.prod.yml`).

Both expect their runtime config as environment variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`) — the dev image gets them via `env_file: backend/.env` plus a couple of overrides in the compose file; nothing is hardcoded in the Dockerfiles themselves.
