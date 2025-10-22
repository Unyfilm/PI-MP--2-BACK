import express from 'express';
import { addFavorite } from '../controllers/favoriteController';

const router = express.Router();

// POST /api/favorites
router.post('/', addFavorite);

export default router;
