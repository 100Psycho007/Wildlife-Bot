require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife_reports');
    
    const users = await User.find({});
    console.log('\n📋 All Users in Database:');
    console.log('='.repeat(60));
    
    users.forEach(user => {
      console.log(`\nUser ID: ${user._id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email || 'N/A'}`);
      console.log(`Password: ${user.password || 'N/A'}`);
      console.log(`Role: ${user.role}`);
      console.log(`WhatsApp: ${user.whatsappNumber}`);
      console.log(`Active: ${user.isActive}`);
      console.log('-'.repeat(60));
    });
    
    console.log(`\nTotal Users: ${users.length}`);
    
    // Check for admin specifically
    const admin = await User.findOne({ email: 'admin@wildlife.local' });
    if (admin) {
      console.log('\n✅ Admin user found:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${admin.password}`);
      console.log(`   Role: ${admin.role}`);
    } else {
      console.log('\n❌ No admin user found with email: admin@wildlife.local');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();
