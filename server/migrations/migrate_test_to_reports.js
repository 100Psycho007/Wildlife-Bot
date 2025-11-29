const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Load Report model
const Report = require('../src/models/Report');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const SOURCE_COLLECTION = 'test';
const TARGET_COLLECTION = 'reports'; // Mongoose model 'Report' uses this
const BATCH_SIZE = 500;
const ALLOW_LIVE_MIGRATION = process.env.ALLOW_LIVE_MIGRATION === 'true';

// Logger
const log = (msg, type = 'INFO') => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${msg}`);
};

async function connectDB() {
  if (!MONGODB_URI) {
    log('MONGODB_URI not found in .env', 'ERROR');
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGODB_URI);
    log('Connected to MongoDB');
  } catch (err) {
    log(`MongoDB connection error: ${err.message}`, 'ERROR');
    process.exit(1);
  }
}

async function backupCollection(db) {
  log('Starting backup...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupCollName = `archive_test_${timestamp}`;
  const backupFile = path.join(__dirname, `backup_test_${timestamp}.json`);

  try {
    // 1. In-DB Backup
    await db.collection(SOURCE_COLLECTION).aggregate([
      { $match: {} },
      { $out: backupCollName }
    ]).toArray();
    log(`In-DB backup created: ${backupCollName}`);

    // 2. JSON File Backup
    const docs = await db.collection(SOURCE_COLLECTION).find({}).toArray();
    fs.writeFileSync(backupFile, JSON.stringify(docs, null, 2));
    log(`JSON backup saved to: ${backupFile}`);

    return { backupCollName, backupFile };
  } catch (err) {
    log(`Backup failed: ${err.message}`, 'ERROR');
    throw err;
  }
}

async function discoverSchema(db) {
  log('Starting schema discovery...');
  const sampleDocs = await db.collection(SOURCE_COLLECTION).find({}).limit(1000).toArray();
  const fields = new Set();
  const typeMap = {};

  sampleDocs.forEach(doc => {
    Object.keys(doc).forEach(key => {
      fields.add(key);
      const type = typeof doc[key];
      if (!typeMap[key]) typeMap[key] = new Set();
      typeMap[key].add(type);
    });
  });

  const discoveryReport = {
    totalDocs: sampleDocs.length,
    fields: Array.from(fields),
    types: Object.fromEntries(Object.entries(typeMap).map(([k, v]) => [k, Array.from(v)]))
  };

  log('Schema discovery complete.');
  return discoveryReport;
}

function transformDoc(doc) {
  // Transformation Logic
  // Mapping 'test' collection fields to 'Report' schema
  
  const newDoc = {
    migratedFromTest: true,
    migratedFromId: doc._id,
    migratedAt: new Date(),
    
    // Core Fields
    caseId: doc.caseId || `WR-MIG-${uuidv4().substring(0, 8).toUpperCase()}`,
    source: doc.source || 'whatsapp', // Default to whatsapp if missing
    status: doc.status || 'pending',
    priority: doc.priority || 'medium',
    description: doc.description || doc.message || 'No description provided', // Fallback
    
    // Location
    location: {
      description: doc.location_text || doc.address || '',
      coordinates: {
        latitude: doc.lat || (doc.location ? doc.location.lat : null),
        longitude: doc.lng || (doc.location ? doc.location.lng : null)
      }
    },

    // Contact (Encrypted/Masked placeholders)
    phoneEncrypted: doc.phone_number || doc.phone || null, // TODO: Apply encryption if needed
    
    // Category
    category: mapCategory(doc.category),
    
    // Timestamps
    createdAt: doc.created_at ? new Date(doc.created_at) : new Date(),
    updatedAt: new Date()
  };

  // Ensure required fields for Report model
  if (!newDoc.reporterId) {
      // In a real scenario, we might need a default migration user. 
      // For now, we'll generate a placeholder ID or skip validation in dry-run if strict.
      // But Report model requires reporterId. 
      // Strategy: We will fetch or create a 'Migration Bot' user in the main function if needed.
      // For this transform function, we'll leave it undefined and handle it in the batch processor.
  }

  return newDoc;
}

function mapCategory(oldCategory) {
  const map = {
    'sighting': 'animal_sighting',
    'injured': 'injured_animal',
    'conflict': 'human_wildlife_conflict',
    'abandoned': 'abandoned_pet'
  };
  return map[oldCategory] || 'other';
}

async function runMigration() {
  await connectDB();
  const db = mongoose.connection.db;

  // 1. Backup
  let backupInfo;
  try {
    backupInfo = await backupCollection(db);
  } catch (err) {
    process.exit(1);
  }

  // 2. Discovery & Mapping (Dry Run Prep)
  const discovery = await discoverSchema(db);
  const mappingFile = path.join(__dirname, 'mapping_test_to_report.json');
  fs.writeFileSync(mappingFile, JSON.stringify({ discovery, transformation: "See transformDoc function in script" }, null, 2));

  // 3. Dry Run
  log('Starting Dry Run...');
  const cursor = db.collection(SOURCE_COLLECTION).find({});
  let processed = 0;
  let valid = 0;
  let errors = [];

  // Get a default user for reporterId (required by schema)
  // In dry run we just simulate
  const mockReporterId = new mongoose.Types.ObjectId();

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    processed++;
    try {
      const transformed = transformDoc(doc);
      transformed.reporterId = mockReporterId; // Satisfy required field for validation

      // Validate against Mongoose Model
      const report = new Report(transformed);
      await report.validate();
      valid++;
    } catch (err) {
      errors.push({ id: doc._id, error: err.message });
    }
  }

  const dryRunReport = {
    timestamp: new Date(),
    totalProcessed: processed,
    validDocs: valid,
    errorCount: errors.length,
    errors: errors.slice(0, 50), // Cap errors
    backupInfo
  };

  const dryRunFile = path.join(__dirname, `dryrun_report_${Date.now()}.json`);
  fs.writeFileSync(dryRunFile, JSON.stringify(dryRunReport, null, 2));
  log(`Dry Run Complete. Valid: ${valid}/${processed}. Report: ${dryRunFile}`);

  if (errors.length > 0) {
    log(`WARNING: ${errors.length} documents failed validation. Check report.`, 'WARN');
  }

  // 4. Live Migration
  if (ALLOW_LIVE_MIGRATION) {
    if (errors.length > processed * 0.01) { // > 1% errors
      log('ABORTING LIVE MIGRATION: Too many validation errors.', 'ERROR');
      process.exit(1);
    }

    log('Starting LIVE Migration...', 'WARN');
    
    // Find or create Migration User
    let migrationUser = await mongoose.model('User').findOne({ email: 'migration@system.local' });
    if (!migrationUser) {
        migrationUser = await mongoose.model('User').create({
            email: 'migration@system.local',
            password: 'migration_secure_pass', // Should be hashed in real app
            role: 'admin',
            name: 'System Migration'
        });
    }

    const liveCursor = db.collection(SOURCE_COLLECTION).find({});
    let migrated = 0;
    let batch = [];
    
    while (await liveCursor.hasNext()) {
      const doc = await liveCursor.next();
      const transformed = transformDoc(doc);
      transformed.reporterId = migrationUser._id;

      // Check for CaseID collision
      const existing = await Report.findOne({ caseId: transformed.caseId });
      if (existing) {
          transformed.caseId = `WR-MIG-${uuidv4().substring(0, 8).toUpperCase()}`;
          log(`CaseID collision resolved for ${doc._id} -> ${transformed.caseId}`, 'WARN');
      }

      batch.push(transformed);

      if (batch.length >= BATCH_SIZE) {
        await Report.insertMany(batch);
        migrated += batch.length;
        log(`Migrated ${migrated} documents...`);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await Report.insertMany(batch);
      migrated += batch.length;
    }

    // Summary
    await db.collection('server_migrations').insertOne({
      name: "merge_test_to_reports",
      timestamp: new Date(),
      totalDocs: processed,
      migratedCount: migrated,
      backupCollection: backupInfo.backupCollName
    });

    log(`LIVE MIGRATION SUCCESSFUL. Migrated ${migrated} documents.`);
  } else {
    log('Live migration skipped (ALLOW_LIVE_MIGRATION != true).');
    log('To run live migration: set ALLOW_LIVE_MIGRATION=true in env');
  }

  process.exit(0);
}

runMigration().catch(err => {
  log(`Fatal Error: ${err.message}`, 'ERROR');
  process.exit(1);
});
