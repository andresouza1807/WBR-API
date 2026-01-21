const axios = require('axios');
const config = require('../config/env');

class MessageHandler {
  async handle(sessionId, message) {
    try {
      console.log(`[${sessionId}] Message received from ${message.from}`);

      // Skip messages from status broadcasts
      if (message.from === 'status@broadcast') return;

      // Get message details
      const messageData = {
        sessionId,
        from: message.from,
        to: message.to,
        body: message.body,
        timestamp: new Date(message.timestamp * 1000),
        isGroupMsg: message.isGroupMsg,
        type: message.type,
        hasMedia: message.hasMedia,
        quotedMsgId: message.quotedMsgId,
      };

      // Get contact info
      try {
        const contact = await message.getContact();
        messageData.contactName = contact.pushname || contact.name;
      } catch (error) {
        console.error('Error getting contact info:', error);
      }

      // Handle media
      if (message.hasMedia) {
        try {
          const media = await message.downloadMedia();
          messageData.media = {
            mimetype: media.mimetype,
            data: media.data,
            filename: media.filename,
          };
        } catch (error) {
          console.error('Error downloading media:', error);
        }
      }

      // Send to webhook/API
      await this.sendToWebhook(messageData);

      return messageData;
    } catch (error) {
      console.error(`Error handling message in session ${sessionId}:`, error);
      throw error;
    }
  }

  async sendToWebhook(messageData) {
    try {
      // Configure webhook URL and implementation according to your API
      const webhookUrl = `${config.apiUrl}/webhook/messages`;

      await axios.post(webhookUrl, messageData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': messageData.sessionId,
        },
      });

      console.log('Message sent to webhook successfully');
    } catch (error) {
      console.error('Error sending message to webhook:', error.message);
      // Implement retry logic or queue system here if needed
    }
  }

  async handleGroupMessage(sessionId, message) {
    try {
      console.log(`[${sessionId}] Group message from ${message.from}`);

      const chat = await message.getChat();
      const contact = await message.getContact();

      return {
        sessionId,
        chatId: chat.id._serialized,
        chatName: chat.name,
        from: message.from,
        contactName: contact.pushname || contact.name,
        body: message.body,
        timestamp: new Date(message.timestamp * 1000),
      };
    } catch (error) {
      console.error(`Error handling group message:`, error);
      throw error;
    }
  }
}

module.exports = new MessageHandler();
