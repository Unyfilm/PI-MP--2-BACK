import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User';
import app from '../src/app';

let mongoServer: MongoMemoryServer;
let authToken: string;
let userId: string;

describe('DELETE /api/users/account - Account Deletion', () => {
  beforeAll(async () => {
    console.log('🗄️ MongoDB Memory Server started for account deletion tests');
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
    console.log('🗄️ MongoDB Memory Server stopped');
  }, 10000);

  beforeEach(async () => {
    // Clear all users before each test
    await User.deleteMany({});
    
    // Create and login a test user to get auth token
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'deletetest',
        email: 'delete.test@movieplatform.com',
        password: 'DeleteTest123!',
        confirmPassword: 'DeleteTest123!',
        firstName: 'Delete',
        lastName: 'Test',
        age: 25,
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'delete.test@movieplatform.com',
        password: 'DeleteTest123!',
      });

    authToken = loginRes.body.data.token;
    userId = loginRes.body.data.user.id;
    console.log('👤 Test user created and authenticated for deletion tests');
  });

  describe('Account Deletion Success Cases', () => {
    it('should delete account successfully and return redirect info', async () => {
      console.log('🧪 Testing account deletion...');
      
      const res = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Cuenta eliminada exitosamente');
      expect(res.body.data).toHaveProperty('redirectTo', '/register');
      expect(res.body.data).toHaveProperty('message', 'Cuenta eliminada');
      expect(res.body.data).toHaveProperty('deletedUser');
      expect(res.body.data.deletedUser).toHaveProperty('email', 'delete.test@movieplatform.com');
      expect(res.body.data.deletedUser).toHaveProperty('username', 'deletetest');
      expect(res.body.data.deletedUser).toHaveProperty('deletedAt');

      console.log('✅ Account deletion test passed');
    });

    it('should permanently delete user data from database (hard delete)', async () => {
      console.log('🧪 Testing hard delete verification...');
      
      // Verify user exists before deletion
      const userBefore = await User.findById(userId);
      expect(userBefore).toBeTruthy();
      expect(userBefore?.email).toBe('delete.test@movieplatform.com');

      // Delete account
      const deleteRes = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(200);

      // Verify user is completely removed from database (hard delete)
      const userAfter = await User.findById(userId);
      expect(userAfter).toBeNull();

      // Verify user count in database is 0
      const userCount = await User.countDocuments();
      expect(userCount).toBe(0);

      console.log('✅ Hard delete verification test passed');
    });

    it('should prevent login after account deletion', async () => {
      console.log('🧪 Testing login prevention after deletion...');
      
      // Delete account
      const deleteRes = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(200);

      // Try to login with deleted account credentials
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'delete.test@movieplatform.com',
          password: 'DeleteTest123!',
        });

      expect(loginRes.status).toBe(401);
      expect(loginRes.body.success).toBe(false);
      expect(loginRes.body.message).toBe('Credenciales inválidas');

      console.log('✅ Login prevention test passed');
    });
  });

  describe('Account Deletion Error Cases', () => {
    it('should fail without authentication token', async () => {
      console.log('🧪 Testing deletion without auth...');
      
      const res = await request(app)
        .delete('/api/users/account');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Access token required');
      
      console.log('✅ Authentication required test passed');
    });

    it('should fail with invalid token', async () => {
      console.log('🧪 Testing deletion with invalid token...');
      
      const res = await request(app)
        .delete('/api/users/account')
        .set('Authorization', 'Bearer invalid_token_here');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      
      console.log('✅ Invalid token test passed');
    });

    it('should fail when user already deleted (not found)', async () => {
      console.log('🧪 Testing deletion of non-existent user...');
      
      // First delete the account
      await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`);

      // Try to delete again with same token (user no longer exists)
      const res = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(401); // Token is invalid because user doesn't exist
      expect(res.body.success).toBe(false);
      
      console.log('✅ Non-existent user test passed');
    });
  });

  describe('Account Deletion Integration Test', () => {
    it('should complete full account lifecycle with deletion', async () => {
      console.log('🧪 Testing complete account lifecycle...');
      
      // Step 1: Verify account exists and can access profile
      console.log('📋 Step 1: Verifying account access...');
      const profileRes = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(profileRes.status).toBe(200);
      expect(profileRes.body.data.email).toBe('delete.test@movieplatform.com');

      // Step 2: Delete account
      console.log('🗑️ Step 2: Deleting account...');
      const deleteRes = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.redirectTo).toBe('/register');

      // Step 3: Verify account no longer accessible
      console.log('🔒 Step 3: Verifying account inaccessible...');
      const profileAfterRes = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(profileAfterRes.status).toBe(401);

      // Step 4: Verify registration with same email is possible (complete cleanup)
      console.log('🔄 Step 4: Verifying email reuse possible...');
      const reregisterRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'delete.test@movieplatform.com', // Same email
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
          firstName: 'New',
          lastName: 'User',
          age: 28,
        });
      
      expect(reregisterRes.status).toBe(201);
      expect(reregisterRes.body.success).toBe(true);

      console.log('🌟 Complete account lifecycle test passed!');
    });
  });
});