/**
 * Comment controller
 * Handles all comment-related operations including creating, reading, updating, and deleting user comments on movies
 */

import { Request, Response } from "express";
import mongoose from 'mongoose';
import { Comment } from "../models/Comment";
import { Movie } from "../models/Movie";
import { User } from "../models/User";
import { ApiResponse, AuthenticatedRequest, HttpStatusCode, PaginatedResponse } from "../types/api.types";

/**
 * Interface for comment creation request
 */
interface CreateCommentRequest {
  movieId: string;
  content: string;
}

/**
 * Interface for comment update request
 */
interface UpdateCommentRequest {
  content: string;
}

/**
 * Interface for comment query parameters
 */
interface CommentQueryParams {
  page?: string;
  limit?: string;
  movieId?: string;
  userId?: string;
}

/**
 * Create a new comment
 * Handles POST /api/comments
 *
 * @route POST /api/comments
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const createComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = req.userId;
    const { movieId, content }: CreateCommentRequest = req.body;

    if (!authenticatedUserId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Autenticación requerida',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'ID de película inválido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Película no encontrada',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const comment = new Comment({
      userId: authenticatedUserId,
      movieId,
      content: content.trim(),
    });

    const savedComment = await comment.save();
    
    const populatedComment = await Comment.findById(savedComment._id)
      .populate('userId', 'firstName lastName email')
      .populate('movieId', 'title');

    res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: 'Comentario creado exitosamente',
      data: populatedComment,
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Error creating comment:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Error de validación',
        errors: validationErrors,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor al crear comentario',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Get all comments with pagination and filtering
 * Handles GET /api/comments
 *
 * @route GET /api/comments
 * @access Private (Admin only)
 * @param {AuthenticatedRequest} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getAllComments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = req.userId;

    if (!authenticatedUserId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Autenticación requerida',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    if (req.user?.role !== 'admin') {
      res.status(HttpStatusCode.FORBIDDEN).json({
        success: false,
        message: 'Acceso denegado. Se requieren privilegios de administrador',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const { page = '1', limit = '10', movieId, userId }: CommentQueryParams = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const filter: any = { isActive: true };
    
    if (movieId && mongoose.Types.ObjectId.isValid(movieId)) {
      filter.movieId = movieId;
    }
    
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = userId;
    }

    const skip = (pageNum - 1) * limitNum;

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate('userId', 'firstName lastName email')
        .populate('movieId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Comment.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Comentarios recuperados exitosamente',
      data: comments,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      timestamp: new Date().toISOString(),
    } as PaginatedResponse);

  } catch (error: any) {
    console.error('Error getting comments:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor al obtener comentarios',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Get comments for a specific movie
 * Handles GET /api/comments/movie/:movieId
 *
 * @route GET /api/comments/movie/:movieId
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getMovieComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;
    const { page = '1', limit = '10' }: CommentQueryParams = req.query;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'ID de película inválido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Película no encontrada',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const result = await Comment.getMovieComments(movieId, pageNum, limitNum);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Comentarios de película recuperados exitosamente',
      data: result.comments,
      pagination: {
        currentPage: result.page,
        totalPages: result.pages,
        totalItems: result.total,
        itemsPerPage: limitNum,
        hasNextPage: result.page < result.pages,
        hasPrevPage: result.page > 1,
      },
      timestamp: new Date().toISOString(),
    } as PaginatedResponse);

  } catch (error: any) {
    console.error('Error getting movie comments:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor al obtener comentarios de película',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Get user's own comments
 * Handles GET /api/comments/me
 *
 * @route GET /api/comments/me
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getMyComments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = req.userId;
    const { page = '1', limit = '10' }: CommentQueryParams = req.query;

    if (!authenticatedUserId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Autenticación requerida',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const result = await Comment.getUserComments(authenticatedUserId.toString(), pageNum, limitNum);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Mis comentarios recuperados exitosamente',
      data: result.comments,
      pagination: {
        currentPage: result.page,
        totalPages: result.pages,
        totalItems: result.total,
        itemsPerPage: limitNum,
        hasNextPage: result.page < result.pages,
        hasPrevPage: result.page > 1,
      },
      timestamp: new Date().toISOString(),
    } as PaginatedResponse);

  } catch (error: any) {
    console.error('Error getting user comments:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor al obtener comentarios del usuario',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Get a specific comment by ID
 * Handles GET /api/comments/:commentId
 *
 * @route GET /api/comments/:commentId
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getCommentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = req.userId;
    const { commentId } = req.params;

    if (!authenticatedUserId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Autenticación requerida',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'ID de comentario inválido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const comment = await Comment.findOne({
      _id: commentId,
      isActive: true,
    })
      .populate('userId', 'firstName lastName email')
      .populate('movieId', 'title');

    if (!comment) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Comentario no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    if (comment.userId._id.toString() !== authenticatedUserId.toString() && req.user?.role !== 'admin') {
      res.status(HttpStatusCode.FORBIDDEN).json({
        success: false,
        message: 'Solo puedes acceder a tus propios comentarios',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Comentario recuperado exitosamente',
      data: comment,
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Error getting comment by ID:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor al obtener comentario',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Update a comment
 * Handles PUT /api/comments/:commentId
 *
 * @route PUT /api/comments/:commentId
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const updateComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = req.userId;
    const { commentId } = req.params;
    const { content }: UpdateCommentRequest = req.body;

    if (!authenticatedUserId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Autenticación requerida',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'ID de comentario inválido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const comment = await Comment.findOne({
      _id: commentId,
      isActive: true,
    });

    if (!comment) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Comentario no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    if (comment.userId.toString() !== authenticatedUserId.toString()) {
      res.status(HttpStatusCode.FORBIDDEN).json({
        success: false,
        message: 'Solo puedes editar tus propios comentarios',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    comment.content = content.trim();
    const updatedComment = await comment.save();

    const populatedComment = await Comment.findById(updatedComment._id)
      .populate('userId', 'firstName lastName email')
      .populate('movieId', 'title');

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Comentario actualizado exitosamente',
      data: populatedComment,
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Error updating comment:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Error de validación',
        errors: validationErrors,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor al actualizar comentario',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Delete a comment (soft delete)
 * Handles DELETE /api/comments/:commentId
 *
 * @route DELETE /api/comments/:commentId
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const deleteComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authenticatedUserId = req.userId;
    const { commentId } = req.params;

    if (!authenticatedUserId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Autenticación requerida',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'ID de comentario inválido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const comment = await Comment.findOne({
      _id: commentId,
      isActive: true,
    });

    if (!comment) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Comentario no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    if (comment.userId.toString() !== authenticatedUserId.toString() && req.user?.role !== 'admin') {
      res.status(HttpStatusCode.FORBIDDEN).json({
        success: false,
        message: 'Solo puedes eliminar tus propios comentarios',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    comment.isActive = false;
    await comment.save();

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Comentario eliminado exitosamente',
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Error deleting comment:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor al eliminar comentario',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};