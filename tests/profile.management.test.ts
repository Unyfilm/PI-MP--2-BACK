import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User';
import app from '../src/app';

let mongoServer: MongoMemoryServer;
let authToken: string;
let userId: string;

describe('Profile Management APIs', () => {
  beforeAll(async () => {
    console.log('🗄️ MongoDB Memory Server started for profile tests');
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
        username: 'profiletest',
        email: 'profile.test@movieplatform.com',
        password: 'ProfileTest123!',
        confirmPassword: 'ProfileTest123!',
        firstName: 'Profile',
        lastName: 'Test',
        age: 25,
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'profile.test@movieplatform.com',
        password: 'ProfileTest123!',
      });

    authToken = loginRes.body.data.token;
    userId = loginRes.body.data.user.id;
    console.log('👤 Test user created and authenticated for profile tests');
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile successfully', async () => {
      console.log('🧪 Testing get user profile...');
      
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Perfil obtenido exitosamente');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('username', 'profiletest');
      expect(res.body.data).toHaveProperty('email', 'profile.test@movieplatform.com');
      expect(res.body.data).toHaveProperty('firstName', 'Profile');
      expect(res.body.data).toHaveProperty('lastName', 'Test');
      expect(res.body.data).toHaveProperty('fullName', 'Profile Test');
      expect(res.body.data).toHaveProperty('role', 'user');
      expect(res.body.data).toHaveProperty('preferences');
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
      
      // Ensure sensitive fields are not returned
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.data).not.toHaveProperty('resetPasswordToken');
      
      console.log('✅ Get profile test passed');
    });

    it('should fail without authentication', async () => {
      console.log('🧪 Testing get profile without auth...');
      
      const res = await request(app)
        .get('/api/users/profile');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Access token required');
      
      console.log('✅ Authentication validation test passed');
    });

    it('should fail with invalid token', async () => {
      console.log('🧪 Testing get profile with invalid token...');
      
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid_token_here');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      
      console.log('✅ Invalid token test passed');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      console.log('🧪 Testing profile update...');
      
      const updateData = {
        firstName: 'Updated',
        lastName: 'Profile',
        username: 'updatedprofile',
        email: 'updated.profile@movieplatform.com',
        profilePicture: 'https://example.com/new-avatar.jpg',
        preferences: {
          language: 'en',
          notifications: false,
          autoplay: true,
          qualityPreference: '4K'
        }
      };

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Perfil actualizado exitosamente');
      expect(res.body.data.firstName).toBe('Updated');
      expect(res.body.data.lastName).toBe('Profile');
      expect(res.body.data.fullName).toBe('Updated Profile');
      expect(res.body.data.username).toBe('updatedprofile');
      expect(res.body.data.email).toBe('updated.profile@movieplatform.com');
      expect(res.body.data.profilePicture).toBe('https://example.com/new-avatar.jpg');
      expect(res.body.data.preferences.language).toBe('en');
      expect(res.body.data.preferences.notifications).toBe(false);
      
      console.log('✅ Profile update test passed');
    });

    it('should fail with duplicate email', async () => {
      console.log('🧪 Testing update with duplicate email...');
      
      // Create another user first
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'anotheruser',
          email: 'another.user@movieplatform.com',
          password: 'AnotherTest123!',
          confirmPassword: 'AnotherTest123!',
          firstName: 'Another',
          lastName: 'User',
          age: 30,
        });

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'another.user@movieplatform.com'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Este email ya está en uso por otro usuario');
      
      console.log('✅ Duplicate email validation test passed');
    });

    it('should fail with duplicate username', async () => {
      console.log('🧪 Testing update with duplicate username...');
      
      // Create another user first
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          email: 'duplicate.user@movieplatform.com',
          password: 'DuplicateTest123!',
          confirmPassword: 'DuplicateTest123!',
          firstName: 'Duplicate',
          lastName: 'User',
          age: 30,
        });

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'duplicateuser'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Este nombre de usuario ya está en uso');
      
      console.log('✅ Duplicate username validation test passed');
    });

    it('should fail with invalid email format', async () => {
      console.log('🧪 Testing update with invalid email format...');
      
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email-format'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Por favor ingresa un email válido');
      
      console.log('✅ Email format validation test passed');
    });

    it('should fail with short username', async () => {
      console.log('🧪 Testing update with short username...');
      
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'ab'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      
      console.log('✅ Username length validation test passed');
    });

    it('should fail with short firstName', async () => {
      console.log('🧪 Testing update with short firstName...');
      
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'a'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('El nombre debe tener al menos 2 caracteres');
      
      console.log('✅ FirstName length validation test passed');
    });

    it('should fail with short lastName', async () => {
      console.log('🧪 Testing update with short lastName...');
      
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lastName: 'b'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('El apellido debe tener al menos 2 caracteres');
      
      console.log('✅ LastName length validation test passed');
    });

    it('should fail with no data to update', async () => {
      console.log('🧪 Testing update with no data...');
      
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('No se proporcionaron datos para actualizar');
      
      console.log('✅ No data validation test passed');
    });

    it('should fail without authentication', async () => {
      console.log('🧪 Testing update without auth...');
      
      const res = await request(app)
        .put('/api/users/profile')
        .send({
          firstName: 'Test'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      
      console.log('✅ Update authentication test passed');
    });
  });

  describe('PUT /api/users/change-password', () => {
    it('should change password successfully', async () => {
      console.log('🧪 Testing password change...');
      
      const res = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'ProfileTest123!',
          newPassword: 'NewPassword456@',
          confirmPassword: 'NewPassword456@'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Contraseña actualizada exitosamente');
      
      // Verify new password works by logging in
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'profile.test@movieplatform.com',
          password: 'NewPassword456@'
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      
      console.log('✅ Password change test passed');
    });

    it('should fail with incorrect current password', async () => {
      console.log('🧪 Testing password change with wrong current password...');
      
      const res = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword456@',
          confirmPassword: 'NewPassword456@'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('La contraseña actual es incorrecta');
      
      console.log('✅ Incorrect current password test passed');
    });

    it('should fail with mismatched new passwords', async () => {
      console.log('🧪 Testing password change with mismatched passwords...');
      
      const res = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'ProfileTest123!',
          newPassword: 'NewPassword456@',
          confirmPassword: 'DifferentPassword789#'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Las contraseñas no coinciden');
      
      console.log('✅ Password mismatch test passed');
    });

    it('should fail with weak new password', async () => {
      console.log('🧪 Testing password change with weak password...');
      
      const res = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'ProfileTest123!',
          newPassword: 'weak',
          confirmPassword: 'weak'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo');
      
      console.log('✅ Weak password validation test passed');
    });

    it('should fail when new password is same as current', async () => {
      console.log('🧪 Testing password change with same password...');
      
      const res = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'ProfileTest123!',
          newPassword: 'ProfileTest123!',
          confirmPassword: 'ProfileTest123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('La nueva contraseña debe ser diferente a la actual');
      
      console.log('✅ Same password validation test passed');
    });

    it('should fail with missing fields', async () => {
      console.log('🧪 Testing password change with missing fields...');
      
      const res = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'ProfileTest123!',
          // Missing newPassword and confirmPassword
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Todos los campos son requeridos');
      
      console.log('✅ Missing fields validation test passed');
    });

    it('should fail without authentication', async () => {
      console.log('🧪 Testing password change without auth...');
      
      const res = await request(app)
        .put('/api/users/change-password')
        .send({
          currentPassword: 'ProfileTest123!',
          newPassword: 'NewPassword456@',
          confirmPassword: 'NewPassword456@'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      
      console.log('✅ Password change authentication test passed');
    });
  });

  describe('Profile Management Integration Tests', () => {
    it('should complete full profile management workflow', async () => {
      console.log('🧪 Testing complete profile management integration...');
      
      // Step 1: Get initial profile
      console.log('📋 Step 1: Getting initial profile...');
      const initialProfile = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(initialProfile.status).toBe(200);
      expect(initialProfile.body.data.firstName).toBe('Profile');
      
      // Step 2: Update profile
      console.log('📝 Step 2: Updating profile information...');
      const updateProfile = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Integration',
          preferences: {
            language: 'es',
            notifications: true,
            autoplay: false,
            qualityPreference: '1080p'
          }
        });
      
      expect(updateProfile.status).toBe(200);
      expect(updateProfile.body.data.firstName).toBe('Updated');
      expect(updateProfile.body.data.fullName).toBe('Updated Integration');
      
      // Step 3: Verify profile was updated
      console.log('✔️ Step 3: Verifying profile update...');
      const verifyProfile = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(verifyProfile.status).toBe(200);
      expect(verifyProfile.body.data.firstName).toBe('Updated');
      expect(verifyProfile.body.data.preferences.language).toBe('es');
      
      // Step 4: Change password
      console.log('🔑 Step 4: Changing password...');
      const changePassword = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'ProfileTest123!',
          newPassword: 'IntegrationTest456@',
          confirmPassword: 'IntegrationTest456@'
        });
      
      expect(changePassword.status).toBe(200);
      
      // Step 5: Verify new password works
      console.log('🔐 Step 5: Verifying new password...');
      const loginWithNewPassword = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'profile.test@movieplatform.com',
          password: 'IntegrationTest456@'
        });
      
      expect(loginWithNewPassword.status).toBe(200);
      expect(loginWithNewPassword.body.success).toBe(true);
      
      console.log('🌟 Complete profile management integration test passed!');
    });
  });
});