import { Request, Response } from 'express';
import { Favorite } from '../models/favorite';

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { userId, movieId } = req.body;

    if (!userId || !movieId) {
      return res.status(400).json({ message: 'userId y movieId son requeridos.' });
    }

    // Verificar si ya existe
    const existingFavorite = await Favorite.findOne({ userId, movieId });
    if (existingFavorite) {
      return res.status(409).json({ message: 'La película ya está en favoritos.' });
    }

    const newFavorite = await Favorite.create({ userId, movieId });
    return res.status(201).json({
      message: 'Película añadida a favoritos.',
      favorite: newFavorite,
    });
  } catch (error) {
    console.error('Error al añadir favorito:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};


