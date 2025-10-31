
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User';
import { Movie } from '../src/models/Movie';
import { Rating } from '../src/models/Rating';
import app from '../src/app';

let mongoServer: MongoMemoryServer;
let testUser1: any;
let testUser2: any;
let testMovie: any;
let authToken1: string;
let authToken2: string;

describe('Rating System Tests', () => {
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
    await Movie.deleteMany({});
    await Rating.deleteMany({});

    
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

   
    const login1Response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'Password1!',
      });

    const login2Response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user2@test.com',
        password: 'Password2!',
      });

    authToken1 = login1Response.body.data.token;
    authToken2 = login2Response.body.data.token;
    testUser1 = login1Response.body.data.user;
    testUser2 = login2Response.body.data.user;

    
    testMovie = new Movie({
      title: 'Test Movie',
      description: 'A test movie for rating tests',
      synopsis: 'This is a test movie created specifically for testing the rating system functionality.',
      releaseDate: new Date('2023-01-01'),
      duration: 120,
      genre: ['Action', 'Drama'],
      director: 'Test Director',
      poster: 'https://example.com/poster.jpg',
      videoUrl: 'https://example.com/video.mp4',
      cloudinaryVideoId: 'test_video_id',
      language: 'en',
    });

    await testMovie.save();
  });

  describe('POST /api/ratings - Create Rating', () => {
    it('should create a new rating successfully', async () => {
      const ratingData = {
        movieId: testMovie._id.toString(),
        rating: 4,
        review: 'Great movie! Really enjoyed it.',
      };

      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(ratingData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/rating created successfully/i);
      expect(res.body.data.rating.rating).toBe(4);
      expect(res.body.data.rating.review).toBe('Great movie! Really enjoyed it.');
      expect(res.body.data.rating.userId.toString()).toBe(testUser1.id);
      expect(res.body.data.rating.movieId.toString()).toBe(testMovie._id.toString());
    });

    it('should update existing rating when user rates same movie again', async () => {
      
      await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          movieId: testMovie._id.toString(),
          rating: 3,
          review: 'Initial review',
        });

      
      const updatedRatingData = {
        movieId: testMovie._id.toString(),
        rating: 5,
        review: 'Updated review - much better!',
      };

      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(updatedRatingData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/rating updated successfully/i);
      expect(res.body.data.rating.rating).toBe(5);
      expect(res.body.data.rating.review).toBe('Updated review - much better!');

      
      const totalRatings = await Rating.countDocuments({
        userId: testUser1.id,
        movieId: testMovie._id,
      });
      expect(totalRatings).toBe(1);
    });

    it('should reject rating without authentication', async () => {
      const ratingData = {
        movieId: testMovie._id.toString(),
        rating: 4,
        review: 'Great movie!',
      };

      const res = await request(app)
        .post('/api/ratings')
        .send(ratingData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/access token required/i);
    });

    it('should reject invalid rating values', async () => {
      const invalidRatings = [0, 6, 2.5, -1, 'five'];

      for (const invalidRating of invalidRatings) {
        const res = await request(app)
          .post('/api/ratings')
          .set('Authorization', `Bearer ${authToken1}`)
          .send({
            movieId: testMovie._id.toString(),
            rating: invalidRating,
          });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
      }
    });

    it('should reject rating with invalid movie ID', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          movieId: 'invalid-movie-id',
          rating: 4,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject rating for non-existent movie', async () => {
      const nonExistentMovieId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          movieId: nonExistentMovieId.toString(),
          rating: 4,
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/movie not found/i);
    });
  });

  describe('GET /api/ratings/movie/:movieId/stats - Get Movie Rating Statistics', () => {
    beforeEach(async () => {
      
      await Rating.create([
        { userId: testUser1.id, movieId: testMovie._id, rating: 5, review: 'Excellent!' },
        { userId: testUser2.id, movieId: testMovie._id, rating: 4, review: 'Very good!' },
      ]);
    });

    it('should return movie rating statistics', async () => {
      const res = await request(app)
        .get(`/api/ratings/movie/${testMovie._id}/stats`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.movieId).toBe(testMovie._id.toString());
      expect(res.body.data.averageRating).toBe(4.5);
      expect(res.body.data.totalRatings).toBe(2);
      expect(res.body.data.distribution).toEqual({
        1: 0,
        2: 0,
        3: 0,
        4: 1,
        5: 1,
      });
    });

    it('should return zero statistics for movie with no ratings', async () => {
      const newMovie = new Movie({
        title: 'New Movie',
        description: 'A new movie with no ratings',
        synopsis: 'This movie has no ratings yet.',
        releaseDate: new Date(),
        duration: 90,
        genre: ['Comedy'],
        director: 'New Director',
        poster: 'https://example.com/new-poster.jpg',
        videoUrl: 'https://example.com/new-video.mp4',
        cloudinaryVideoId: 'new_video_id',
        language: 'en',
      });
      await newMovie.save();

      const res = await request(app)
        .get(`/api/ratings/movie/${newMovie._id}/stats`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.averageRating).toBe(0);
      expect(res.body.data.totalRatings).toBe(0);
      expect(res.body.data.distribution).toEqual({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      });
    });
  });

  describe('GET /api/ratings/movie/:movieId/user - Get User Rating', () => {
    it('should return user rating for a movie', async () => {
      
      await Rating.create({
        userId: testUser1.id,
        movieId: testMovie._id,
        rating: 4,
        review: 'Good movie!',
      });

      const res = await request(app)
        .get(`/api/ratings/movie/${testMovie._id}/user`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(4);
      expect(res.body.data.review).toBe('Good movie!');
    });

    it('should return 404 when user has not rated the movie', async () => {
      const res = await request(app)
        .get(`/api/ratings/movie/${testMovie._id}/user`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no rating found/i);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get(`/api/ratings/movie/${testMovie._id}/user`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/ratings/movie/:movieId - Get Movie Ratings with Pagination', () => {
    beforeEach(async () => {
      
      const ratings = [];
      for (let i = 1; i <= 15; i++) {
        const user = new User({
          email: `paginationuser${i}@test.com`,
          password: 'Password1!',
          firstName: `User${i}`,
          lastName: 'Test',
          age: 25,
        });
        await user.save();

        ratings.push({
          userId: user._id,
          movieId: testMovie._id,
          rating: (i % 5) + 1, 
          review: `Review number ${i}`,
        });
      }
      await Rating.create(ratings);
    });

    it('should return paginated movie ratings', async () => {
      const res = await request(app)
        .get(`/api/ratings/movie/${testMovie._id}?page=1&limit=10`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(10);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.pagination.totalItems).toBe(15);
    });

    it('should return second page of ratings', async () => {
      const res = await request(app)
        .get(`/api/ratings/movie/${testMovie._id}?page=2&limit=10`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(5);
      expect(res.body.pagination.currentPage).toBe(2);
    });
  });

  describe('DELETE /api/ratings/movie/:movieId - Delete User Rating', () => {
    it('should delete user rating successfully', async () => {
      
      await Rating.create({
        userId: testUser1.id,
        movieId: testMovie._id,
        rating: 4,
        review: 'Good movie!',
      });

      const res = await request(app)
        .delete(`/api/ratings/movie/${testMovie._id}`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/rating deleted successfully/i);

      
      const rating = await Rating.findOne({
        userId: testUser1.id,
        movieId: testMovie._id,
      });
      expect(rating.isActive).toBe(false);
    });

    it('should return 404 when trying to delete non-existent rating', async () => {
      const res = await request(app)
        .delete(`/api/ratings/movie/${testMovie._id}`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no rating found/i);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .delete(`/api/ratings/movie/${testMovie._id}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/ratings/:ratingId - Update Existing Rating', () => {
    it('debería actualizar una calificación existente por ID', async () => {
      
      const ratingData = {
        movieId: testMovie._id.toString(),
        rating: 3,
        review: 'Buena película, pero podría ser mejor',
      };

      const createRes = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(ratingData);

      const ratingId = createRes.body.data.rating.id;

      
      const updateData = {
        rating: 5,
        review: 'Increíble película! Cambié de opinión después de verla de nuevo.',
      };

      const updateRes = await request(app)
        .put(`/api/ratings/${ratingId}`)
        .set('Authorization', `Bearer ${authToken1}`)
        .send(updateData);

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.message).toMatch(/calificación actualizada exitosamente/i);
      expect(updateRes.body.data.rating.rating).toBe(5);
      expect(updateRes.body.data.rating.review).toBe('Increíble película! Cambié de opinión después de verla de nuevo.');
    });

    it('debería rechazar actualización de calificación que no pertenece al usuario', async () => {
      
      const ratingData = {
        movieId: testMovie._id.toString(),
        rating: 4,
        review: 'Buena película',
      };

      const createRes = await request(app)
        .post('/api/ratings')
        .set('Authorization', `Bearer ${authToken1}`)
        .send(ratingData);

      const ratingId = createRes.body.data.rating.id;

      
      const updateRes = await request(app)
        .put(`/api/ratings/${ratingId}`)
        .set('Authorization', `Bearer ${authToken2}`)
        .send({ rating: 1 });

      expect(updateRes.status).toBe(404);
      expect(updateRes.body.success).toBe(false);
      expect(updateRes.body.message).toMatch(/calificación no encontrada o no pertenece al usuario/i);
    });

    it('debería rechizar actualización con ID de calificación inválido', async () => {
      const updateRes = await request(app)
        .put('/api/ratings/invalid-id')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({ rating: 5 });

      expect(updateRes.status).toBe(400);
      expect(updateRes.body.success).toBe(false);
      expect(updateRes.body.message).toMatch(/formato de id de calificación inválido/i);
    });

    it('debería requerir autenticación para actualizar calificación', async () => {
      const updateRes = await request(app)
        .put('/api/ratings/507f1f77bcf86cd799439011')
        .send({ rating: 5 });

      expect(updateRes.status).toBe(401);
      expect(updateRes.body.success).toBe(false);
    });
  });

  describe('Rating Statistics Integration', () => {
    it('should correctly calculate rating statistics with multiple users', async () => {
     
      const ratings = [
        { userId: testUser1.id, movieId: testMovie._id, rating: 5 },
        { userId: testUser2.id, movieId: testMovie._id, rating: 5 },
      ];

      
      for (let i = 0; i < 3; i++) {
        const user = new User({
          email: `ratinguser${i}@test.com`,
          password: 'Password1!',
          firstName: `RatingUser${i}`,
          lastName: 'Test',
          age: 25,
        });
        await user.save();

        ratings.push({
          userId: user._id,
          movieId: testMovie._id,
          rating: i + 1, 
        });
      }

      await Rating.create(ratings);

      const res = await request(app)
        .get(`/api/ratings/movie/${testMovie._id}/stats`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalRatings).toBe(5);
      
      expect(res.body.data.averageRating).toBe(3.2);
      expect(res.body.data.distribution).toEqual({
        1: 1,
        2: 1,
        3: 1,
        4: 0,
        5: 2,
      });
    });
  });
});