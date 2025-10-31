
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


router.get('/', getMovies);

router.get('/search', searchMovies);


router.get('/trending', getTrendingMovies);

router.get('/:id', getMovieById);


router.get('/:id/video', getMovieVideo);


router.get('/:id/video/info', getMovieVideoInfo);


router.post('/', authenticateToken, requireAdmin, validateMovieCreation, createMovie);


router.put('/:id', authenticateToken, requireAdmin, validateMovieUpdate, updateMovie);


router.delete('/:id', authenticateToken, requireAdmin, deleteMovie);

export default router;