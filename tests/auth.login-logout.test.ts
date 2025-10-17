import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User';
import { RevokedToken } from '../src/models/RevokedToken';
import app from '../src/app';

let mongoServer: MongoMemoryServer;
let testUser: any;
let authToken: string;

describe('POST /api/auth/login & /api/auth/logout', () => {
  beforeAll(async () => {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to in-memory database
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    // Close connection and stop MongoDB instance
    await mongoose.disconnect();
    await mongoServer.stop();
  }, 10000);

  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await RevokedToken.deleteMany({});
    
    // Create a test user for login tests
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      age: 25,
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/inicio de sesión exitoso/i);
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.token).toBeDefined();
      
      // Store token for logout tests
      authToken = res.body.data.token;
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/credenciales inválidas/i);
    });

    it('should fail with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/credenciales inválidas/i);
    });

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/email y contraseña son requeridos/i);
    });
  });

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
      // Login to get a valid token before each logout test
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
        });
      authToken = loginRes.body.data.token;
    });

    it('should logout user successfully with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/sesión cerrada exitosamente/i);
      expect(res.body.data.redirectTo).toBe('/login');
    });

    it('should fail logout without token', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail logout with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should invalidate token after logout', async () => {
      // First logout
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(logoutRes.status).toBe(200);

      // Try to use the same token again (should fail)
      const retryRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(retryRes.status).toBe(401);
      expect(retryRes.body.message).toMatch(/token has been revoked/i);
    });

    it('should not allow access to protected routes after logout', async () => {
      // First logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      // Try to access protected route with revoked token
      const profileRes = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(profileRes.status).toBe(401);
    });
  });
});