const axios = require('axios');
const { generateScreenshots } = require('./generate-demo-screenshots');

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function seedDemo() {
  console.log('=== Wildlife Bot Demo Seeding ===\n');

  try {
    // Step 1: Seed demo data
    console.log('Step 1: Seeding demo data...');
    const response = await axios.post(`${API_URL}/seed/demo-voice-cases`);
    
    if (response.data.skipped) {
      console.log('✓ Demo data already exists');
    } else {
      console.log('✓ Demo data seeded successfully');
      console.log('\nDemo Users:');
      console.log(`  Admin: ${response.data.users.admin.email} / ${response.data.users.admin.password}`);
      console.log(`  Responder: ${response.data.users.responder.email} / ${response.data.users.responder.password}`);
      console.log('\nDemo Cases:');
      response.data.cases.forEach(c => {
        console.log(`  - ${c.caseId} (${c.source}${c.language ? `, ${c.language}` : ''})`);
      });
    }

    // Step 2: Generate screenshots
    console.log('\nStep 2: Generating screenshots...');
    console.log('Note: Make sure the frontend is running on http://localhost:5173');
    console.log('Run "cd client && npm run dev" in another terminal if not started\n');
    
    // Wait a bit for user to start frontend if needed
    console.log('Waiting 5 seconds before screenshot generation...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    await generateScreenshots();
    
    console.log('\n=== Demo Setup Complete! ===');
    console.log('\nNext steps:');
    console.log('1. Start backend: npm run dev');
    console.log('2. Start frontend: cd client && npm run dev');
    console.log('3. Open http://localhost:5173');
    console.log('4. Login with admin@wildlife-demo.local / demo123');
    console.log('\nScreenshots saved to: static/demo-screenshots/');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Error: Cannot connect to API server');
      console.error('Make sure the backend is running: npm run dev');
    } else if (error.message?.includes('navigation')) {
      console.error('\n❌ Error: Cannot connect to frontend');
      console.error('Make sure the frontend is running: cd client && npm run dev');
    } else {
      console.error('\n❌ Error:', error.message);
    }
    process.exit(1);
  }
}

seedDemo();
