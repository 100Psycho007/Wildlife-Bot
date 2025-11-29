const mongoose = require('mongoose');
const Report = require('../src/models/Report');
require('dotenv').config();

async function checkCases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const cases = await Report.find({}).select('caseId source language status priority');
    
    console.log(`Total cases in database: ${cases.length}\n`);
    
    cases.forEach(c => {
      console.log(`${c.caseId}`);
      console.log(`  Source: ${c.source}`);
      console.log(`  Language: ${c.language}`);
      console.log(`  Status: ${c.status}`);
      console.log(`  Priority: ${c.priority}`);
      console.log('');
    });

    const voiceCases = cases.filter(c => c.source === 'voice');
    console.log(`Voice cases: ${voiceCases.length}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkCases();
