export const healthPath = {
  '/health': {
    get: {
      tags: ['System'],
      summary: 'Health check',
      responses: {
        200: {
          description: 'Service health status',
        },
      },
    },
  },
};
