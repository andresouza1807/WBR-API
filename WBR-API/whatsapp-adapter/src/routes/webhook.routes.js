const express = require('express');
const webhookService = require('../services/webhook.service');

const router = express.Router();

/**
 * @swagger
 * /webhook/messages:
 *   post:
 *     summary: Receber webhooks de eventos
 *     description: Endpoint para receber webhooks de mensagens recebidas, confirmações e outros eventos
 *     tags:
 *       - Webhooks
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
 *               event:
 *                 type: string
 *                 enum: [message.received, message.ack]
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook processado com sucesso
 *       400:
 *         description: Campos obrigatórios faltando
 *       500:
 *         description: Erro ao processar webhook
 */
// Receber webhook de mensagens
router.post('/messages', async (req, res) => {
  try {
    const { sessionId, event, data } = req.body;

    console.log(`📨 Webhook received for session ${sessionId}`);
    console.log(`Event: ${event}`);
    console.log(`Data:`, data);

    // Validar payload
    if (!sessionId || !event || !data) {
      return res.status(400).json({
        error: 'Missing required fields: sessionId, event, data',
      });
    }

    // Processar baseado no tipo de evento
    switch (event) {
      case 'message.received':
        return handleMessageReceived(req, res, data);
      case 'message.ack':
        return handleMessageAck(req, res, data);
      default:
        return res.status(400).json({ error: 'Unknown event type' });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /webhook/retry-queue:
 *   get:
 *     summary: Verificar fila de retry
 *     tags:
 *       - Webhooks
 *     responses:
 *       200:
 *         description: Status da fila de retry
 */
// Status da fila de retry
router.get('/retry-queue', (req, res) => {
  try {
    const status = webhookService.getRetryQueueStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /webhook/retry-queue:
 *   delete:
 *     summary: Limpar fila de retry
 *     tags:
 *       - Webhooks
 *     responses:
 *       200:
 *         description: Fila limpa com sucesso
 */
// Limpar fila de retry
router.delete('/retry-queue', (req, res) => {
  try {
    const result = webhookService.clearRetryQueue();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /webhook/retry-queue/process:
 *   post:
 *     summary: Reprocessar fila de retry manualmente
 *     tags:
 *       - Webhooks
 *     responses:
 *       200:
 *         description: Fila reprocessada
 */
// Reprocessar fila de retry manualmente
router.post('/retry-queue/process', async (req, res) => {
  try {
    await webhookService.processRetryQueue();
    const status = webhookService.getRetryQueueStatus();
    res.json({
      message: 'Retry queue processed',
      status,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Handle de mensagem recebida
 */
function handleMessageReceived(req, res, data) {
  try {
    const { from, body, hasMedia, timestamp } = data;

    console.log(`✉️ Message from ${from}: ${body}`);

    // Aqui você pode:
    // - Salvar em banco de dados
    // - Processar com IA
    // - Enviar para fila de processamento
    // - Disparar outros eventos

    res.json({
      success: true,
      message: 'Message webhook received',
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error handling message webhook:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Handle de confirmação de mensagem enviada
 */
function handleMessageAck(req, res, data) {
  try {
    const { messageId, ack, timestamp } = data;

    console.log(`✓ Message acknowledged: ${messageId} (ack: ${ack})`);

    res.json({
      success: true,
      message: 'Message ack webhook received',
    });
  } catch (error) {
    console.error('Error handling ack webhook:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = router;
