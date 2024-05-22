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
