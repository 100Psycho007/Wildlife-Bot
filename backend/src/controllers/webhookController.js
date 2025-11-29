const User = require('../models/User');
const Report = require('../models/Report');
const whatsappService = require('../services/whatsappService');
const logger = require('../utils/logger');

class WebhookController {
  async handleIncomingMessage(req, res) {
    try {
      const { Body, From, MediaUrl0, MediaContentType0, MessageSid } = req.body;
      const phoneNumber = whatsappService.extractPhoneNumber(From);
      
      logger.info('Incoming WhatsApp message', {
        from: phoneNumber,
        body: Body,
        hasMedia: !!MediaUrl0,
        messageId: MessageSid
      });

      // Find or create user
      let user = await User.findOne({ whatsappNumber: phoneNumber });
      if (!user) {
        user = new User({ whatsappNumber: phoneNumber });
        await user.save();
        logger.info('New user created', { phoneNumber });
      }

      // Handle different message types
      await this.processMessage(user, Body, MediaUrl0, MediaContentType0);

      res.status(200).send('OK');
    } catch (error) {
      logger.error('Error handling incoming message', { error: error.message });
      res.status(500).send('Error processing message');
    }
  }

  async processMessage(user, messageBody, mediaUrl, mediaType) {
    const message = (messageBody || '').trim().toLowerCase();

    // Handle status queries
    if (message.startsWith('status ')) {
      return this.handleStatusQuery(user, message);
    }

    // Handle responder commands
    if (message.startsWith('accept ') || message.startsWith('resolve ') || message.startsWith('details ')) {
      return this.handleResponderCommand(user, message);
    }

    // Handle conversation flow based on user state
    switch (user.conversationState) {
      case 'idle':
        return this.handleInitialMessage(user, message);
      
      case 'selecting_category':
        return this.handleCategorySelection(user, message);
      
      case 'providing_location':
        return this.handleLocationInput(user, messageBody);
      
      case 'uploading_media':
        return this.handleMediaInput(user, message, mediaUrl, mediaType);
      
      case 'providing_description':
        return this.handleDescriptionInput(user, messageBody);
      
      default:
        return this.handleInitialMessage(user, message);
    }
  }

  async handleInitialMessage(user, message) {
    // Reset conversation and start fresh
    await user.resetConversation();
    
    // Send welcome message
    await whatsappService.sendWelcomeMessage(user.whatsappNumber);
    
    // Update user state
    user.conversationState = 'selecting_category';
    await user.save();
  }

  async handleCategorySelection(user, message) {
    const categoryMap = {
      '1': 'animal_sighting',
      '2': 'injured_animal',
      '3': 'abandoned_pet',
      '4': 'human_wildlife_conflict',
      '5': 'other'
    };

    const selectedCategory = categoryMap[message];
    
    if (!selectedCategory) {
      await whatsappService.sendMessage(
        user.whatsappNumber,
        'Please select a valid option (1-5). Reply with the number of your choice.'
      );
      return;
    }

    // Create new report
    const report = new Report({
      reporterId: user._id,
      category: selectedCategory,
      description: '', // Will be filled later
      status: 'pending'
    });

    await report.save();
    
    // Update user state
    user.currentReport = report._id;
    user.conversationState = 'providing_location';
    await user.save();

    // Request location
    await whatsappService.sendLocationRequest(user.whatsappNumber);
  }

  async handleLocationInput(user, messageBody) {
    if (!user.currentReport) {
      return this.handleInitialMessage(user, '');
    }

    const report = await Report.findById(user.currentReport);
    if (!report) {
      return this.handleInitialMessage(user, '');
    }

    // Update report with location information
    report.location = {
      description: messageBody,
      // In a real implementation, you would parse coordinates from location messages
      coordinates: {
        latitude: null,
        longitude: null
      }
    };
    await report.save();

    // Move to media upload
    user.conversationState = 'uploading_media';
    await user.save();

    await whatsappService.sendMediaRequest(user.whatsappNumber);
  }

  async handleMediaInput(user, message, mediaUrl, mediaType) {
    if (!user.currentReport) {
      return this.handleInitialMessage(user, '');
    }

    const report = await Report.findById(user.currentReport);
    if (!report) {
      return this.handleInitialMessage(user, '');
    }

    if (message === 'skip' || message === 'done') {
      // Move to description
      user.conversationState = 'providing_description';
      await user.save();
      return whatsappService.sendDescriptionRequest(user.whatsappNumber);
    }

    if (mediaUrl && mediaType) {
      // Store Twilio media URL directly without uploading elsewhere
      const derivedType = mediaType.startsWith('image') ? 'image' : mediaType.startsWith('video') ? 'video' : mediaType.startsWith('audio') ? 'audio' : 'image';
      report.mediaUrls.push({ url: mediaUrl, mediaType: derivedType });
      await report.save();

      await whatsappService.sendMessage(
        user.whatsappNumber,
        '📸 Media received! Send more media or type "done" to continue.'
      );
    } else {
      await whatsappService.sendMessage(
        user.whatsappNumber,
        'Please send a photo/video, or type "skip" to continue without media, or "done" if finished uploading.'
      );
    }
  }

