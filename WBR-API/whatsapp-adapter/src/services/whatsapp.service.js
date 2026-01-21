const sessionManager = require('../session/session.manager');

class WhatsAppService {
  async sendMessage(sessionId, phoneNumber, message) {
    try {
      const session = sessionManager.getSession(sessionId);
      if (!session) throw new Error(`Session ${sessionId} not found`);

      const client = session.client;
      if (!client.info) throw new Error(`Client not ready for session ${sessionId}`);

      // Format phone number (add @c.us for WhatsApp Web.js)
      const chatId = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;

      const response = await client.sendMessage(chatId, message);
      
      return {
        success: true,
        messageId: response.id.id,
        timestamp: response.timestamp,
      };
    } catch (error) {
      console.error(`Error sending message:`, error);
      throw error;
    }
  }

  async sendMedia(sessionId, phoneNumber, mediaPath, caption = '') {
    try {
      const session = sessionManager.getSession(sessionId);
      if (!session) throw new Error(`Session ${sessionId} not found`);

      const client = session.client;
      const chatId = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;

      const { MessageMedia } = require('whatsapp-web.js');
      const media = MessageMedia.fromFilePath(mediaPath);

      const response = await client.sendMessage(chatId, media, { caption });

      return {
        success: true,
        messageId: response.id.id,
      };
    } catch (error) {
      console.error(`Error sending media:`, error);
      throw error;
    }
  }

  async getContactInfo(sessionId, phoneNumber) {
    try {
      const session = sessionManager.getSession(sessionId);
      if (!session) throw new Error(`Session ${sessionId} not found`);

      const client = session.client;
      const chatId = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`;

      const contact = await client.getContactById(chatId);

      return {
        success: true,
        name: contact.name || contact.pushname,
        number: contact.number,
        isBusiness: contact.isBusiness,
      };
    } catch (error) {
      console.error(`Error getting contact info:`, error);
      throw error;
    }
  }

  async getSessionStatus(sessionId) {
    try {
      const session = sessionManager.getSession(sessionId);
      if (!session) throw new Error(`Session ${sessionId} not found`);

      return {
        sessionId,
        status: session.status,
        authenticated: !!session.client.info,
      };
    } catch (error) {
      console.error(`Error getting session status:`, error);
      throw error;
    }
  }
}

module.exports = new WhatsAppService();
