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
