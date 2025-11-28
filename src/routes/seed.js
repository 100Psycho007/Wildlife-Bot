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
        name: 'System Administrator',
        email: 'admin@wildlife-demo.local',
        password: 'demo123',
        role: 'ADMIN',
        whatsappNumber: '+919800000000',
        isActive: true
      });
    }

    // Create demo responders
    let raviKumar = await Responder.findOne({ whatsappNumber: '+919876543001' });
    if (!raviKumar) {
      raviKumar = await Responder.create({
        name: 'Ravi Kumar',
        whatsappNumber: '+919876543001',
        email: 'ravi.kumar@rescue.in',
        organization: 'Gurugram Animal Rescue',
        categoriesHandled: ['injured_animal'],
        location: {
          coordinates: { latitude: 28.4595, longitude: 77.0266 },
          address: 'Gurugram, Haryana',
          serviceRadius: 30
        },
        status: 'online',
        isActive: true,
        lastSeen: new Date()
      });
    }

    let meenaPatel = await Responder.findOne({ whatsappNumber: '+919876543002' });
    if (!meenaPatel) {
      meenaPatel = await Responder.create({
        name: 'Dr. Meena Patel',
        whatsappNumber: '+919876543002',
        email: 'meena.patel@wildlife.in',
        organization: 'Mysore Wildlife Rescue',
        categoriesHandled: ['predator_sighting', 'injured_animal'],
        location: {
          coordinates: { latitude: 12.2958, longitude: 76.6394 },
          address: 'Mysuru, Karnataka',
          serviceRadius: 40
        },
        status: 'online',
        isActive: true,
        lastSeen: new Date()
      });
    }

    // Create demo reporter users
    let reporter1 = await User.findOne({ whatsappNumber: '+919812340001' });
    if (!reporter1) {
      reporter1 = await User.create({
        name: 'Citizen Reporter 1',
        whatsappNumber: '+919812340001',
        isActive: true
      });
    }

    let reporter2 = await User.findOne({ whatsappNumber: '+919812340002' });
    if (!reporter2) {
      reporter2 = await User.create({
        name: 'Citizen Reporter 2',
        whatsappNumber: '+919812340002',
        isActive: true
      });
    }

    let reporter3 = await User.findOne({ whatsappNumber: '+919812340003' });
    if (!reporter3) {
      reporter3 = await User.create({
        name: 'Citizen Reporter 3',
        whatsappNumber: '+919812340003',
        isActive: true
      });
    }

    // Demo case 1: WhatsApp case
    const phone1 = '+919812340001';
    const whatsappCase = await Report.create({
      caseId: 'WR-DEMO-WA-001',
      reporterId: reporter1._id,
      source: 'whatsapp',
      language: 'English',
      phoneMasked: maskPhoneNumber(phone1),
      phoneEncrypted: encryptField(phone1),
      category: 'injured_animal',
      location: {
        coordinates: { latitude: 12.9716, longitude: 77.5946 },
        address: 'MG Road, Bengaluru',
        description: 'Near Nandi statue',
        district: 'Bengaluru Urban',
        latEncrypted: encryptField('12.9716'),
        lngEncrypted: encryptField('77.5946')
      },
      description: 'Injured pigeon near MG Road; small wound on wing. Location: MG Road, near Nandi statue. Attached photo.',
      status: 'pending',
      priority: 'medium',
      aiClassification: {
        confidence: 0.87,
        extractedSpecies: ['pigeon'],
        urgencyKeywords: ['injured', 'wound'],
        needsManualReview: false
      },
      mediaUrls: [],
      timeline: [{
        action: 'created',
        timestamp: new Date('2025-11-27T10:00:00+05:30'),
        performedBy: 'Citizen Reporter 1',
        details: 'Case created via WhatsApp'
      }],
      createdAt: new Date('2025-11-27T10:00:00+05:30')
    });

    // Demo case 2: Voice case (English)
    const phone2 = '+919812340002';
    const voiceCaseEn = await Report.create({
      caseId: 'WR-DEMO-VOICE-EN-001',
      reporterId: reporter2._id,
      source: 'voice',
      language: 'English',
      phoneMasked: maskPhoneNumber(phone2),
      phoneEncrypted: encryptField(phone2),
      category: 'injured_animal',
      location: {
        coordinates: { latitude: 12.3051, longitude: 76.6553 },
        address: 'Old Market, Mysuru',
        description: 'Near the blue gate',
        district: 'Mysuru',
        latEncrypted: encryptField('12.3051'),
        lngEncrypted: encryptField('76.6553')
      },
      description: 'There is a dog on the main road near the petrol pump. It looks like it got hit by a bike. The dog is bleeding from its left hind leg and cannot stand. Location: Old Market, near the blue gate. Please send help.',
      transcript: {
        partial: 'There is a dog on the main road...',
        final: 'There is a dog on the main road near the petrol pump. It looks like it got hit by a bike. The dog is bleeding from its left hind leg and cannot stand. Location: Old Market, near the blue gate. Please send help.',
        segments: [
          { text: 'There is a dog on the main road near the petrol pump', timestamp: 0, confidence: 0.94 },
          { text: 'It looks like it got hit by a bike', timestamp: 3200, confidence: 0.91 },
          { text: 'The dog is bleeding from its left hind leg and cannot stand', timestamp: 5800, confidence: 0.93 },
          { text: 'Location: Old Market, near the blue gate', timestamp: 9100, confidence: 0.89 },
          { text: 'Please send help', timestamp: 11500, confidence: 0.96 }
        ],
        audioClipUrl: '/static/demo-audio/demo-voice-en-001.mp3'
      },
      status: 'pending',
      priority: 'high',
      aiClassification: {
        confidence: 0.92,
        extractedSpecies: ['dog'],
        urgencyKeywords: ['bleeding', 'hit', 'cannot stand'],
        needsManualReview: false
      },
      mediaUrls: [],
      timeline: [{
        action: 'created',
        timestamp: new Date('2025-11-28T09:12:30+05:30'),
        performedBy: 'Citizen Reporter 2',
        details: 'Case created via voice call'
      }],
      createdAt: new Date('2025-11-28T09:12:30+05:30')
    });

    // Demo case 3: Voice case (Hindi)
    const phone3 = '+919812340003';
    const voiceCaseHi = await Report.create({
      caseId: 'WR-DEMO-VOICE-HI-001',
      reporterId: reporter3._id,
      source: 'voice',
      language: 'Hindi',
      phoneMasked: maskPhoneNumber(phone3),
      phoneEncrypted: encryptField(phone3),
      category: 'predator_sighting',
      location: {
        coordinates: { latitude: 15.3647, longitude: 75.1240 },
        address: 'Laxmi Chowk, Hubballi',
        description: 'Behind Laxmi Chowk, near the fields',
        district: 'Hubballi-Dharwad',
        latEncrypted: encryptField('15.3647'),
        lngEncrypted: encryptField('75.1240')
      },
      description: 'Aaj subah ek bhediya road ke paas nazar aaya. Location: Laxmi Chowk ke piche wale khet ke paas. Bhediya shayad chot mein nahi dikh raha tha par bahut paas se guzra. Bachchon ko school se bol do ki raasta avoid karein. Kripya forest department ko inform karein.',
      transcript: {
        partial: 'Aaj subah ek bhediya...',
        final: 'Aaj subah ek bhediya road ke paas nazar aaya. Location: Laxmi Chowk ke piche wale khet ke paas. Bhediya shayad chot mein nahi dikh raha tha par bahut paas se guzra. Bachchon ko school se bol do ki raasta avoid karein. Kripya forest department ko inform karein.',
        segments: [
          { text: 'Aaj subah ek bhediya road ke paas nazar aaya', timestamp: 0, confidence: 0.88 },
          { text: 'Location: Laxmi Chowk ke piche wale khet ke paas', timestamp: 3500, confidence: 0.85 },
          { text: 'Bhediya shayad chot mein nahi dikh raha tha par bahut paas se guzra', timestamp: 7200, confidence: 0.82 },
          { text: 'Bachchon ko school se bol do ki raasta avoid karein', timestamp: 11800, confidence: 0.90 },
          { text: 'Kripya forest department ko inform karein', timestamp: 15200, confidence: 0.93 }
        ],
        audioClipUrl: '/static/demo-audio/demo-voice-hi-001.mp3'
      },
      status: 'pending',
      priority: 'high',
      aiClassification: {
        confidence: 0.79,
        extractedSpecies: ['wolf'],
        urgencyKeywords: ['bhediya', 'bachchon', 'school'],
        needsManualReview: true
      },
      mediaUrls: [],
      timeline: [{
        action: 'created',
        timestamp: new Date('2025-11-28T07:45:10+05:30'),
        performedBy: 'Citizen Reporter 3',
        details: 'Case created via voice call (Hindi)'
      }],
      createdAt: new Date('2025-11-28T07:45:10+05:30')
    });

    logger.info('Demo data seeded successfully', {
      cases: [whatsappCase.caseId, voiceCaseEn.caseId, voiceCaseHi.caseId],
      users: [adminUser.email],
      responders: [raviKumar.name, meenaPatel.name]
    });

    res.json({
      message: 'Demo data seeded successfully',
      cases: [
        { caseId: whatsappCase.caseId, source: 'whatsapp', language: 'English' },
        { caseId: voiceCaseEn.caseId, source: 'voice', language: 'English' },
        { caseId: voiceCaseHi.caseId, source: 'voice', language: 'Hindi' }
      ],
      users: {
        admin: { email: 'admin@wildlife-demo.local', password: 'demo123' }
      },
      responders: [
        { name: raviKumar.name, organization: raviKumar.organization, district: 'Gurugram' },
        { name: meenaPatel.name, organization: meenaPatel.organization, district: 'Mysuru' }
      ],
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
