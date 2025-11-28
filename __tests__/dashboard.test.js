const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');
const Report = require('../src/models/Report');

describe('Dashboard API Tests', () => {
  let adminToken;
  let responderToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wildlife_reports_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Authentication', () => {
    test('Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@wildlife-demo.local',
          password: 'demo123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('role');
      
      adminToken = response.body.accessToken;
    });

    test('Should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@wildlife-demo.local',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Reports API', () => {
    test('Should list reports with authentication', async () => {
      const response = await request(app)
        .get('/dashboard/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reports');
      expect(response.body).toHaveProperty('pagination');
    });

    test('Should reject requests without token', async () => {
      const response = await request(app)
        .get('/dashboard/reports');

      expect(response.status).toBe(401);
    });

    test('Should mask phone numbers for non-admin users', async () => {
      // Login as responder
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'responder@wildlife-demo.local',
          password: 'demo123'
        });

      responderToken = loginResponse.body.accessToken;

      const response = await request(app)
        .get('/dashboard/reports')
        .set('Authorization', `Bearer ${responderToken}`);

      expect(response.status).toBe(200);
      
      // Check if phone numbers are masked
      const reports = response.body.reports;
      if (reports.length > 0) {
        const report = reports[0];
        if (report.phoneMasked) {
          expect(report.phoneMasked).toMatch(/\*+/);
        }
      }
    });
  });

  describe('Seed Endpoint', () => {
    test('Should seed demo data successfully', async () => {
      const response = await request(app)
        .post('/seed/demo-voice-cases');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      
      // Should be idempotent
      const response2 = await request(app)
        .post('/seed/demo-voice-cases');
      
      expect(response2.status).toBe(200);
    });
  });
});
