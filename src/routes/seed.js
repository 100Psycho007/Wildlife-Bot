const express = require('express');
const Report = require('../models/Report');
const User = require('../models/User');
const Responder = require('../models/Responder');
const { encryptField, maskPhoneNumber } = require('../utils/encryption');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Seed demo voice cases (idempotent)
 */
router.post('/demo-voice-cases', async (req, res) => {
  try {
    // Check if demo data already exists
    const existingDemo = await Report.findOne({ caseId: 'WR-DEMO-VOICE-EN-001' });
    if (existingDemo) {
      return res.json({ 
        message: 'Demo data already exists',
        skipped: true 
      });
    }

    // Create demo admin user
    let adminUser = await User.findOne({ email: 'admin@wildlife-demo.local' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Demo Admin',
        email: 'admin@wildlife-demo.local',
        password: 'demo123',
        role: 'ADMIN',
        whatsappNumber: '+1234567890',
        isActive: true
      });
    }

    // Create demo responder user
    let responderUser = await User.findOne({ email: 'responder@wildlife-demo.local' });
    if (!responderUser) {
      responderUser = await User.create({
        name: 'Demo Responder',
        email: 'responder@wildlife-demo.local',
        password: 'demo123',
        role: 'RESPONDER',
        whatsappNumber: '+1234567891',
        isActive: true
      });
    }

    // Create demo responder profile
    let responder = await Responder.findOne({ whatsappNumber: '+1234567891' });
    if (!responder) {
      responder = await Responder.create({
        name: 'Demo Responder',
        whatsappNumber: '+1234567891',
        email: 'responder@wildlife-demo.local',
        organization: 'Wildlife Rescue Demo',
        categoriesHandled: ['injured_animal', 'animal_sighting', 'abandoned_pet'],
        location: {
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          address: 'New York, NY',
          serviceRadius: 25
        },
        status: 'online',
        isActive: true
      });
    }

    // Create demo reporter user
    let reporterUser = await User.findOne({ whatsappNumber: '+1555123456' });
    if (!reporterUser) {
      reporterUser = await User.create({
        name: 'Demo Reporter',
        whatsappNumber: '+1555123456',
        isActive: true
      });
    }

    const demoPhone = '+1555123456';
    const encryptedPhone = encryptField(demoPhone);
    const maskedPhone = maskPhoneNumber(demoPhone);

    // Demo case 1: WhatsApp case
    const whatsappCase = await Report.create({
      caseId: 'WR-DEMO-WA-001',
      reporterId: reporterUser._id,
      source: 'whatsapp',
      language: 'en',
      phoneMasked: maskedPhone,
      phoneEncrypted: encryptedPhone,
      category: 'injured_animal',
      location: {
        coordinates: { latitude: 40.7580, longitude: -73.9855 },
        address: 'Times Square, New York, NY',
        description: 'Near the red stairs',
        district: 'Manhattan',
        latEncrypted: encryptField('40.7580'),
        lngEncrypted: encryptField('-73.9855')
      },
      description: 'Injured pigeon with damaged wing, unable to fly. Bird appears to be in distress.',
      status: 'pending',
      priority: 'medium',
      mediaUrls: [],
      timeline: [{
        action: 'created',
        timestamp: new Date(),
        performedBy: 'Demo Reporter',
        details: 'Case created via WhatsApp'
      }]
    });

    // Demo case 2: Voice case (English)
    const voiceCaseEn = await Report.create({
      caseId: 'WR-DEMO-VOICE-EN-001',
      reporterId: reporterUser._id,
      source: 'voice',
      language: 'en',
      phoneMasked: maskedPhone,
      phoneEncrypted: encryptedPhone,
      category: 'injured_animal',
      location: {
        coordinates: { latitude: 40.7489, longitude: -73.9680 },
        address: 'Central Park, New York, NY',
        description: 'Near Bethesda Fountain',
        district: 'Manhattan',
        latEncrypted: encryptField('40.7489'),
        lngEncrypted: encryptField('-73.9680')
      },
      description: 'Injured hawk with broken wing spotted near Bethesda Fountain in Central Park',
      transcript: {
        partial: 'There is an injured hawk...',
        final: 'There is an injured hawk near Bethesda Fountain in Central Park. It has a broken wing and cannot fly. The bird seems to be in pain.',
        segments: [
          { text: 'There is an injured hawk', timestamp: 0, confidence: 0.95 },
          { text: 'near Bethesda Fountain in Central Park', timestamp: 2000, confidence: 0.92 },
          { text: 'It has a broken wing and cannot fly', timestamp: 5000, confidence: 0.94 },
          { text: 'The bird seems to be in pain', timestamp: 8000, confidence: 0.91 }
        ],
        audioClipUrl: '/static/demo-audio/demo-voice-en-001.mp3'
      },
      status: 'pending',
      priority: 'high',
      mediaUrls: [],
      timeline: [{
        action: 'created',
        timestamp: new Date(),
        performedBy: 'Demo Reporter',
        details: 'Case created via voice call'
      }]
    });

    // Demo case 3: Voice case (Hindi)
    const voiceCaseHi = await Report.create({
      caseId: 'WR-DEMO-VOICE-HI-001',
      reporterId: reporterUser._id,
      source: 'voice',
      language: 'hi',
      phoneMasked: maskedPhone,
      phoneEncrypted: encryptedPhone,
      category: 'human_wildlife_conflict',
      location: {
        coordinates: { latitude: 40.7614, longitude: -73.9776 },
        address: 'Upper West Side, New York, NY',
        description: 'Residential area near park',
        district: 'Manhattan',
        latEncrypted: encryptField('40.7614'),
        lngEncrypted: encryptField('-73.9776')
      },
      description: 'Leopard spotted in residential area causing panic among residents',
      transcript: {
        partial: 'एक तेंदुआ...',
        final: 'एक तेंदुआ रिहायशी इलाके में देखा गया है। लोग बहुत डरे हुए हैं। कृपया जल्दी आएं।',
        segments: [
          { text: 'एक तेंदुआ रिहायशी इलाके में देखा गया है', timestamp: 0, confidence: 0.89 },
          { text: 'लोग बहुत डरे हुए हैं', timestamp: 3000, confidence: 0.92 },
          { text: 'कृपया जल्दी आएं', timestamp: 5500, confidence: 0.94 }
        ],
        audioClipUrl: '/static/demo-audio/demo-voice-hi-001.mp3'
      },
      status: 'pending',
      priority: 'critical',
      mediaUrls: [],
      timeline: [{
        action: 'created',
        timestamp: new Date(),
        performedBy: 'Demo Reporter',
        details: 'Case created via voice call (Hindi)'
      }]
    });

    logger.info('Demo data seeded successfully', {
      cases: [whatsappCase.caseId, voiceCaseEn.caseId, voiceCaseHi.caseId],
      users: [adminUser.email, responderUser.email]
    });

    res.json({
      message: 'Demo data seeded successfully',
      cases: [
        { caseId: whatsappCase.caseId, source: 'whatsapp' },
        { caseId: voiceCaseEn.caseId, source: 'voice', language: 'en' },
        { caseId: voiceCaseHi.caseId, source: 'voice', language: 'hi' }
      ],
      users: {
        admin: { email: 'admin@wildlife-demo.local', password: 'demo123' },
        responder: { email: 'responder@wildlife-demo.local', password: 'demo123' }
      },
      audioFiles: [
        '/static/demo-audio/demo-voice-en-001.mp3',
        '/static/demo-audio/demo-voice-hi-001.mp3'
      ]
    });
  } catch (error) {
    logger.error('Failed to seed demo data', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to seed demo data', details: error.message });
  }
});

module.exports = router;
