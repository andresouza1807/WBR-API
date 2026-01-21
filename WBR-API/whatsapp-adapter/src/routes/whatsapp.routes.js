const express = require('express');
const sessionManager = require('../session/session.manager');
const whatsappService = require('../services/whatsapp.service');

const router = express.Router();

// Create/Initialize WhatsApp Session
router.post('/sessions', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const result = await sessionManager.createSession(sessionId);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get QR Code
router.get('/sessions/:sessionId/qr', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.qrCode) {
      return res.status(202).json({ status: 'waiting_for_qr' });
    }

    res.json({ qrCode: session.qrCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Session Status
router.get('/sessions/:sessionId/status', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const status = await whatsappService.getSessionStatus(sessionId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List All Sessions
router.get('/sessions', (req, res) => {
  try {
    const sessions = sessionManager.getAllSessions();
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send Message
router.post('/sessions/:sessionId/send-message', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'phoneNumber and message are required' });
    }

    const result = await whatsappService.sendMessage(sessionId, phoneNumber, message);
    res.json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send Media
router.post('/sessions/:sessionId/send-media', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { phoneNumber, mediaPath, caption } = req.body;

    if (!phoneNumber || !mediaPath) {
      return res.status(400).json({ error: 'phoneNumber and mediaPath are required' });
    }

    const result = await whatsappService.sendMedia(sessionId, phoneNumber, mediaPath, caption);
    res.json(result);
  } catch (error) {
    console.error('Error sending media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Contact Info
router.get('/sessions/:sessionId/contact/:phoneNumber', async (req, res) => {
  try {
    const { sessionId, phoneNumber } = req.params;
    const info = await whatsappService.getContactInfo(sessionId, phoneNumber);
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Destroy Session
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await sessionManager.destroySession(sessionId);
    res.json({ success: true, message: 'Session destroyed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
