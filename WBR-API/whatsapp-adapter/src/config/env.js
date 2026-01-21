require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3000,
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  logLevel: process.env.LOG_LEVEL || 'info',

  // WhatsApp Web.js config
  whatsapp: {
    headless: process.env.HEADLESS === 'true',
    useChrome: process.env.USE_CHROME === 'true',
    authTimeout: 60000,
    qrcodeTimeout: 60000,
  },

  // Session config
  session: {
    timeout: parseInt(process.env.SESSION_TIMEOUT) || 3600000,
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY) || 5000,
    storageDir: process.env.STORAGE_DIR || './sessions',
  },

  // Development flag
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
