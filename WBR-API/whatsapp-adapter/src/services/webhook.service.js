const axios = require('axios');
const config = require('../config/env');

class WebhookService {
  constructor() {
    this.retryQueue = [];
    this.maxRetries = 3;
    this.retryDelay = 5000;
  }

  /**
   * Enviar webhook de mensagem recebida
   */
  async sendMessageWebhook(messageData) {
    try {
      const webhookUrl = process.env.WEBHOOK_URL;

      if (!webhookUrl) {
        console.warn('WEBHOOK_URL not configured, message not sent');
        return { success: false, error: 'WEBHOOK_URL not configured' };
      }

      const payload = {
        event: 'message.received',
        data: messageData,
        timestamp: new Date().toISOString(),
      };

      const response = await axios.post(webhookUrl, payload, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': messageData.sessionId,
          'X-Webhook-Type': 'message',
        },
      });

      console.log(`✅ Webhook sent successfully for session ${messageData.sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`❌ Error sending webhook:`, error.message);
      
      // Adicionar à fila de retry
      this.addToRetryQueue(messageData, 0);
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar webhook de status da sessão
   */
  async sendStatusWebhook(sessionId, status, details = {}) {
    try {
      const webhookUrl = process.env.WEBHOOK_URL;

      if (!webhookUrl) {
        console.warn('WEBHOOK_URL not configured');
        return { success: false };
      }

      const payload = {
        event: 'session.status',
        sessionId,
        status,
        details,
        timestamp: new Date().toISOString(),
      };

      await axios.post(webhookUrl, payload, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
          'X-Webhook-Type': 'status',
        },
      });

      console.log(`✅ Status webhook sent for session ${sessionId}: ${status}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Error sending status webhook:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Adicionar à fila de retry
   */
  addToRetryQueue(messageData, retryCount = 0) {
    if (retryCount >= this.maxRetries) {
      console.error(`❌ Max retries reached for message from ${messageData.from}`);
      return;
    }

    this.retryQueue.push({
      messageData,
      retryCount,
      nextRetry: Date.now() + this.retryDelay * (retryCount + 1),
    });

    console.log(`⏳ Message added to retry queue (attempt ${retryCount + 1}/${this.maxRetries})`);
  }

  /**
   * Processar fila de retry
   */
  async processRetryQueue() {
    const now = Date.now();
    const itemsToRetry = this.retryQueue.filter(item => item.nextRetry <= now);

    for (const item of itemsToRetry) {
      try {
        const webhookUrl = process.env.WEBHOOK_URL;
        
        if (!webhookUrl) continue;

        const payload = {
          event: 'message.received',
          data: item.messageData,
          timestamp: new Date().toISOString(),
          retryAttempt: item.retryCount + 1,
        };

        await axios.post(webhookUrl, payload, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'X-Session-ID': item.messageData.sessionId,
            'X-Webhook-Type': 'message',
            'X-Retry-Attempt': item.retryCount + 1,
          },
        });

        // Remover da fila se bem-sucedido
        const index = this.retryQueue.indexOf(item);
        this.retryQueue.splice(index, 1);
        
        console.log(`✅ Webhook retry successful for message from ${item.messageData.from}`);
      } catch (error) {
        console.error(`⚠️ Webhook retry failed:`, error.message);
        
        // Retentar
        if (item.retryCount < this.maxRetries - 1) {
          item.retryCount++;
          item.nextRetry = Date.now() + this.retryDelay * (item.retryCount + 1);
        } else {
          const index = this.retryQueue.indexOf(item);
          this.retryQueue.splice(index, 1);
        }
      }
    }
  }

  /**
   * Obter status da fila de retry
   */
  getRetryQueueStatus() {
    return {
      queueSize: this.retryQueue.length,
      items: this.retryQueue.map(item => ({
        from: item.messageData.from,
        retryCount: item.retryCount,
        nextRetry: new Date(item.nextRetry),
      })),
    };
  }

  /**
   * Limpar fila de retry
   */
  clearRetryQueue() {
    const size = this.retryQueue.length;
    this.retryQueue = [];
    console.log(`🧹 Retry queue cleared (${size} items removed)`);
    return { cleared: size };
  }
}

module.exports = new WebhookService();
