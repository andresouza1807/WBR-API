const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const whatsappRoutes = require('./routes/whatsapp.routes');
const webhookRoutes = require('./routes/webhook.routes');
const config = require('./config/env');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// GUI Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true,
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'WhatsApp Adapter API Docs',
}));

// Routes
app.use('/whatsapp', whatsappRoutes);
app.use('/webhook', webhookRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint - Redirects to dashboard
 *     tags:
 *       - General
 *     responses:
 *       200:
 *         description: API está funcionando
 */
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags:
 *       - General
 *     responses:
 *       200:
 *         description: Status da API
 */
// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.isDevelopment ? err.message : undefined,
  });
});

module.exports = app;
