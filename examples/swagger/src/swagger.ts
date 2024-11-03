import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restack Express API',
      version: '1.0.0',
      description: 'API documentation for Restack Express example',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
    ],
  },
  apis: ['src/server.ts'],
};

export const specs = swaggerJsdoc(options);