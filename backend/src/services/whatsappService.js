const twilio = require('twilio');
const logger = require('../utils/logger');

class WhatsAppService {
  constructor() {
    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  }

  async sendMessage(to, message, mediaUrl = null) {
    try {
      const messageOptions = {
        from: this.fromNumber,
        to: `whatsapp:${to}`,
        body: message
      };

      if (mediaUrl) {
        messageOptions.mediaUrl = [mediaUrl];
      }

      const result = await this.client.messages.create(messageOptions);
      logger.info(`Message sent to ${to}`, { messageId: result.sid });
      return result;
    } catch (error) {
      logger.error(`Failed to send message to ${to}`, { error: error.message });
      throw error;
    }
  }

  async sendWelcomeMessage(to) {
    const message = `Hi! 🌿 Welcome to Wildlife Reporter Bot.

What kind of wildlife issue are you reporting?

1️⃣ Animal Sighting
2️⃣ Injured Animal 🚨
3️⃣ Abandoned Pet
4️⃣ Human-Wildlife Conflict 🚨
5️⃣ Other

Please reply with the number (1-5) of your choice.`;

    return this.sendMessage(to, message);
  }

  async sendLocationRequest(to) {
    const message = `📍 Please share the location of the incident.

You can:
• Send your current location (tap 📎 → Location)
• Share a map pin of the incident location
• Or describe the location in text

This helps our responders find you quickly!`;

    return this.sendMessage(to, message);
  }

  async sendMediaRequest(to) {
    const message = `📸 Do you have any photos or videos of the incident?

You can:
• Send photos/videos (optional but helpful)
• Type "skip" to continue without media
• Type "done" when finished uploading

Clear photos help our responders assess the situation better.`;

    return this.sendMessage(to, message);
  }

  async sendDescriptionRequest(to) {
    const message = `📝 Please provide additional details about the incident:

• What exactly did you observe?
• When did this happen?
• Any immediate dangers or concerns?
• Animal behavior or condition?

The more details you provide, the better we can help!`;

    return this.sendMessage(to, message);
  }

  async sendCaseConfirmation(to, caseId) {
    const message = `✅ Your report has been submitted successfully!

🆔 Case ID: ${caseId}

Your case is now being reviewed by our wildlife response team. You'll receive updates as responders are assigned.

Save this case ID to check status anytime by sending: STATUS ${caseId}

Thank you for helping protect wildlife! 🐾`;

    return this.sendMessage(to, message);
  }

  async sendCaseAccepted(to, caseId, responderName, responderContact) {
    const message = `🎯 Great news! Your case has been accepted.

🆔 Case ID: ${caseId}
👤 Responder: ${responderName}
📞 Contact: ${responderContact}

Your assigned responder will coordinate the response. You can contact them directly if needed.

Thank you for your patience! 🌿`;

    return this.sendMessage(to, message);
  }

  async sendCaseResolved(to, caseId) {
    const message = `✅ Your wildlife report has been resolved!

🆔 Case ID: ${caseId}

Thank you for reporting this incident and helping protect our wildlife. Your contribution makes a difference! 🐾

Feel free to report any new incidents anytime.`;

    return this.sendMessage(to, message);
  }

  async sendCaseTimeout(to, caseId) {
    const message = `⏰ Update on your wildlife report

🆔 Case ID: ${caseId}

We're still working to assign a responder to your case. Due to high demand, there may be delays, but your report remains active in our system.

We'll notify you as soon as a responder is available. Thank you for your patience! 🙏`;

    return this.sendMessage(to, message);
  }

  async sendResponderNotification(to, report) {
    const priorityEmoji = report.priority === 'critical' ? '🚨' : report.priority === 'high' ? '⚠️' : '📋';
    
    const message = `${priorityEmoji} New Wildlife Case Assignment

🆔 Case: ${report.caseId}
📂 Type: ${this.formatCategory(report.category)}
🔥 Priority: ${report.priority.toUpperCase()}
📍 Location: ${report.location.description || 'Coordinates provided'}
📝 Details: ${report.description.substring(0, 200)}${report.description.length > 200 ? '...' : ''}

Reply "ACCEPT ${report.caseId}" to take this case
Reply "DETAILS ${report.caseId}" for full information

⏱️ First responder to accept gets the case!`;

    return this.sendMessage(to, message);
  }

  formatCategory(category) {
    const categories = {
      'animal_sighting': 'Animal Sighting',
      'injured_animal': 'Injured Animal',
      'abandoned_pet': 'Abandoned Pet',
      'human_wildlife_conflict': 'Human-Wildlife Conflict',
      'other': 'Other'
    };
    return categories[category] || category;
  }

  async sendVolunteerRequest(to, report, distance) {
    const message = `🆘 Volunteer Help Needed

A high-priority wildlife incident needs assistance near you!

🆔 Case: ${report.caseId}
📂 Type: ${this.formatCategory(report.category)}
📍 Distance: ~${Math.round(distance)}km from you
📝 Details: ${report.description.substring(0, 150)}${report.description.length > 150 ? '...' : ''}

Can you help? Reply:
"VOLUNTEER ${report.caseId}" - I can help
"UNABLE ${report.caseId}" - Cannot assist

Your local knowledge could make a difference! 🌿`;

    return this.sendMessage(to, message);
  }

  extractPhoneNumber(whatsappId) {
    // Remove 'whatsapp:' prefix if present
    return whatsappId.replace('whatsapp:', '');
  }
}

module.exports = new WhatsAppService();