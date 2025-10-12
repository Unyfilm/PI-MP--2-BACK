import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User';
import app from '../src/app';

let mongoServer: MongoMemoryServer;

describe('POST /api/auth/register', () => {
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
    // Clear all users before each test
    await User.deleteMany({});
  });

  it('should register a user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        firstName: 'Test',
        lastName: 'User',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/Registration successful/i);
    expect(res.body.data.user.email).toBe('testuser@example.com');
  });

  it('should fail with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser2',
        email: 'invalid-email',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        firstName: 'Test',
        lastName: 'User',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid email/i);
  });

  it('should fail with weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser3',
        email: 'test3@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        firstName: 'Test',
        lastName: 'User',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/password/i);
  });

  it('should fail if passwords do not match', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser4',
        email: 'test4@example.com',
        password: 'Password1!',
        confirmPassword: 'Password2!',
        firstName: 'Test',
        lastName: 'User',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/passwords do not match/i);
  });

  it('should fail if email already exists', async () => {
    // Create existing user in memory database
    await User.create({
      username: 'existinguser',
      email: 'existing@example.com',
      password: 'Password1!',
      firstName: 'Exist',
      lastName: 'User',
    });
    
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser',
        email: 'existing@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        firstName: 'Test',
        lastName: 'User',
      });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already registered/i);
  });
});
