const express = require('express');
const webhookService = require('../services/webhook.service');

const router = express.Router();

/**
 * Receber webhook de mensagens
 * POST /webhook/messages
 */
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

/**
 * Status da fila de retry
 * GET /webhook/retry-queue
 */
router.get('/retry-queue', (req, res) => {
  try {
    const status = webhookService.getRetryQueueStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Limpar fila de retry
 * DELETE /webhook/retry-queue
 */
router.delete('/retry-queue', (req, res) => {
  try {
    const result = webhookService.clearRetryQueue();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Reprocessar fila de retry manualmente
 * POST /webhook/retry-queue/process
 */
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

module.exports = router;
