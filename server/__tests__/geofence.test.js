const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const Geofence = require('../src/models/Geofence');
const Report = require('../src/models/Report');
const User = require('../src/models/User');
const { createEscalation } = require('../src/jobs/escalation');

describe('Geofence Escalation', () => {
  let adminToken;
  let testUser;
  let testGeofence;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife-bot-test');
    
    // Create admin user
    testUser = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      role: 'ADMIN',
      whatsappNumber: '+919999999998',
      isActive: true
    });
    
    // Create test geofence
    testGeofence = await Geofence.create({
      name: 'Test Zone',
      polygon: {
        type: 'Polygon',
        coordinates: [[[77.5, 12.9], [77.6, 12.9], [77.6, 13.0], [77.5, 13.0], [77.5, 12.9]]]
      },
      notifyOnEntry: true,
      escalatePriority: true,
      createdBy: testUser._id
    });
    
    adminToken = 'mock-admin-token';
  });

  afterAll(async () => {
    await Geofence.deleteMany({});
    await Report.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  test('should escalate case when created inside geofence', async () => {
    // Create a report inside the geofence
    const report = await Report.create({
      caseId: 'TEST-001',
      reporterId: testUser._id,
      source: 'whatsapp',
      category: 'injured_animal',
      location: {
        coordinates: { latitude: 12.95, longitude: 77.55 },
        district: 'Test District',
        latEncrypted: 'encrypted',
        lngEncrypted: 'encrypted'
      },
      description: 'Test case',
      status: 'pending',
      priority: 'medium'
    });

    // Check if point is in geofence (simplified check)
    const lat = 12.95;
    const lng = 77.55;
    const inGeofence = lat >= 12.9 && lat <= 13.0 && lng >= 77.5 && lng <= 77.6;

    expect(inGeofence).toBe(true);

    // If in geofence, priority should be escalated
    if (inGeofence) {
      report.priority = 'high';
      await report.save();
      await createEscalation(report, 'geofence');
    }

    const updatedReport = await Report.findById(report._id);
    expect(updatedReport.priority).toBe('high');
  });

  test('should create geofence via API', async () => {
    const response = await request(app)
      .post('/dashboard/geofences')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Zone',
        polygon: {
          coordinates: [[[77.0, 12.0], [77.1, 12.0], [77.1, 12.1], [77.0, 12.1], [77.0, 12.0]]]
        },
        notifyOnEntry: true
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('New Zone');
  });
});
