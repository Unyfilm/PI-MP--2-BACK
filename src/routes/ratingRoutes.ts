/**
 * Rating routes definition
 */

import { Router } from 'express';
import { 
  createOrUpdateRating,
  updateRating,
  getMovieRatingStats,
  getUserMovieRating,
  getMovieRatings,
  deleteUserRating
} from '../controllers/ratingController';
import { authenticateToken } from '../middleware/auth';
import { validateRatingCreation, validateRatingUpdate } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/ratings
 * @desc    Create or update a movie rating
 * @access  Private (authenticated users only)
 */
router.post('/', authenticateToken, validateRatingCreation, createOrUpdateRating);

/**
 * @route   PUT /api/ratings/:ratingId
 * @desc    Update an existing movie rating by rating ID
 * @access  Private (authenticated users only)
 */
router.put('/:ratingId', authenticateToken, validateRatingUpdate, updateRating);

/**
 * @route   GET /api/ratings/movie/:movieId/stats
 * @desc    Get rating statistics for a movie (average, count, distribution)
 * @access  Public
 */
router.get('/movie/:movieId/stats', getMovieRatingStats);

/**
 * @route   GET /api/ratings/movie/:movieId/user
 * @desc    Get current user's rating for a specific movie
 * @access  Private (authenticated users only)
 */
router.get('/movie/:movieId/user', authenticateToken, getUserMovieRating);

/**
 * @route   GET /api/ratings/movie/:movieId
 * @desc    Get all ratings for a movie with pagination
 * @access  Public
 */
router.get('/movie/:movieId', getMovieRatings);

/**
 * @route   DELETE /api/ratings/movie/:movieId
 * @desc    Delete current user's rating for a movie
 * @access  Private (authenticated users only)
 */
router.delete('/movie/:movieId', authenticateToken, deleteUserRating);

export default router;