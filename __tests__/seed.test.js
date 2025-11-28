const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const Report = require('../src/models/Report');
const User = require('../src/models/User');
const Responder = require('../src/models/Responder');

describe('Seed Endpoint Idempotency', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife-bot-test');
  });

  afterAll(async () => {
    await Report.deleteMany({});
    await User.deleteMany({});
    await Responder.deleteMany({});
    await mongoose.connection.close();
  });

  test('should seed demo data on first run', async () => {
    const response = await request(app)
      .post('/seed/demo-voice-cases');

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('seeded successfully');
    expect(response.body.cases).toHaveLength(3);
    expect(response.body.responders).toHaveLength(2);
  });

  test('should skip seeding on second run (idempotent)', async () => {
    const response = await request(app)
      .post('/seed/demo-voice-cases');

    expect(response.status).toBe(200);
    expect(response.body.skipped).toBe(true);
    expect(response.body.message).toContain('already exists');
  });

  test('should create exactly 3 demo cases', async () => {
    const cases = await Report.find({ caseId: /^WR-DEMO/ });
    expect(cases).toHaveLength(3);
    
    const caseIds = cases.map(c => c.caseId);
    expect(caseIds).toContain('WR-DEMO-WA-001');
    expect(caseIds).toContain('WR-DEMO-VOICE-EN-001');
    expect(caseIds).toContain('WR-DEMO-VOICE-HI-001');
  });

  test('should create Indian responders', async () => {
    const responders = await Responder.find({});
    expect(responders.length).toBeGreaterThanOrEqual(2);
    
    const names = responders.map(r => r.name);
    expect(names).toContain('Ravi Kumar');
    expect(names).toContain('Dr. Meena Patel');
  });
});
