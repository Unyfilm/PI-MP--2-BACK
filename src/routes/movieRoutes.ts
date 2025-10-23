/**
 * Movie routes definition
 */

import { Router } from 'express';
import { 
  getMovies, 
  getMovieById, 
  searchMovies, 
  getTrendingMovies, 
  createMovie, 
  updateMovie, 
  deleteMovie,
  getMovieVideo,
  getMovieVideoInfo
} from '../controllers/movieController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateMovieCreation, validateMovieUpdate } from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/movies
 * @desc    Get all movies with pagination and filters
 * @access  Public
 */
router.get('/', getMovies);

/**
 * @route   GET /api/movies/search
 * @desc    Search movies by query
 * @access  Public
 */
router.get('/search', searchMovies);

/**
 * @route   GET /api/movies/trending
 * @desc    Get trending movies
 * @access  Public
 */
router.get('/trending', getTrendingMovies);

/**
 * @route   GET /api/movies/:id
 * @desc    Get movie by ID
 * @access  Public
 */
router.get('/:id', getMovieById);

/**
 * @route   GET /api/movies/:id/video
 * @desc    Get movie video URL (signed URL from Cloudinary)
 * @access  Public
 */
router.get('/:id/video', getMovieVideo);

/**
 * @route   GET /api/movies/:id/video/info
 * @desc    Get movie video info (duration, dimensions, etc.)
 * @access  Public
 */
router.get('/:id/video/info', getMovieVideoInfo);

/**
 * @route   POST /api/movies
 * @desc    Create new movie (Admin only)
 * @access  Private/Admin
 */
router.post('/', authenticateToken, requireAdmin, validateMovieCreation, createMovie);

/**
 * @route   PUT /api/movies/:id
 * @desc    Update movie (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', authenticateToken, requireAdmin, validateMovieUpdate, updateMovie);

/**
 * @route   DELETE /api/movies/:id
 * @desc    Delete movie (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authenticateToken, requireAdmin, deleteMovie);

export default router;