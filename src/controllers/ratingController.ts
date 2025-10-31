
import { Request, Response } from 'express';
import { Rating } from '../models/Rating';
import { Movie } from '../models/Movie';
import { User } from '../models/User';
import { 
  CreateRatingRequest, 
  UpdateRatingRequest, 
  MovieRatingStats,
  RatingQueryParams 
} from '../types/rating.types';
import { ApiResponse, AuthenticatedRequest, HttpStatusCode } from '../types/api.types';
import mongoose from 'mongoose';


export const createOrUpdateRating = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { movieId, rating, review }: CreateRatingRequest = req.body;

    if (!userId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'User authentication required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    if (!movieId || !rating) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Movie ID and rating are required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Invalid movie ID format',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const movie = await Movie.findOne({ _id: movieId, isActive: true });
    if (!movie) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Movie not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const user = await User.findOne({ _id: userId, isActive: true });
    if (!user) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    let existingRating = await Rating.findOne({ userId, movieId });

    if (existingRating) {
      
      existingRating.rating = rating;
      existingRating.review = review || '';
      existingRating.isActive = true; 
      existingRating.updatedAt = new Date();
      await existingRating.save();

      
      const stats = await Rating.calculateMovieStats(movieId);
      await Movie.findByIdAndUpdate(movieId, { rating: stats });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: 'Rating updated successfully',
        data: {
          rating: {
            id: existingRating._id,
            userId: existingRating.userId,
            movieId: existingRating.movieId,
            rating: existingRating.rating,
            review: existingRating.review,
            createdAt: existingRating.createdAt,
            updatedAt: existingRating.updatedAt,
          },
          movieStats: stats,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } else {
      
      const newRating = new Rating({
        userId,
        movieId,
        rating,
        review: review || '',
        isActive: true, 
      });

      await newRating.save();

      
      const stats = await Rating.calculateMovieStats(movieId);
      await Movie.findByIdAndUpdate(movieId, { rating: stats });

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: 'Rating created successfully',
        data: {
          rating: {
            id: newRating._id,
            userId: newRating.userId,
            movieId: newRating.movieId,
            rating: newRating.rating,
            review: newRating.review,
            createdAt: newRating.createdAt,
            updatedAt: newRating.updatedAt,
          },
          movieStats: stats,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  } catch (error: any) {
    console.error('Create/Update rating error:', error);
    
    
    if (error.code === 11000 && error.keyPattern?.userId && error.keyPattern?.movieId) {
      res.status(HttpStatusCode.CONFLICT).json({
        success: false,
        message: 'Ya existe una calificación para esta película',
        error: 'Conflicto de duplicado: Ya has calificado esta película',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }
    
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Falló crear o actualizar la calificación',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};


export const updateRating = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { ratingId } = req.params;
    const { rating, review }: UpdateRatingRequest = req.body;

    if (!userId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Autenticación de usuario requerida',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

   
    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Formato de ID de calificación inválido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const existingRating = await Rating.findOne({ 
      _id: ratingId, 
      userId, 
      isActive: true 
    });

    if (!existingRating) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Calificación no encontrada o no pertenece al usuario',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const movie = await Movie.findOne({ _id: existingRating.movieId, isActive: true });
    if (!movie) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Película no encontrada',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    if (rating !== undefined) existingRating.rating = rating;
    if (review !== undefined) existingRating.review = review;
    existingRating.updatedAt = new Date();

    await existingRating.save();

    
    const stats = await Rating.calculateMovieStats(existingRating.movieId.toString());
    await Movie.findByIdAndUpdate(existingRating.movieId, { rating: stats });

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Calificación actualizada exitosamente',
      data: {
        rating: {
          id: existingRating._id,
          userId: existingRating.userId,
          movieId: existingRating.movieId,
          rating: existingRating.rating,
          review: existingRating.review,
          createdAt: existingRating.createdAt,
          updatedAt: existingRating.updatedAt,
        },
        movieStats: stats,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Error al actualizar calificación:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Falló la actualización de la calificación',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};


export const getMovieRatingStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;

    
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Invalid movie ID format',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const movie = await Movie.findOne({ _id: movieId, isActive: true });
    if (!movie) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Movie not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const stats = await Rating.calculateMovieStats(movieId);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Movie rating statistics retrieved successfully',
      data: {
        movieId,
        averageRating: stats.average,
        totalRatings: stats.count,
        distribution: stats.distribution,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Get movie rating stats error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to retrieve movie rating statistics',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};


export const getUserMovieRating = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { movieId } = req.params;

    if (!userId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'User authentication required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Invalid movie ID format',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const rating = await Rating.findOne({ userId, movieId, isActive: true });

    if (!rating) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'No rating found for this movie',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'User rating retrieved successfully',
      data: {
        id: rating._id,
        userId: rating.userId,
        movieId: rating.movieId,
        rating: rating.rating,
        review: rating.review,
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Get user movie rating error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to retrieve user rating',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};


export const getMovieRatings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' }: RatingQueryParams = req.query;

    
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Invalid movie ID format',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const movie = await Movie.findOne({ _id: movieId, isActive: true });
    if (!movie) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Movie not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder;

   
    const ratings = await Rating.find({ movieId, isActive: true })
      .populate('userId', 'firstName lastName username profilePicture')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    
    const totalRatings = await Rating.countDocuments({ movieId, isActive: true });
    const totalPages = Math.ceil(totalRatings / limitNumber);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Movie ratings retrieved successfully',
      data: ratings.map((rating: any) => ({
        id: rating._id,
        rating: rating.rating,
        review: rating.review,
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt,
        user: {
          id: rating.userId._id,
          firstName: rating.userId.firstName,
          lastName: rating.userId.lastName,
          username: rating.userId.username,
          profilePicture: rating.userId.profilePicture,
        },
      })),
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems: totalRatings,
        itemsPerPage: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Get movie ratings error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to retrieve movie ratings',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};


export const deleteUserRating = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { movieId } = req.params;

    if (!userId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'User authentication required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Invalid movie ID format',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const rating = await Rating.findOne({ userId, movieId, isActive: true });

    if (!rating) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'No rating found for this movie',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    rating.isActive = false;
    await rating.save();

    
    const stats = await Rating.calculateMovieStats(movieId);
    await Movie.findByIdAndUpdate(movieId, { rating: stats });

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Rating deleted successfully',
      data: {
        movieStats: stats,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Delete user rating error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to delete rating',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};