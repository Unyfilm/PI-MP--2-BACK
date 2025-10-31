
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/User';
import { config } from '../src/config/environment';

describe('🚀 GitHub Workflow - Password Recovery API', () => {
  let mongoServer: MongoMemoryServer;
  let testUser: any;

  beforeAll(async () => {
    
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('🗄️ MongoDB Memory Server started for workflow tests');
  });

  afterAll(async () => {
    
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('🗄️ MongoDB Memory Server stopped');
  });

  beforeEach(async () => {
    
    await User.deleteMany({});
    
    
    testUser = await User.create({
      username: 'workflow_test',
      firstName: 'Workflow',
      lastName: 'Test',
      email: 'workflow.test@movieplatform.com',
      password: 'OriginalPassword123!',
      age: 25,
      isActive: true,
    });
    console.log(`👤 Test user created: ${testUser.email}`);
  });

  afterEach(async () => {
    
    await User.deleteMany({});
  });

  describe('🔑 POST /api/auth/forgot-password', () => {
    
    it('✅ Should process forgot password request for existing user', async () => {
      console.log('🧪 Testing forgot password with existing user...');
      
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email,
        });

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña');
      expect(response.body.timestamp).toBeDefined();

      
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.resetPasswordToken).toBeDefined();
      expect(updatedUser?.resetPasswordExpires).toBeDefined();
      
     
      const token = updatedUser?.resetPasswordToken;
      const decoded = jwt.verify(token!, config.jwtSecret);
      expect(decoded).toBeDefined();
      
      console.log('✅ Forgot password test passed');
    });

    it('🔒 Should return success even for non-existent email (security)', async () => {
      console.log('🧪 Testing forgot password with non-existent email...');
      
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@movieplatform.com',
        });

     
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña');
      
      console.log('✅ Security test passed - no email enumeration');
    });

    it('❌ Should validate email format', async () => {
      console.log('🧪 Testing forgot password with invalid email format...');
      
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'invalid-email-format',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Por favor ingresa un email válido');
      
      console.log('✅ Email validation test passed');
    });

    it('❌ Should require email field', async () => {
      console.log('🧪 Testing forgot password without email...');
      
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('El email es requerido');
      
      console.log('✅ Required field validation test passed');
    });
  });

  describe('🔄 POST /api/auth/reset-password', () => {
    let resetToken: string;

    beforeEach(async () => {
      
      resetToken = jwt.sign(
        { userId: testUser._id, email: testUser.email },
        config.jwtSecret,
        { expiresIn: '1h' }
      );

      
      await User.findByIdAndUpdate(testUser._id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });
      
      console.log('🔑 Reset token generated and saved');
    });

    it('✅ Should successfully reset password with valid token', async () => {
      console.log('🧪 Testing password reset with valid token...');
      
      const newPassword = 'NewWorkflowPassword123!';

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword,
          confirmPassword: newPassword,
        });

      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Contraseña restablecida exitosamente');
      expect(response.body.timestamp).toBeDefined();

      
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser).toBeTruthy();
      expect(updatedUser?.resetPasswordToken).toBeUndefined();
      expect(updatedUser?.resetPasswordExpires).toBeUndefined();
      
      console.log('✅ Password reset completed and tokens cleared');
      
      console.log('✅ Password reset test passed');
    });

    it('❌ Should reject mismatched passwords', async () => {
      console.log('🧪 Testing password reset with mismatched passwords...');
      
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'Password123!',
          confirmPassword: 'DifferentPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Las contraseñas no coinciden');
      
      console.log('✅ Password mismatch validation test passed');
    });

    it('❌ Should reject invalid/expired tokens', async () => {
      console.log('🧪 Testing password reset with invalid token...');
      
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token-123',
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Enlace inválido o caducado');
      
      console.log('✅ Invalid token test passed');
    });

    it('❌ Should validate password strength', async () => {
      console.log('🧪 Testing password reset with weak password...');
      
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'weak',
          confirmPassword: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo');
      
      console.log('✅ Password strength validation test passed');
    });

    it('❌ Should reject expired tokens', async () => {
      console.log('🧪 Testing password reset with expired token...');
      
      
      const expiredToken = jwt.sign(
        { userId: testUser._id, email: testUser.email },
        config.jwtSecret,
        { expiresIn: '-1h' } 
      );

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: expiredToken,
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Enlace inválido o caducado');
      
      console.log('✅ Expired token test passed');
    });
  });

  describe('🔄 Integration Test - Complete Password Recovery Flow', () => {
    
    it('🌟 Should complete full password recovery workflow', async () => {
      console.log('🧪 Testing complete password recovery integration...');
      
      const originalPassword = 'OriginalPassword123!';
      const newPassword = 'NewIntegrationPassword123!';
      
      
      console.log('📧 Step 1: Requesting password reset...');
      const forgotResponse = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email,
        });
      
      expect(forgotResponse.status).toBe(200);
      expect(forgotResponse.body.success).toBe(true);
      
      
      const userWithToken = await User.findById(testUser._id);
      const resetToken = userWithToken?.resetPasswordToken;
      expect(resetToken).toBeDefined();
      
      console.log('🔑 Step 2: Reset token retrieved from database');
      
      
      console.log('🔄 Step 3: Resetting password with token...');
      const resetResponse = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword,
          confirmPassword: newPassword,
        });
      
      expect(resetResponse.status).toBe(200);
      expect(resetResponse.body.success).toBe(true);
      expect(resetResponse.body.message).toBe('Contraseña restablecida exitosamente');
      
      
      console.log('✅ Step 4: Verifying workflow completion...');
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser).toBeTruthy();
      
     
      expect(updatedUser?.resetPasswordToken).toBeUndefined();
      expect(updatedUser?.resetPasswordExpires).toBeUndefined();
      

      
      console.log('🌟 Complete workflow integration test passed!');
    });
  });
});