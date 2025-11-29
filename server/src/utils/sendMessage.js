// src/utils/sendMessage.js
const twilio = require("twilio");

// Load from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = "whatsapp:+14155238886"; // Your Twilio WhatsApp number

const client = twilio(accountSid, authToken);

/**
 * Send a WhatsApp message
 * @param {string} to - WhatsApp number with country code, e.g., '916361051286'
 * @param {string} message - Message text
 */
async function sendMessage(to, message) {
  try {
    const toWhatsApp = to.startsWith("whatsapp:") ? to : `whatsapp:+${to.replace(/\D/g, "")}`;
    
    const msg = await client.messages.create({
      body: message,
      from: fromWhatsApp,
      to: toWhatsApp
    });

    console.log(`📩 Message sent to ${to}: ${msg.sid}`);
    return msg;
  } catch (err) {
    console.error("❌ Error sending WhatsApp message:", err);
    throw err; // Let the caller handle it
  }
}

module.exports = sendMessage;
