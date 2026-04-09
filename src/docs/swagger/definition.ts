import { healthPath, generateDocumentPaths, documentsPath } from './routes/index.ts';
import { swaggerComponents } from './components.ts';

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
      url: 'https://docbackendams-production.up.railway.app',
      description: 'Production (Railway)',
    },
    // {
    //   url: 'https://',
    //   description: 'Production (Railway) -- Official Domain',
    // },
    {
      url: 'http://localhost:3000',
      description: 'Local development',
    },
  ],
  components: swaggerComponents,
  paths: {
    ...healthPath,
    ...generateDocumentPaths,
    ...documentsPath,
  },
};
