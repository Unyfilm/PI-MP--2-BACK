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


router.post('/', authenticateToken, validateRatingCreation, createOrUpdateRating);


router.put('/:ratingId', authenticateToken, validateRatingUpdate, updateRating);


router.get('/movie/:movieId/stats', getMovieRatingStats);


router.get('/movie/:movieId/user', authenticateToken, getUserMovieRating);


router.get('/movie/:movieId', getMovieRatings);


router.delete('/movie/:movieId', authenticateToken, deleteUserRating);

export default router;