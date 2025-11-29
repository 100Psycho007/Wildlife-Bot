const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const Responder = require('../src/models/Responder');

describe('Presence Endpoint', () => {
  let authToken;
  let responderId;

  beforeAll(async () => {
    // Setup test database connection
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife-bot-test');
    
    // Create test responder
    const responder = await Responder.create({
      name: 'Test Responder',
      whatsappNumber: '+919999999999',
      organization: 'Test Org',
      categoriesHandled: ['injured_animal'],
      status: 'offline',
      isActive: true
    });
    responderId = responder._id;
    
    // Mock auth token (in real test, login first)
    authToken = 'mock-token';
  });

  afterAll(async () => {
    await Responder.deleteMany({});
    await mongoose.connection.close();
  });

  test('should update responder presence', async () => {
    const response = await request(app)
      .post('/dashboard/presence/ping')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        responderId: responderId.toString(),
        coords: { lat: 12.9716, lng: 77.5946 }
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify responder status updated
    const responder = await Responder.findById(responderId);
    expect(responder.status).toBe('online');
    expect(responder.lastSeen).toBeDefined();
  });

  test('should list online responders', async () => {
    // First ping to set online
    await request(app)
      .post('/dashboard/presence/ping')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ responderId: responderId.toString() });

    // Then get online list
    const response = await request(app)
      .get('/dashboard/responders/online')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('maskedPhone');
  });
});
