const mongoose = require('mongoose');
const User = require('../src/models/User');
const Responder = require('../src/models/Responder');
require('dotenv').config();

async function createResponderUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife-bot');
    console.log('Connected to database\n');

    // Get all responders
    const responders = await Responder.find({ isActive: true });
    console.log(`Found ${responders.length} responders\n`);

    for (const responder of responders) {
      // Check if user exists
      let user = await User.findOne({ whatsappNumber: responder.whatsappNumber });
      
      if (!user) {
        console.log(`Creating user for: ${responder.name}`);
        user = new User({
          name: responder.name,
          email: responder.email,
          password: 'demo123',
          role: 'RESPONDER',
          whatsappNumber: responder.whatsappNumber,
          isActive: true
        });
        user.markModified('password');
        await user.save();
        console.log(`✓ Created user: ${responder.email} / demo123`);
      } else {
        console.log(`Updating password for: ${responder.name}`);
        user.password = 'demo123';
        user.role = 'RESPONDER';
        user.markModified('password');
        await user.save();
        console.log(`✓ Updated user: ${responder.email} / demo123`);
      }
      
      // Verify
      const reloaded = await User.findOne({ whatsappNumber: responder.whatsappNumber });
      const isValid = await reloaded.comparePassword('demo123');
      console.log(`  Password verification: ${isValid ? '✓ SUCCESS' : '✗ FAILED'}\n`);
    }

    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createResponderUsers();
