const { Client, LocalAuth } = require('whatsapp-web.js');
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

      // Setup event listeners
      client.on('qr', (qr) => this.handleQR(sessionId, qr));
      client.on('authenticated', () => this.handleAuthenticated(sessionId));
      client.on('auth_failure', () => this.handleAuthFailure(sessionId));
      client.on('ready', () => this.handleReady(sessionId));
      client.on('message', (msg) => messageHandler.handle(sessionId, msg));
      client.on('disconnected', () => this.handleDisconnected(sessionId));

      await client.initialize();
      this.sessions.set(sessionId, { client, status: 'initializing' });

      return { success: true, sessionId };
    } catch (error) {
      console.error(`Error creating session ${sessionId}:`, error);
      throw error;
    }
  }

  handleQR(sessionId, qr) {
    console.log(`QR Code generated for session ${sessionId}`);
    // Emit QR code event or store for retrieval
    this.sessions.get(sessionId).qrCode = qr;
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
