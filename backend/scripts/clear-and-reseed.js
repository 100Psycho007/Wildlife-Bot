const mongoose = require('mongoose');
const Report = require('../src/models/Report');
const User = require('../src/models/User');
const Responder = require('../src/models/Responder');
require('dotenv').config();

async function clearAndReseed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Delete all demo data
    console.log('Clearing demo data...');
    await Report.deleteMany({ caseId: { $regex: /^WR-DEMO/ } });
    await User.deleteMany({ email: { $regex: /@wildlife-demo\.local$/ } });
    await User.deleteMany({ whatsappNumber: { $regex: /^\+9198123400/ } });
    await Responder.deleteMany({ whatsappNumber: { $regex: /^\+9198765430/ } });
    await Responder.deleteMany({ whatsappNumber: '+919800000000' });
    
    console.log('✓ Demo data cleared\n');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    console.log('\nNow run: npm run seed:demo');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

clearAndReseed();
