import request from 'supertest';
import mongoose from 'mongoose';
import { User } from '../src/models/User';
import app from '../src/app';

describe('POST /api/auth/register', () => {
  beforeAll(async () => {
    // Connect to test DB (use env var or fallback)
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-streaming-test';
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
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
