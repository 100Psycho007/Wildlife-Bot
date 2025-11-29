const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER; // whatsapp:+14155238886

async function sendWhatsAppMessage(to, message) {
  return client.messages.create({
    from: FROM_NUMBER,
    to: to,
    body: message
  });
}

module.exports = { sendWhatsAppMessage };
