import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User';
import app from '../src/app';

let mongoServer: MongoMemoryServer;

describe('POST /api/auth/register', () => {
  beforeAll(async () => {
    
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    
    await mongoose.disconnect();
    await mongoServer.stop();
  }, 10000);

  beforeEach(async () => {
   
    await User.deleteMany({});
  });

  it('should register a user successfully with username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        firstName: 'Test',
        lastName: 'User',
        age: 25,
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/registro exitoso/i);
    expect(res.body.data.user.email).toBe('testuser@example.com');
    expect(res.body.data.user.username).toBe('testuser');
    expect(res.body.data.user.age).toBe(25);
  });

  it('should register a user successfully without username (auto-generated)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'autouser@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        firstName: 'Auto',
        lastName: 'User',
        age: 30,
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/registro exitoso/i);
    expect(res.body.data.user.email).toBe('autouser@example.com');
    expect(res.body.data.user.username).toBe('autouser'); // Generated from firstName + lastName
    expect(res.body.data.user.age).toBe(30);
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
        age: 25,
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email válido/i);
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
        age: 25,
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/contraseña debe tener/i);
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
        age: 25,
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/contraseñas no coinciden/i);
  });

  it('should fail if email already exists', async () => {
    
    await User.create({
      username: 'existinguser',
      email: 'existing@example.com',
      password: 'Password1!',
      firstName: 'Exist',
      lastName: 'User',
      age: 30,
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
        age: 25,
      });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/ya está registrado/i);
  });

  it('should fail with invalid age', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        firstName: 'Test',
        lastName: 'User',
        age: 12, 
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/edad debe ser/i);
  });
});
