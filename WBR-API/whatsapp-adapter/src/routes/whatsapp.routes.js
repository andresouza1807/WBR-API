const express = require('express');
const sessionManager = require('../session/session.manager');
const whatsappService = require('../services/whatsapp.service');

const router = express.Router();

/**
 * @swagger
 * /whatsapp/sessions:
 *   post:
 *     summary: Criar uma nova sessão WhatsApp
 *     description: Inicializa uma nova sessão WhatsApp que gerará um código QR para autenticação
 *     tags:
 *       - Sessions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: session-1
 *     responses:
 *       201:
 *         description: Sessão criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sessionId:
 *                   type: string
 *       400:
 *         description: SessionId é obrigatório
 *       500:
 *         description: Erro ao criar sessão
 */
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

/**
 * @swagger
 * /whatsapp/sessions/{sessionId}/qr:
 *   get:
 *     summary: Obter código QR da sessão
 *     description: Retorna o código QR para escanear e autenticar a sessão WhatsApp
 *     tags:
 *       - Sessions
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Código QR gerado
 *       202:
 *         description: Aguardando geração do código QR
 *       404:
 *         description: Sessão não encontrada
 */
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

/**
 * @swagger
 * /whatsapp/sessions/{sessionId}/status:
 *   get:
 *     summary: Obter status da sessão
 *     tags:
 *       - Sessions
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status da sessão
 *       500:
 *         description: Erro ao obter status
 */
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

/**
 * @swagger
 * /whatsapp/sessions:
 *   get:
 *     summary: Listar todas as sessões
 *     tags:
 *       - Sessions
 *     responses:
 *       200:
 *         description: Lista de sessões
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 */
// List All Sessions
router.get('/sessions', (req, res) => {
  try {
    const sessions = sessionManager.getAllSessions();
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /whatsapp/sessions/{sessionId}/send-message:
 *   post:
 *     summary: Enviar mensagem de texto
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "5511999999999"
 *               message:
 *                 type: string
 *                 example: "Olá! Como vai?"
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso
 *       400:
 *         description: Faltam parâmetros obrigatórios
 */
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

/**
 * @swagger
 * /whatsapp/sessions/{sessionId}/send-media:
 *   post:
 *     summary: Enviar mídia (imagem, vídeo, áudio, documento)
 *     tags:
 *       - Messages
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               mediaPath:
 *                 type: string
 *               caption:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mídia enviada com sucesso
 */
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

/**
 * @swagger
 * /whatsapp/sessions/{sessionId}/contact/{phoneNumber}:
 *   get:
 *     summary: Obter informações do contato
 *     tags:
 *       - Contacts
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Informações do contato
 */
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

/**
 * @swagger
 * /whatsapp/sessions/{sessionId}:
 *   delete:
 *     summary: Destruir sessão WhatsApp
 *     tags:
 *       - Sessions
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sessão destruída com sucesso
 */
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
