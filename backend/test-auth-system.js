require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function testAuthSystem() {
  console.log('=== Testing Authentication System ===\n');

  try {
    // 1. Test MongoDB connection
    console.log('1. Testing MongoDB connection...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife_reports';
    console.log('   Connection string:', mongoUri.replace(/:[^:@]+@/, ':****@'));
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('   ✓ MongoDB connected successfully\n');

    // 2. Load User model
    console.log('2. Loading User model...');
    const User = require('./src/models/User');
    console.log('   ✓ User model loaded\n');

    // 3. Check for existing admin user
    console.log('3. Checking for admin user...');
    let adminUser = await User.findOne({ email: 'admin@wildlife-demo.local' });
    
    if (adminUser) {
      console.log('   ✓ Admin user found:', {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        hasPassword: !!adminUser.password,
        passwordLength: adminUser.password ? adminUser.password.length : 0
      });
    } else {
      console.log('   ✗ Admin user NOT found');
      console.log('   Creating admin user...');
      
      adminUser = new User({
        name: 'System Administrator',
        email: 'admin@wildlife-demo.local',
        password: 'demo123',
        role: 'ADMIN',
        whatsappNumber: '+919800000000',
        isActive: true
      });
      
      await adminUser.save();
      console.log('   ✓ Admin user created');
    }
    console.log('');

    // 4. Test password hashing
    console.log('4. Testing password hashing...');
    const testPassword = 'demo123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    console.log('   Plain password:', testPassword);
    console.log('   Hashed password:', hashedPassword.substring(0, 30) + '...');
    console.log('   Hash length:', hashedPassword.length);
    console.log('');

    // 5. Test password comparison
    console.log('5. Testing password comparison...');
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    console.log('   Password match:', isMatch ? '✓ YES' : '✗ NO');
    console.log('');

    // 6. Test with actual admin user password
    console.log('6. Testing admin user password...');
    if (adminUser.password) {
      const adminPasswordMatch = await adminUser.comparePassword('demo123');
      console.log('   Admin password match:', adminPasswordMatch ? '✓ YES' : '✗ NO');
      
      if (!adminPasswordMatch) {
        console.log('   ⚠ Password mismatch detected!');
        console.log('   Resetting admin password...');
        
        adminUser.password = 'demo123';
        await adminUser.save();
        
        // Verify again
        const reloadedUser = await User.findById(adminUser._id);
        const verifyMatch = await reloadedUser.comparePassword('demo123');
        console.log('   After reset, password match:', verifyMatch ? '✓ YES' : '✗ NO');
      }
    } else {
      console.log('   ✗ Admin user has no password!');
      console.log('   Setting password...');
      adminUser.password = 'demo123';
      await adminUser.save();
      console.log('   ✓ Password set');
    }
    console.log('');

    // 7. Test login flow simulation
    console.log('7. Simulating login flow...');
    const loginEmail = 'admin@wildlife-demo.local';
    const loginPassword = 'demo123';
    
    const userForLogin = await User.findOne({ email: loginEmail, isActive: true });
    
    if (!userForLogin) {
      console.log('   ✗ User not found for login');
    } else {
      console.log('   ✓ User found for login');
      const loginPasswordMatch = await userForLogin.comparePassword(loginPassword);
      console.log('   Login password match:', loginPasswordMatch ? '✓ YES' : '✗ NO');
      
      if (loginPasswordMatch) {
        console.log('   ✓ LOGIN SUCCESSFUL');
      } else {
        console.log('   ✗ LOGIN FAILED - Invalid password');
      }
    }
    console.log('');

    // 8. List all users with emails
    console.log('8. Listing all users with email addresses...');
    const allUsers = await User.find({ email: { $exists: true, $ne: null } }).select('name email role isActive');
    console.log(`   Found ${allUsers.length} users with emails:`);
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - Active: ${user.isActive}`);
    });
    console.log('');

    console.log('=== Test Complete ===');
    console.log('\nLogin credentials:');
    console.log('Email: admin@wildlife-demo.local');
    console.log('Password: demo123');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testAuthSystem();
