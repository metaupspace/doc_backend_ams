export const swaggerComponents = {
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
};
