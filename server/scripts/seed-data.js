require('dotenv').config();
const mongoose = require('mongoose');
const Responder = require('../src/models/Responder');
const Report = require('../src/models/Report');
const User = require('../src/models/User');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife_reports');
    
    console.log('🗑️  Clearing existing data...');
    await Responder.deleteMany({});
    await Report.deleteMany({});
    await User.deleteMany({});
    
    // Create responders with Indian locations
    const responders = [
      {
        name: 'Dr. Priya Sharma',
        whatsappNumber: '+919876543210',
        email: 'priya.sharma@wildlife.in',
        organization: 'Karnataka Wildlife Rescue',
        categoriesHandled: ['injured_animal', 'abandoned_pet'],
        location: {
          coordinates: {
            latitude: 12.9716,
            longitude: 77.5946
          },
          address: 'Bengaluru Urban, Karnataka',
          serviceRadius: 25
        },
        status: 'online',
        contactInfo: {
          phone: '+919876543210',
          emergencyContact: '+919876543211'
        },
        maxConcurrentCases: 3
      },
      {
        name: 'Rajesh Kumar',
        whatsappNumber: '+919876543212',
        email: 'rajesh.kumar@forestdept.in',
        organization: 'Karnataka Forest Department',
        categoriesHandled: ['human_wildlife_conflict', 'animal_sighting', 'predator_sighting'],
        location: {
          coordinates: {
            latitude: 12.2958,
            longitude: 76.6394
          },
          address: 'Mysuru, Karnataka',
          serviceRadius: 30
        },
        status: 'online',
        contactInfo: {
          phone: '+919876543212'
        },
        maxConcurrentCases: 5
      },
      {
        name: 'Dr. Anjali Desai',
        whatsappNumber: '+919876543213',
        email: 'anjali.desai@animalcare.in',
        organization: 'Animal Care Services',
        categoriesHandled: ['abandoned_pet', 'injured_animal', 'other'],
        location: {
          coordinates: {
            latitude: 15.3647,
            longitude: 75.1238
          },
          address: 'Hubballi-Dharwad, Karnataka',
          serviceRadius: 20
        },
        status: 'offline',
        contactInfo: {
          phone: '+919876543213',
          emergencyContact: '+919876543214'
        },
        maxConcurrentCases: 4
      }
    ];

    const createdResponders = await Responder.insertMany(responders);
    console.log(`✅ Created ${createdResponders.length} responders`);

    // Create users (including responder login accounts)
    const users = [
      {
        whatsappNumber: '+919876543220',
        name: 'Amit Patel',
        role: 'USER',
        conversationState: 'idle'
      },
      {
        whatsappNumber: '+919876543221',
        name: 'Sneha Reddy',
        role: 'USER',
        conversationState: 'idle'
      },
      {
        whatsappNumber: '+919876543222',
        name: 'Admin User',
        email: 'admin@wildlife.local',
        password: 'admin123',
        role: 'ADMIN',
        conversationState: 'idle'
      },
      // Responder login accounts
      {
        whatsappNumber: '+919876543210',
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@wildlife.in',
        password: 'responder123',
        role: 'RESPONDER',
        conversationState: 'idle'
      },
      {
        whatsappNumber: '+919876543212',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@forestdept.in',
        password: 'responder123',
        role: 'RESPONDER',
        conversationState: 'idle'
      },
      {
        whatsappNumber: '+919876543213',
        name: 'Dr. Anjali Desai',
        email: 'anjali.desai@animalcare.in',
        password: 'responder123',
        role: 'RESPONDER',
        conversationState: 'idle'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users (including ${users.filter(u => u.role === 'RESPONDER').length} responder accounts)`);

    // Create reports including voice case
    const reports = [
      {
        caseId: 'WR-VOICE-HI-001',
        reporterId: createdUsers[0]._id,
        source: 'voice',
        language: 'hi',
        category: 'injured_animal',
        location: {
          coordinates: {
            latitude: 12.9716,
            longitude: 77.5946
          },
          address: 'Cubbon Park, Bengaluru',
          district: 'Bengaluru Urban',
          description: 'Near the main entrance'
        },
        transcript: {
          partial: 'मुझे एक घायल हिरण दिखा है...',
          final: 'मुझे एक घायल हिरण दिखा है क्यूबन पार्क के मुख्य प्रवेश द्वार के पास। यह चल नहीं पा रहा है और इसके पैर में चोट लगी है।',
          segments: [
            {
              text: 'मुझे एक घायल हिरण दिखा है',
              timestamp: 0,
              confidence: 0.92
            },
            {
              text: 'क्यूबन पार्क के मुख्य प्रवेश द्वार के पास',
              timestamp: 3000,
              confidence: 0.88
            },
            {
              text: 'यह चल नहीं पा रहा है और इसके पैर में चोट लगी है',
              timestamp: 6000,
              confidence: 0.90
            }
          ],
          audioClipUrl: '/audio/voice-hi-001.mp3'
        },
        description: 'Injured deer spotted near Cubbon Park main entrance. Unable to walk, appears to have leg injury.',
        status: 'in_progress',
        priority: 'high',
        assignedResponder: createdResponders[0]._id,
        assignedOrganization: 'Karnataka Wildlife Rescue',
        aiClassification: {
          confidence: 0.89,
          extractedSpecies: ['deer'],
          urgencyKeywords: ['injured', 'unable to walk'],
          needsManualReview: false
        },
        timeline: [
          {
            action: 'created',
            timestamp: new Date(Date.now() - 3600000),
            performedBy: 'System',
            details: 'Voice report received in Hindi'
          },
          {
            action: 'assigned',
            timestamp: new Date(Date.now() - 3000000),
            performedBy: 'Dr. Priya Sharma',
            details: 'Case assigned to responder'
          }
        ]
      },
      {
        caseId: 'WR-TEXT-EN-002',
        reporterId: createdUsers[1]._id,
        source: 'whatsapp',
        language: 'en',
        category: 'animal_sighting',
        location: {
          coordinates: {
            latitude: 12.2958,
            longitude: 76.6394
          },
          address: 'Mysore Zoo Area',
          district: 'Mysuru',
          description: 'Near the zoo boundary'
        },
        description: 'Spotted a leopard near the zoo boundary wall. It seems to be looking for food.',
        status: 'pending',
        priority: 'critical',
        aiClassification: {
          confidence: 0.95,
          extractedSpecies: ['leopard'],
          urgencyKeywords: ['leopard', 'near residential'],
          needsManualReview: false
        },
        timeline: [
          {
            action: 'created',
            timestamp: new Date(Date.now() - 1800000),
            performedBy: 'System',
            details: 'WhatsApp report received'
          }
        ]
      },
      {
        caseId: 'WR-TEXT-EN-003',
        reporterId: createdUsers[0]._id,
        source: 'whatsapp',
        language: 'en',
        category: 'abandoned_pet',
        location: {
          coordinates: {
            latitude: 15.3647,
            longitude: 75.1238
          },
          address: 'Hubballi City Center',
          district: 'Hubballi-Dharwad',
          description: 'Near the bus stand'
        },
        description: 'Found a puppy abandoned near the bus stand. Looks malnourished.',
        status: 'resolved',
        priority: 'medium',
        assignedResponder: createdResponders[2]._id,
        assignedOrganization: 'Animal Care Services',
        aiClassification: {
          confidence: 0.87,
          extractedSpecies: ['dog'],
          urgencyKeywords: ['abandoned', 'malnourished'],
          needsManualReview: false
        },
        timeline: [
          {
            action: 'created',
            timestamp: new Date(Date.now() - 86400000),
            performedBy: 'System',
            details: 'WhatsApp report received'
          },
          {
            action: 'assigned',
            timestamp: new Date(Date.now() - 82800000),
            performedBy: 'Dr. Anjali Desai',
            details: 'Case assigned to responder'
          },
          {
            action: 'resolved',
            timestamp: new Date(Date.now() - 72000000),
            performedBy: 'Dr. Anjali Desai',
            details: 'Puppy rescued and taken to shelter'
          }
        ]
      }
    ];

    const createdReports = await Report.insertMany(reports);
    console.log(`✅ Created ${createdReports.length} reports (including voice case)`);

    console.log('\n📊 Seed Summary:');
    console.log(`   Responders: ${createdResponders.length}`);
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Reports: ${createdReports.length}`);
    console.log('\n✅ Database seeded successfully with Indian locations!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedData();
}

module.exports = { seedData };