# Using Swagger

API docs are generated from JSDoc `@swagger` comments on the route files in
`backend/src/routes/`, using `swagger-jsdoc`, and served with
`swagger-ui-express` at `/api-docs`.

## Annotating a route

Add a `@swagger` block above the route handler, describing the endpoint in
OpenAPI 3.0 format:

```ts
/**
 * @swagger
 * /owner:
 *   get:
 *     summary: Returns all owners
 *     description: Get all ledger owners from the database
 *     responses:
 *       200:
 *         description: A list of owners
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/owners'
 */
```

## Regenerating the docs

```bash
cd backend
npm run generate-docs
```

This runs `tsc` (to compile `swaggerOptions.ts` and the annotated routes)
and then writes `swagger.json` at the project root. `swaggerOptions.ts`
points `apis` at `src/routes/*.ts`, so any file matching that glob is
scanned for `@swagger` comments.

## Viewing it

With the backend running, open `<BACKEND_URL>/api-docs` — e.g.
http://localhost:3002/api-docs for local dev, or the same path on whatever
host/port the backend is published to (`docker-compose.dev.yml` /
`docker-compose.prod.yml` both publish it on `3002`).
