const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatsApp Adapter API',
      version: '1.0.0',
      description: 'API completa para gerenciar múltiplas sessões WhatsApp com suporte a webhooks',
      contact: {
        name: 'Andre Souza',
        url: 'https://github.com/andresouza1807/WBR-API',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development Server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production Server',
      },
    ],
    components: {
      schemas: {
        Session: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'session-1',
            },
            status: {
              type: 'string',
              enum: ['initializing', 'authenticated', 'ready', 'disconnected'],
              example: 'ready',
            },
          },
        },
        Message: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              example: 'session-1',
            },
            from: {
              type: 'string',
              example: '5511999999999@c.us',
            },
            to: {
              type: 'string',
              example: '5511888888888@c.us',
            },
            body: {
              type: 'string',
              example: 'Olá! Como vai?',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-21T02:46:20.000Z',
            },
            isGroupMsg: {
              type: 'boolean',
              example: false,
            },
            type: {
              type: 'string',
              example: 'chat',
            },
            hasMedia: {
              type: 'boolean',
              example: false,
            },
            contactName: {
              type: 'string',
              example: 'John Doe',
            },
          },
        },
        Webhook: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
            },
            event: {
              type: 'string',
              enum: ['message.received', 'message.ack', 'session.status'],
            },
            data: {
              type: 'object',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'API key is missing or invalid',
        },
        NotFound: {
          description: 'Resource not found',
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/server.js'],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