  async handleDescriptionInput(user, messageBody) {
    if (!user.currentReport) {
      return this.handleInitialMessage(user, '');
    }

    const report = await Report.findById(user.currentReport);
    if (!report) {
      return this.handleInitialMessage(user, '');
    }

    // Update report with description and finalize minimal flow
    report.description = messageBody;
    await report.save();

    // Reset user conversation state
    await user.resetConversation();

    // Send confirmation with generated case ID
    await whatsappService.sendCaseConfirmation(user.whatsappNumber, report.caseId);
  }

  async handleStatusQuery(user, message) {
    const caseId = message.replace('status ', '').trim().toUpperCase();
    
    try {
      const report = await Report.findOne({ caseId }).populate('assignedResponder');
      
      if (!report) {
        return whatsappService.sendMessage(
          user.whatsappNumber,
          `❌ Case ${caseId} not found. Please check the case ID and try again.`
        );
      }

      let statusMessage = `📋 Case Status: ${caseId}\n\n`;
      statusMessage += `📂 Type: ${whatsappService.formatCategory(report.category)}\n`;
      statusMessage += `🔥 Priority: ${report.priority.toUpperCase()}\n`;
      statusMessage += `📊 Status: ${report.status.toUpperCase()}\n`;
      statusMessage += `📅 Reported: ${report.createdAt.toLocaleDateString()}\n`;

      if (report.assignedResponder) {
        statusMessage += `👤 Assigned to: ${report.assignedResponder.name}\n`;
        statusMessage += `🏢 Organization: ${report.assignedResponder.organization || 'N/A'}\n`;
      }

      if (report.timeline.length > 0) {
        statusMessage += `\n📈 Latest Update: ${report.timeline[report.timeline.length - 1].action} (${report.timeline[report.timeline.length - 1].timestamp.toLocaleDateString()})`;
      }

      await whatsappService.sendMessage(user.whatsappNumber, statusMessage);
    } catch (error) {
      logger.error('Failed to handle status query', { error: error.message });
      await whatsappService.sendMessage(
        user.whatsappNumber,
        '❌ Error retrieving case status. Please try again later.'
      );
    }
  }

  async handleResponderCommand(user, message) {
    try {
      const parts = message.split(' ');
      const command = parts[0];
      const caseId = parts[1];

      if (!caseId) {
        return whatsappService.sendMessage(
          user.whatsappNumber,
          '❌ Please provide a case ID. Example: ACCEPT WR-123456'
        );
      }

      switch (command) {
        case 'accept':
          await routingService.acceptCase(caseId.toUpperCase(), user.whatsappNumber);
          await whatsappService.sendMessage(
            user.whatsappNumber,
            `✅ Case ${caseId.toUpperCase()} accepted successfully! You are now assigned to this case.`
          );
          break;

        case 'resolve':
          const resolution = parts.slice(2).join(' ') || 'Case resolved';
          await routingService.resolveCase(caseId.toUpperCase(), user.whatsappNumber, resolution);
          await whatsappService.sendMessage(
            user.whatsappNumber,
            `✅ Case ${caseId.toUpperCase()} marked as resolved. Thank you for your service!`
          );
          break;

        case 'details':
          const report = await Report.findOne({ caseId: caseId.toUpperCase() })
            .populate('reporterId');
          
          if (!report) {
            return whatsappService.sendMessage(
              user.whatsappNumber,
              `❌ Case ${caseId.toUpperCase()} not found.`
            );
          }

          let detailsMessage = `📋 Case Details: ${report.caseId}\n\n`;
          detailsMessage += `📂 Category: ${whatsappService.formatCategory(report.category)}\n`;
          detailsMessage += `🔥 Priority: ${report.priority.toUpperCase()}\n`;
          detailsMessage += `📍 Location: ${report.location.description || 'Not provided'}\n`;
          detailsMessage += `📝 Description: ${report.description}\n`;
          detailsMessage += `📅 Reported: ${report.createdAt.toLocaleString()}\n`;
          
          if (report.aiClassification && report.aiClassification.extractedSpecies.length > 0) {
            detailsMessage += `🐾 Species: ${report.aiClassification.extractedSpecies.join(', ')}\n`;
          }
          
          if (report.mediaUrls.length > 0) {
            detailsMessage += `📸 Media files: ${report.mediaUrls.length} attached\n`;
          }

          await whatsappService.sendMessage(user.whatsappNumber, detailsMessage);
          break;

        default:
          await whatsappService.sendMessage(
            user.whatsappNumber,
            '❌ Unknown command. Available commands: ACCEPT, RESOLVE, DETAILS'
          );
      }
    } catch (error) {
      logger.error('Failed to handle responder command', { error: error.message });
      await whatsappService.sendMessage(
        user.whatsappNumber,
        `❌ Error processing command: ${error.message}`
      );
    }
  }
}

module.exports = new WebhookController();