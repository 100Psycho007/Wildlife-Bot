require('dotenv').config();
const mongoose = require('mongoose');

async function testAllLogins() {
  console.log('=== Testing All Login Accounts ===\n');

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife_reports';
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ MongoDB connected\n');

    const User = require('./src/models/User');

    const testAccounts = [
      { email: 'admin@wildlife-demo.local', password: 'demo123', role: 'ADMIN' },
      { email: 'amit.patel@wildlifengo.in', password: 'responder123', role: 'RESPONDER' },
      { email: 'rajesh.kumar@rescue.in', password: 'responder123', role: 'RESPONDER' },
      { email: 'priya.sharma@forest.gov.in', password: 'responder123', role: 'RESPONDER' }
    ];

    console.log('Testing login for all accounts:\n');

    for (const account of testAccounts) {
      const user = await User.findOne({ email: account.email, isActive: true });
      
      if (!user) {
        console.log(`✗ ${account.email} - USER NOT FOUND`);
        continue;
      }

      const isValid = await user.comparePassword(account.password);
      const status = isValid ? '✓' : '✗';
      const result = isValid ? 'LOGIN SUCCESS' : 'LOGIN FAILED';
      
      console.log(`${status} ${account.email}`);
      console.log(`  Role: ${user.role} | Expected: ${account.role}`);
      console.log(`  Status: ${result}`);
      console.log('');
    }

    console.log('=== Test Complete ===');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testAllLogins();
