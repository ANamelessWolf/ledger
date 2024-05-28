# Backend setup

## Step 1: Initialize the Project

Navigate to the backend directory and initialize a new Node.js project:

```sh
cd backend
npm init -y
```

## Step 2: Install Dependencies

Install Express and its types, TypeScript, and other necessary packages:

```sh
npm init
npm init -y
npm install express
npm install --save-dev typescript @types/node @types/express ts-node-dev
npm install --save dotenv
npm install swagger-ui-express swagger-jsdoc @types/swagger-ui-express @types/swagger-jsdoc
npm install typeorm mysql

```

## Step 3: Configure TypeScript

Create a tsconfig.json file in the backend directory:

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

## Step 4: Create the Project Structure

Create the necessary directories and files:

```
ledger/
│
├── backend/
│   ├── src/
│   │   ├── common/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.ts
│   │   └── swaggerOptions.ts
│   ├── .env
│   └── Dockerfile
...
```

## Step 5: Set Up Express Server with TypeScript

Edit `src/index.ts` to include the basic Express server setup:

```ts
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

```

## Step 6: Update package.json Scripts

Modify the scripts section in package.json to use ts-node-dev for development and tsc for building the project:

```json
"scripts": {
  "start": "node dist/index.js",
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "tsc",
}
```

## Step 7: Setup swagger

### Configure Swagger Options

Create a new file, .src/swaggerOptions.ts, where you'll define Swagger configuration options:

```ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ledger API',
            version: '1.0.0',
            description: 'API Documentation',
        },
    },
    // Paths to files containing OpenAPI definitions
    apis: ['src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

```

### Add Swagger Middleware

Create a middleware file, `src\middlewares\swaggerMiddleware.ts`, to serve Swagger UI and Swagger spec:

```ts
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swaggerOptions';

const router = express.Router();

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec));

export default router;

```

### Include Swagger middleware in the Express App

In the index.ts, import and use the Swagger middleware:

```ts
import swaggerMiddleware from './swaggerMiddleware';

const app = express();

app.use('/api-docs', swaggerMiddleware);
```

### Add a script to generate swagger docs

There might be an issue with running the swagger-jsdoc script directly in Windows due to the way the script is written. This is likely because it's using Unix-style syntax that's not compatible with Windows. To resolve this issue, there is an script in `src\utils\generateSwaggerDocs.ts` 

```ts
import fs from 'fs';
import { swaggerSpec } from '../swaggerOptions';

const outputFile = './swagger.json';

fs.writeFile(outputFile, JSON.stringify(swaggerSpec, null, 2), (err) => {
    if (err) {
        console.error('Error writing Swagger JSON file:', err);
    } else {
        console.log('Swagger JSON file generated successfully.');
    }
});
```

###  Modify the package.json

To run the script to generate the Swagger documentation. Add a compile step in your package.json.

```json
"scripts": {
    ...
    "generate-docs": "tsc && node dist/utils/generateSwaggerDocs.js"
}
```

## Step 8: Setup the Dockerfile for TypeScript Backend

```Dockerfile
FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]

```