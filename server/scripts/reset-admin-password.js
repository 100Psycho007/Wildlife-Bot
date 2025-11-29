const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function resetAdminPassword() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife-bot');
    console.log('Connected to database');

    // Find admin user
    let admin = await User.findOne({ email: 'admin@wildlife-demo.local' });
    
    if (!admin) {
      console.log('Admin user not found, creating...');
      admin = new User({
        name: 'System Administrator',
        email: 'admin@wildlife-demo.local',
        password: 'demo123',
        role: 'ADMIN',
        whatsappNumber: '+919800000000',
        isActive: true
      });
    } else {
      console.log('Admin user found, resetting password...');
      admin.password = 'demo123';
      admin.markModified('password'); // Explicitly mark as modified
    }
    
    console.log('Is password modified?', admin.isModified('password'));
    await admin.save();
    console.log('✓ Admin password set to: demo123');
    console.log('✓ Email: admin@wildlife-demo.local');
    console.log(`✓ Hashed password: ${admin.password.substring(0, 20)}...`);
    
    // Reload from database to test
    const reloaded = await User.findOne({ email: 'admin@wildlife-demo.local' });
    console.log(`✓ Reloaded password: ${reloaded.password.substring(0, 20)}...`);
    
    // Test password
    const isValid = await reloaded.comparePassword('demo123');
    console.log(`✓ Password verification: ${isValid ? 'SUCCESS' : 'FAILED'}`);
    
    if (!isValid) {
      console.log('\nDebug info:');
      console.log('- Password field exists:', !!reloaded.password);
      console.log('- Password starts with $2:', reloaded.password.startsWith('$2'));
    }
    
    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
