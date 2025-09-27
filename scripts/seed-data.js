require('dotenv').config();
const mongoose = require('mongoose');
const Responder = require('../src/models/Responder');
const logger = require('../src/utils/logger');

async function seedResponders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife_reports');
    
    const sampleResponders = [
      {
        name: 'Dr. Sarah Johnson',
        whatsappNumber: '+1234567890',
        email: 'sarah.johnson@wildlife.org',
        organization: 'Wildlife Rescue Center',
        categoriesHandled: ['injured_animal', 'abandoned_pet'],
        location: {
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          },
          address: 'New York, NY',
          serviceRadius: 25
        },
        status: 'online',
        contactInfo: {
          phone: '+1234567890',
          emergencyContact: '+1234567891'
        },
        maxConcurrentCases: 3
      },
      {
        name: 'Mike Rodriguez',
        whatsappNumber: '+1234567892',
        email: 'mike.rodriguez@forestservice.gov',
        organization: 'Forest Service',
        categoriesHandled: ['human_wildlife_conflict', 'animal_sighting'],
        location: {
          coordinates: {
            latitude: 40.7589,
            longitude: -73.9851
          },
          address: 'Manhattan, NY',
          serviceRadius: 30
        },
        status: 'online',
        contactInfo: {
          phone: '+1234567892'
        },
        maxConcurrentCases: 5
      },
      {
        name: 'Dr. Emily Chen',
        whatsappNumber: '+1234567893',
        email: 'emily.chen@animalcontrol.org',
        organization: 'Animal Control Services',
        categoriesHandled: ['abandoned_pet', 'human_wildlife_conflict', 'other'],
        location: {
          coordinates: {
            latitude: 40.6782,
            longitude: -73.9442
          },
          address: 'Brooklyn, NY',
          serviceRadius: 20
        },
        status: 'offline',
        contactInfo: {
          phone: '+1234567893',
          emergencyContact: '+1234567894'
        },
        maxConcurrentCases: 4
      }
    ];

    // Clear existing responders
    await Responder.deleteMany({});
    
    // Insert sample responders
    const createdResponders = await Responder.insertMany(sampleResponders);
    
    console.log(`✅ Successfully created ${createdResponders.length} sample responders:`);
    createdResponders.forEach(responder => {
      console.log(`   - ${responder.name} (${responder.organization})`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedResponders();
}

module.exports = { seedResponders };