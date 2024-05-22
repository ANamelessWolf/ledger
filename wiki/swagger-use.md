# Using swagger

Annotate Your Routes: In the route files (e.g., src/routes/owner.ts), annotate your Express routes with Swagger comments:

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

Then run:

```bash
npm run generate-docs
```

When you run your Node.js server and navigate to <BACKEND_SERVER_URL>/api-docs, you should see the Swagger UI with your API documentation. 