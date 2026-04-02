import { DOCUMENT_TYPES } from '../../../modules/document/config/document.config.ts';

export const documentsPath = {
  '/api/v1/documents': {
    get: {
      tags: ['Documents'],
      summary: 'Fetch documents metadata',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'documentType', in: 'query', schema: { type: 'string', enum: DOCUMENT_TYPES } },
        { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      ],
      responses: {
        200: {
          description: 'Documents metadata response',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
      },
    },
  },

  '/api/v1/documents/{id}': {
    get: {
      tags: ['Documents'],
      summary: 'Fetch one document PDF by id',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'PDF streamed in response',
          content: {
            'application/pdf': {
              schema: {
                type: 'string',
                format: 'binary',
              },
            },
          },
        },
        404: {
          description: 'Document not found',
        },
      },
    },
  },
};
