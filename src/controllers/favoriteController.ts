/**
 * Favorite controller
 * Handles all favorite-related operations including creating, updating, and retrieving user favorites
 */

import { Request, Response } from "express";
import mongoose from 'mongoose';
import { Favorite } from "../models/favorite";
import { Movie } from "../models/Movie";
import { User } from "../models/User";
import { 
  CreateFavoriteRequest, 
  UpdateFavoriteRequest, 
  FavoriteQueryParams 
} from "../types/favorite.types";
import { ApiResponse, AuthenticatedRequest, HttpStatusCode, PaginatedResponse } from "../types/api.types";

/**
 * Add a movie to favorites
 * Handles POST /api/favorites
 *
 * @route POST /api/favorites
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const addFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = req.userId;
    const { userId, movieId, notes, rating }: CreateFavoriteRequest = req.body;

    if (!authenticatedUserId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Autenticación requerida',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Check if the authenticated user matches the requested userId or is admin
    if (authenticatedUserId !== userId && req.user?.role !== 'admin') {
      res.status(HttpStatusCode.FORBIDDEN).json({
        success: false,
        message: 'Solo puedes gestionar tus propios favoritos',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate required fields
    if (!userId || !movieId) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Se requiere userId y movieId',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(movieId)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Formato de userId o movieId inválido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Check if user exists and is active
    const user = await User.findOne({ _id: userId, isActive: true });
    if (!user) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Usuario no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Check if movie exists and is active
    const movie = await Movie.findOne({ _id: movieId, isActive: true });
    if (!movie) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Película no encontrada',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Check if favorite already exists
    const existingFavorite = await Favorite.findOne({ 
      userId, 
      movieId, 
      isActive: true 
    });

    if (existingFavorite) {
      res.status(HttpStatusCode.CONFLICT).json({
        success: false,
        message: 'Ya en favoritos',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Create new favorite
    const newFavorite = new Favorite({
      userId,
      movieId,
      notes: notes || '',
      rating: rating || undefined,
    });

    await newFavorite.save();

    // Populate movie details for response
    await newFavorite.populate('movieId', 'title poster genre director duration releaseDate');

    res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: 'Añadido a favoritos',
      data: newFavorite,
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Add favorite error:', error);

    // If Mongo duplicate key error occurred (race condition), return 409 Conflict
    if (error && (error.code === 11000 || error.name === 'MongoServerError')) {
      res.status(HttpStatusCode.CONFLICT).json({
        success: false,
        message: 'Ya en favoritos',
        error: 'Duplicate favorite',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to add movie to favorites',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Get user's favorite movies with pagination and filters
 * Handles GET /api/favorites/:userId
 *
 * @route GET /api/favorites/:userId
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getFavoritesByUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = req.userId;
    const { userId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      genre, 
      fromDate, 
      toDate,
      sort = 'createdAt',
      order = 'desc'
    }: FavoriteQueryParams = req.query;

    if (!authenticatedUserId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Autenticación requerida',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Check if the authenticated user matches the requested userId or is admin
    if (authenticatedUserId !== userId && req.user?.role !== 'admin') {
      res.status(HttpStatusCode.FORBIDDEN).json({
        success: false,
        message: 'You can only view your own favorites',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Invalid User ID format',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Build query
    const query: any = { 
      userId,
      isActive: true 
    };

    // Add date filters
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Calculate pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit))); // Max 50 items per page
    const skip = (pageNum - 1) * limitNum;

    // Define sort order
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = { [sort]: sortOrder };

    // Create aggregation pipeline for complex filtering
    const pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: 'movies',
          localField: 'movieId',
          foreignField: '_id',
          as: 'movieDetails'
        }
      },
      { $unwind: '$movieDetails' },
      {
        $match: {
          'movieDetails.isActive': true,
          ...(genre && { 'movieDetails.genre': { $in: [genre] } })
        }
      },
      {
        $project: {
          userId: 1,
          movieId: {
            _id: '$movieDetails._id',
            title: '$movieDetails.title',
            poster: '$movieDetails.poster',
            genre: '$movieDetails.genre',
            director: '$movieDetails.director',
            duration: '$movieDetails.duration',
            releaseDate: '$movieDetails.releaseDate'
          },
          notes: 1,
          rating: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: sortObj },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNum }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ];

    const [result] = await Favorite.aggregate(pipeline);
    const favorites = result.data;
    const totalCount = result.totalCount[0]?.count || 0;

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'User favorites retrieved successfully',
      data: favorites,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage,
      },
      timestamp: new Date().toISOString(),
    } as PaginatedResponse);

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to retrieve favorites',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Update a favorite (notes, rating)
 * Handles PUT /api/favorites/:id
 *
 * @route PUT /api/favorites/:id
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const updateFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = req.userId;
    const { id } = req.params;
    const { notes, rating }: UpdateFavoriteRequest = req.body;

    if (!authenticatedUserId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'User authentication required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate favorite ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Formato de ID de favorito inválido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Find the favorite
    const favorite = await Favorite.findOne({ 
      _id: id, 
      isActive: true 
    });

    if (!favorite) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Favorito no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Check if the authenticated user owns this favorite or is admin
    if (favorite.userId.toString() !== authenticatedUserId && req.user?.role !== 'admin') {
      res.status(HttpStatusCode.FORBIDDEN).json({
        success: false,
        message: 'Solo puedes actualizar tus propios favoritos',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Update fields
    if (notes !== undefined) favorite.notes = notes;
    if (rating !== undefined) favorite.rating = rating;

    await favorite.save();

    // Populate movie details for response
    await favorite.populate('movieId', 'title poster genre director duration releaseDate');

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Favorito actualizado',
      data: favorite,
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error) {
    console.error('Update favorite error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to update favorite',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Remove a movie from favorites (soft delete)
 * Handles DELETE /api/favorites/:id
 *
 * @route DELETE /api/favorites/:id
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const deleteFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = req.userId;
    const { id } = req.params;

    if (!authenticatedUserId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Autenticación requerida',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate favorite ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Formato de ID de favorito inválido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Find the favorite
    const favorite = await Favorite.findOne({ 
      _id: id, 
      isActive: true 
    }).populate('movieId', 'title');

    if (!favorite) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Favorito no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Check if the authenticated user owns this favorite or is admin
    if (favorite.userId.toString() !== authenticatedUserId && req.user?.role !== 'admin') {
      res.status(HttpStatusCode.FORBIDDEN).json({
        success: false,
        message: 'Solo puedes eliminar tus propios favoritos',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Soft delete: mark as inactive
    favorite.isActive = false;
    await favorite.save();

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Eliminado de favoritos',
      data: {
        deletedFavoriteId: favorite._id,
        movieTitle: (favorite.movieId as any)?.title || 'Unknown Movie'
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error) {
    console.error('Delete favorite error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to remove movie from favorites',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Get all favorites in the system (admin only)
 * Handles GET /api/favorites
 *
 * @route GET /api/favorites
 * @access Private (admin only)
 * @param {AuthenticatedRequest} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getAllFavorites = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = req.userId;
    const { 
      page = 1, 
      limit = 10, 
      genre, 
      fromDate, 
      toDate,
      sort = 'createdAt',
      order = 'desc'
    }: FavoriteQueryParams = req.query;

    if (!authenticatedUserId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Autenticación requerida',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Only admins can access all favorites
    if (req.user?.role !== 'admin') {
      res.status(HttpStatusCode.FORBIDDEN).json({
        success: false,
        message: 'Acceso de administrador requerido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Build query for all active favorites
    const query: any = { 
      isActive: true 
    };

    // Add date filters
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Calculate pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit))); // Max 50 items per page
    const skip = (pageNum - 1) * limitNum;

    // Define sort order
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = { [sort]: sortOrder };

    // Create aggregation pipeline for complex filtering
    const pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $lookup: {
          from: 'movies',
          localField: 'movieId',
          foreignField: '_id',
          as: 'movieDetails'
        }
      },
      { $unwind: '$userDetails' },
      { $unwind: '$movieDetails' },
      {
        $match: {
          'movieDetails.isActive': true,
          'userDetails.isActive': true,
          ...(genre && { 'movieDetails.genre': { $in: [genre] } })
        }
      },
      {
        $project: {
          userId: {
            _id: '$userDetails._id',
            username: '$userDetails.username',
            firstName: '$userDetails.firstName',
            lastName: '$userDetails.lastName'
          },
          movieId: {
            _id: '$movieDetails._id',
            title: '$movieDetails.title',
            poster: '$movieDetails.poster',
            genre: '$movieDetails.genre',
            director: '$movieDetails.director',
            duration: '$movieDetails.duration',
            releaseDate: '$movieDetails.releaseDate'
          },
          notes: 1,
          rating: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: sortObj },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNum }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ];

    const [result] = await Favorite.aggregate(pipeline);
    const favorites = result.data;
    const totalCount = result.totalCount[0]?.count || 0;

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Todos los favoritos recuperados exitosamente',
      data: favorites,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage,
      },
      timestamp: new Date().toISOString(),
    } as PaginatedResponse);

  } catch (error) {
    console.error('Get all favorites error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'No se pudieron recuperar los favoritos',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Get authenticated user's favorite movies with pagination and filters
 * Handles GET /api/favorites/me
 *
 * @route GET /api/favorites/me
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getMyFavorites = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = req.userId;
    const { 
      page = 1, 
      limit = 10, 
      genre, 
      fromDate, 
      toDate,
      sort = 'createdAt',
      order = 'desc'
    }: FavoriteQueryParams = req.query;

    if (!authenticatedUserId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Autenticación requerida',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Build query for the authenticated user's favorites
    const query: any = { 
      userId: authenticatedUserId,
      isActive: true 
    };

    // Add date filters
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Calculate pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit))); // Max 50 items per page
    const skip = (pageNum - 1) * limitNum;

    // Define sort order
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = { [sort]: sortOrder };

    // Create aggregation pipeline for complex filtering
    const pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: 'movies',
          localField: 'movieId',
          foreignField: '_id',
          as: 'movieDetails'
        }
      },
      { $unwind: '$movieDetails' },
      {
        $match: {
          'movieDetails.isActive': true,
          ...(genre && { 'movieDetails.genre': { $in: [genre] } })
        }
      },
      {
        $project: {
          userId: 1,
          movieId: {
            _id: '$movieDetails._id',
            title: '$movieDetails.title',
            poster: '$movieDetails.poster',
            genre: '$movieDetails.genre',
            director: '$movieDetails.director',
            duration: '$movieDetails.duration',
            releaseDate: '$movieDetails.releaseDate'
          },
          notes: 1,
          rating: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: sortObj },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNum }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ];

    const [result] = await Favorite.aggregate(pipeline);
    const favorites = result.data;
    const totalCount = result.totalCount[0]?.count || 0;

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Mis favoritos recuperados exitosamente',
      data: favorites,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage,
      },
      timestamp: new Date().toISOString(),
    } as PaginatedResponse);

  } catch (error) {
    console.error('Get my favorites error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'No se pudieron recuperar tus favoritos',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Get a specific favorite of the authenticated user
 * Handles GET /api/favorites/me/:favoriteId
 *
 * @route GET /api/favorites/me/:favoriteId
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getMyFavoriteById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = req.userId;
    const { favoriteId } = req.params;

    if (!authenticatedUserId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Autenticación requerida',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate favorite ID format
    if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Formato de ID de favorito inválido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Find the favorite belonging to the authenticated user
    const favorite = await Favorite.findOne({ 
      _id: favoriteId,
      userId: authenticatedUserId,
      isActive: true 
    }).populate('movieId', 'title poster genre director duration releaseDate');

    if (!favorite) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Favorito no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Favorito recuperado exitosamente',
      data: favorite,
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error) {
    console.error('Get my favorite by ID error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'No se pudo recuperar el favorito',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

