import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerDefinition } from './definition.ts';

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
