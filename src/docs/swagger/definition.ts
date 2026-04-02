import { generateDocumentPaths } from './routes/generateDocument.routes.ts';
import { healthPath } from './routes/health.route.ts';
import { documentsPath } from './routes/documents.route.ts';

export const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Document Generation Service - AMS API',
    version: '1.0.0',
    description:
      'API for generating PDF documents with JWT-protected routes and streaming responses.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string' },
          code: { type: 'string' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
        },
      },
    },
  },
  paths: {
    ...healthPath,
    ...generateDocumentPaths,
    ...documentsPath,
  },
};
