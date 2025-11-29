const mongoose = require('mongoose');
const Responder = require('../src/models/Responder');
require('dotenv').config();

const responders = [
  {
    name: 'Dr. Rajesh Kumar',
    whatsappNumber: '+919876543210',
    email: 'rajesh.kumar@wildlifengo.org',
    organization: 'Wildlife Protection NGO',
    categoriesHandled: ['injured_animal', 'animal_sighting'],
    location: {
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      },
      address: 'Bengaluru Urban, Karnataka',
      serviceRadius: 25
    },
    status: 'online',
    currentCases: [],
    maxConcurrentCases: 3,
    contactInfo: {
      phone: '+919876543210',
      emergencyContact: '+919876543299'
    },
    isActive: true,
    lastSeen: new Date()
  },
  {
    name: 'Priya Sharma',
    whatsappNumber: '+919876543211',
    email: 'priya.sharma@forestdept.gov.in',
    organization: 'Karnataka Forest Department',
    categoriesHandled: ['human_wildlife_conflict', 'predator_sighting'],
    location: {
      coordinates: {
        latitude: 12.2958,
        longitude: 76.6394
      },
      address: 'Mysuru, Karnataka',
      serviceRadius: 30
    },
    status: 'online',
    currentCases: [],
    maxConcurrentCases: 5,
    contactInfo: {
      phone: '+919876543211',
      emergencyContact: '+919876543298'
    },
    isActive: true,
    lastSeen: new Date(Date.now() - 3600000)
  },
  {
    name: 'Arun Patel',
    whatsappNumber: '+919876543212',
    email: 'arun.patel@animalrescue.org',
    organization: 'Animal Rescue Team',
    categoriesHandled: ['injured_animal', 'abandoned_pet'],
    location: {
      coordinates: {
        latitude: 15.3647,
        longitude: 75.1240
      },
      address: 'Hubballi-Dharwad, Karnataka',
      serviceRadius: 20
    },
    status: 'busy',
    currentCases: [],
    maxConcurrentCases: 3,
    contactInfo: {
      phone: '+919876543212',
      emergencyContact: '+919876543297'
    },
    isActive: true,
    lastSeen: new Date(Date.now() - 1800000)
  },
  {
    name: 'Meera Reddy',
    whatsappNumber: '+919876543213',
    email: 'meera.reddy@wildlifecare.org',
    organization: 'Wildlife Care Foundation',
    categoriesHandled: ['animal_sighting', 'injured_animal'],
    location: {
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      },
      address: 'Bengaluru Urban, Karnataka',
      serviceRadius: 25
    },
    status: 'online',
    currentCases: [],
    maxConcurrentCases: 4,
    contactInfo: {
      phone: '+919876543213',
      emergencyContact: '+919876543296'
    },
    isActive: true,
    lastSeen: new Date()
  },
  {
    name: 'Vikram Singh',
    whatsappNumber: '+919876543214',
    email: 'vikram.singh@forestdept.gov.in',
    organization: 'Karnataka Forest Department',
    categoriesHandled: ['predator_sighting', 'human_wildlife_conflict'],
    location: {
      coordinates: {
        latitude: 12.2958,
        longitude: 76.6394
      },
      address: 'Mysuru, Karnataka',
      serviceRadius: 35
    },
    status: 'online',
    currentCases: [],
    maxConcurrentCases: 5,
    contactInfo: {
      phone: '+919876543214',
      emergencyContact: '+919876543295'
    },
    isActive: true,
    lastSeen: new Date(Date.now() - 7200000)
  },
  {
    name: 'Anjali Desai',
    whatsappNumber: '+919876543215',
    email: 'anjali.desai@animalaid.org',
    organization: 'Animal Aid Society',
    categoriesHandled: ['abandoned_pet', 'injured_animal'],
    location: {
      coordinates: {
        latitude: 15.3647,
        longitude: 75.1240
      },
      address: 'Hubballi-Dharwad, Karnataka',
      serviceRadius: 20
    },
    status: 'online',
    currentCases: [],
    maxConcurrentCases: 3,
    contactInfo: {
      phone: '+919876543215',
      emergencyContact: '+919876543294'
    },
    isActive: true,
    lastSeen: new Date(Date.now() - 900000)
  }
];

async function seedResponders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check if responders already exist
    const existingCount = await Responder.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing responders. Clearing...`);
      await Responder.deleteMany({});
    }

    console.log('Seeding responders...\n');
    
    for (const responderData of responders) {
      const responder = new Responder(responderData);
      await responder.save();
      console.log(`✓ Created: ${responderData.name} (${responderData.organization})`);
    }

    console.log(`\n✅ Successfully seeded ${responders.length} responders!`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding responders:', error.message);
    process.exit(1);
  }
}

seedResponders();
