const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const config = require('../config/env');
const messageHandler = require('../events/message.handler');

class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  async createSession(sessionId) {
    try {
      const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionId }),
        puppeteer: {
          headless: config.whatsapp.headless,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      });

      // Create session object BEFORE initialization
      this.sessions.set(sessionId, { client, status: 'initializing' });

      // Setup event listeners
      client.on('qr', (qr) => this.handleQR(sessionId, qr));
      client.on('authenticated', () => this.handleAuthenticated(sessionId));
      client.on('auth_failure', () => this.handleAuthFailure(sessionId));
      client.on('ready', () => this.handleReady(sessionId));
      client.on('message', (msg) => messageHandler.handle(sessionId, msg));
      client.on('disconnected', () => this.handleDisconnected(sessionId));

      await client.initialize();

      return { success: true, sessionId };
    } catch (error) {
      console.error(`Error creating session ${sessionId}:`, error);
      throw error;
    }
  }

  handleQR(sessionId, qr) {
    console.log(`QR Code generated for session ${sessionId}`);
    const session = this.sessions.get(sessionId);
    if (session) {
      // Generate QR code image from the QR string
      QRCode.toDataURL(qr, { width: 300, margin: 1, color: { dark: '#000', light: '#FFF' } })
        .then(qrImageUrl => {
          session.qrCode = qrImageUrl;
          session.qrString = qr;
          console.log(`QR image generated for session ${sessionId}`);
        })
        .catch(error => {
          console.error(`Error generating QR image for session ${sessionId}:`, error);
          session.qrCode = null;
        });
    }
  }

  handleAuthenticated(sessionId) {
    console.log(`Session ${sessionId} authenticated`);
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'authenticated';
  }

  handleAuthFailure(sessionId) {
    console.error(`Authentication failed for session ${sessionId}`);
    this.destroySession(sessionId);
  }

  handleReady(sessionId) {
    console.log(`Session ${sessionId} ready`);
    const session = this.sessions.get(sessionId);
    if (session) session.status = 'ready';
  }

  handleDisconnected(sessionId) {
    console.log(`Session ${sessionId} disconnected`);
    this.destroySession(sessionId);
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  async destroySession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session && session.client) {
      try {
        await session.client.destroy();
      } catch (error) {
        console.error(`Error destroying session ${sessionId}:`, error);
      }
    }
    this.sessions.delete(sessionId);
  }

  getAllSessions() {
    return Array.from(this.sessions.entries()).map(([id, session]) => ({
      id,
      status: session.status,
    }));
  }
}

module.exports = new SessionManager();
