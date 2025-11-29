const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function verifyMigration() {
  console.log('=== MongoDB Migration Verification ===\n');
  
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
  }
  
  console.log('✓ MongoDB URI found');
  console.log(`  Connection: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`);
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Check collections
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    collections.forEach(c => console.log(`  - ${c.name}`));
    console.log();
    
    // Check for 'test' collection
    const testColl = collections.find(c => c.name === 'test');
    if (testColl) {
      const count = await db.collection('test').countDocuments();
      console.log(`✓ 'test' collection exists with ${count} documents`);
      
      if (count > 0) {
        const sample = await db.collection('test').findOne();
        console.log('\nSample document from test collection:');
        console.log(JSON.stringify(sample, null, 2));
      }
    } else {
      console.log('⚠️  \'test\' collection not found');
      console.log('   This is expected if no test data exists yet.');
    }
    
    // Check for reports collection
    const reportsColl = collections.find(c => c.name === 'reports');
    if (reportsColl) {
      const count = await db.collection('reports').countDocuments();
      console.log(`\n✓ 'reports' collection exists with ${count} documents`);
      
      // Check for migrated documents
      const migratedCount = await db.collection('reports').countDocuments({ migratedFromTest: true });
      if (migratedCount > 0) {
        console.log(`  - ${migratedCount} documents were migrated from 'test' collection`);
      }
    }
    
    // Check for backup collections
    const backupColls = collections.filter(c => c.name.startsWith('archive_test_'));
    if (backupColls.length > 0) {
      console.log(`\n✓ Found ${backupColls.length} backup collection(s):`);
      for (const coll of backupColls) {
        const count = await db.collection(coll.name).countDocuments();
        console.log(`  - ${coll.name}: ${count} documents`);
      }
    }
    
    // Check migration summary
    const migrationSummary = await db.collection('server_migrations').find({}).toArray();
    if (migrationSummary.length > 0) {
      console.log(`\n✓ Found ${migrationSummary.length} migration record(s):`);
      migrationSummary.forEach(m => {
        console.log(`  - ${m.name} (${m.timestamp})`);
        console.log(`    Total: ${m.totalDocs}, Migrated: ${m.migratedCount}`);
      });
    }
    
    console.log('\n=== Verification Complete ===');
    console.log('\nMigration Status:');
    if (!testColl || (await db.collection('test').countDocuments()) === 0) {
      console.log('  ⚠️  No data in \'test\' collection to migrate');
      console.log('  ✓  Dry-run completed successfully');
      console.log('  ℹ️  Live migration will run when ALLOW_LIVE_MIGRATION=true and test data exists');
    } else {
      console.log('  ✓  Test collection has data');
      console.log('  ℹ️  Run migration with: ALLOW_LIVE_MIGRATION=true node server/migrations/migrate_test_to_reports.js');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

verifyMigration();
