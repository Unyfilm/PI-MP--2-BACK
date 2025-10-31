
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User';
import { Movie } from '../src/models/Movie';
import { Comment } from '../src/models/Comment';
import app from '../src/app';

let mongoServer: MongoMemoryServer;
let testUser1: any;
let testUser2: any;
let testMovie: any;
let authToken1: string;
let authToken2: string;
let adminToken: string;

describe('Comment System Tests', () => {
  beforeAll(async () => {
   
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    
    await mongoose.connect(mongoUri);
  }, 30000);

  afterEach(async () => {
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.dropDatabase();
    }
  });

  afterAll(async () => {
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 10000);

  beforeEach(async () => {
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Comment.deleteMany({});

    
    const user1Response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user1@test.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        firstName: 'User',
        lastName: 'One',
        age: 25,
      });

    const user2Response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user2@test.com',
        password: 'Password2!',
        confirmPassword: 'Password2!',
        firstName: 'User',
        lastName: 'Two',
        age: 30,
      });

    
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'AdminPass1!',
        confirmPassword: 'AdminPass1!',
        firstName: 'Admin',
        lastName: 'User',
        age: 35,
      });

    
    await User.updateOne(
      { email: 'admin@test.com' },
      { role: 'admin' }
    );

  
    const loginUser1 = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'Password1!',
      });

    const loginUser2 = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user2@test.com',
        password: 'Password2!',
      });

    const loginAdmin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'AdminPass1!',
      });

    authToken1 = loginUser1.body.data.token;
    authToken2 = loginUser2.body.data.token;
    adminToken = loginAdmin.body.data.token;

    testUser1 = loginUser1.body.data.user;
    testUser2 = loginUser2.body.data.user;

    
    const movieResponse = await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Test Movie for Comments',
        description: 'A test movie for comment functionality',
        synopsis: 'This is a detailed synopsis of the test movie',
        releaseDate: '2024-01-01',
        duration: 120,
        genre: ['Action', 'Drama'],
        director: 'Test Director',
        poster: 'https://example.com/poster.jpg',
        videoUrl: 'https://example.com/video.mp4',
        cloudinaryVideoId: 'test-video-id',
        language: 'en',
        featured: false,
      });

    testMovie = movieResponse.body.data;
    
    
    if (!testMovie || !testMovie._id) {
      console.error('Movie creation failed:', movieResponse.body);
      throw new Error('Test movie creation failed - check admin user creation and authentication');
    }
    
    if (!authToken1 || !authToken2 || !adminToken) {
      throw new Error('Authentication tokens not created properly');
    }
  });

  describe('POST /api/comments - Create Comment', () => {
    it('should create a comment successfully', async () => {
      const commentData = {
        movieId: testMovie._id,
        content: 'This is a great movie! Really enjoyed it.',
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(commentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe(commentData.content);
      expect(response.body.data.userId).toBeDefined();
      expect(response.body.data.movieId).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const commentData = {
        movieId: testMovie._id,
        content: 'This comment should fail',
      };

      const response = await request(app)
        .post('/api/comments')
        .send(commentData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid movie ID', async () => {
      const commentData = {
        movieId: 'invalid-id',
        content: 'This comment should fail',
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(commentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with empty content', async () => {
      const commentData = {
        movieId: testMovie._id,
        content: '',
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(commentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with content exceeding 200 characters', async () => {
      const commentData = {
        movieId: testMovie._id,
        content: 'a'.repeat(201), // 201 characters
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(commentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/comments/movie/:movieId - Get Movie Comments (Authenticated)', () => {
    beforeEach(async () => {
    
      await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          movieId: testMovie._id,
          content: 'First comment from user 1',
        });

      await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          movieId: testMovie._id,
          content: 'Second comment from user 2',
        });
    });

    it('should get movie comments for authenticated user', async () => {
      const response = await request(app)
        .get(`/api/comments/movie/${testMovie._id}`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/comments/movie/${testMovie._id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get(`/api/comments/movie/${testMovie._id}?page=1&limit=1`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalItems).toBe(2);
    });
  });

  describe('GET /api/comments/me - Get My Comments', () => {
    beforeEach(async () => {
      
      await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          movieId: testMovie._id,
          content: 'My comment on test movie',
        });
    });

    it('should get user own comments', async () => {
      const response = await request(app)
        .get('/api/comments/me')
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].content).toBe('My comment on test movie');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/comments/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return empty array for user with no comments', async () => {
      const response = await request(app)
        .get('/api/comments/me')
        .set('Authorization', `Bearer ${authToken2}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('PUT /api/comments/:commentId - Update Comment', () => {
    it('should update own comment successfully', async () => {
      
      const commentResponse = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          movieId: testMovie._id,
          content: 'Original comment content',
        });

      const commentId = commentResponse.body.data.id;

      const updateData = {
        content: 'Updated comment content',
      };

      const response = await request(app)
        .put(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe(updateData.content);
    });

    it('should fail to update another users comment', async () => {
      
      const commentResponse = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          movieId: testMovie._id,
          content: 'Original comment content',
        });

      const commentId = commentResponse.body.data.id;

      const updateData = {
        content: 'Trying to update someone elses comment',
      };

      const response = await request(app)
        .put(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      
      const commentResponse = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          movieId: testMovie._id,
          content: 'Original comment content',
        });

      const commentId = commentResponse.body.data.id;

      const updateData = {
        content: 'Updated content',
      };

      const response = await request(app)
        .put(`/api/comments/${commentId}`)
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/comments/:commentId - Delete Comment', () => {
    it('should delete own comment successfully', async () => {
      
      const commentResponse = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          movieId: testMovie._id,
          content: 'Comment to be deleted',
        });

      const commentId = commentResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow admin to delete any comment', async () => {
      
      const commentResponse = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          movieId: testMovie._id,
          content: 'Comment to be deleted by admin',
        });

      const commentId = commentResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fail to delete another users comment', async () => {
    
      const commentResponse = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          movieId: testMovie._id,
          content: 'Comment owned by user1',
        });

      const commentId = commentResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken2}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      
      const commentResponse = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          movieId: testMovie._id,
          content: 'Comment to be deleted without auth',
        });

      const commentId = commentResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/comments/${commentId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/comments/public/movie/:movieId - Public Movie Comments', () => {
    beforeEach(async () => {
      
      await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          movieId: testMovie._id,
          content: 'Public comment from user 1',
        });
    });

    it('should get movie comments without authentication', async () => {
      const response = await request(app)
        .get(`/api/comments/public/movie/${testMovie._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1);
    });

    it('should handle invalid movie ID', async () => {
      const response = await request(app)
        .get('/api/comments/public/movie/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle non-existent movie', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/comments/public/movie/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});