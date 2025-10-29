/**
 * Comment routes definition
 */

import express from "express";
import {
  createComment,
  getAllComments,
  getMovieComments,
  getMyComments,
  getCommentById,
  updateComment,
  deleteComment,
} from "../controllers/commentController";
import { authenticateToken, requireAdmin, optionalAuth } from "../middleware/auth";
import { body, param, query } from "express-validator";
import { handleValidationErrors } from "../middleware/validation";

const router = express.Router();

/**
 * Validation middleware for comment creation
 */
const validateCommentCreation = [
  body('movieId')
    .notEmpty()
    .withMessage('El ID de la película es requerido')
    .isMongoId()
    .withMessage('El ID de la película debe ser un ObjectId válido'),
  
  body('content')
    .notEmpty()
    .withMessage('El contenido del comentario es requerido')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El comentario debe tener entre 1 y 200 caracteres'),
  
  handleValidationErrors,
];

/**
 * Validation middleware for comment update
 */
const validateCommentUpdate = [
  body('content')
    .notEmpty()
    .withMessage('El contenido del comentario es requerido')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El comentario debe tener entre 1 y 200 caracteres'),
  
  handleValidationErrors,
];

/**
 * Validation middleware for comment ID parameter
 */
const validateCommentId = [
  param('commentId')
    .isMongoId()
    .withMessage('El ID del comentario debe ser un ObjectId válido'),
  
  handleValidationErrors,
];

/**
 * Validation middleware for movie ID parameter
 */
const validateMovieId = [
  param('movieId')
    .isMongoId()
    .withMessage('El ID de la película debe ser un ObjectId válido'),
  
  handleValidationErrors,
];

/**
 * Validation middleware for pagination query parameters
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe ser un número entero entre 1 y 50'),
  
  handleValidationErrors,
];

/**
 * @route   POST /api/comments
 * @desc    Create a new comment on a movie
 * @access  Private (authenticated users only)
 */
router.post("/", authenticateToken, validateCommentCreation, createComment);

/**
 * @route   GET /api/comments
 * @desc    Get all comments in the system with pagination and filtering (admin only)
 * @access  Private (admin only)
 */
router.get("/", authenticateToken, requireAdmin, validatePagination, getAllComments);

/**
 * @route   GET /api/comments/me
 * @desc    Get authenticated user's comments with pagination
 * @access  Private (authenticated users only)
 */
router.get("/me", authenticateToken, validatePagination, getMyComments);

/**
 * @route   GET /api/comments/public/movie/:movieId
 * @desc    Get all comments for a specific movie without authentication (public access)
 * @access  Public
 */
router.get("/public/movie/:movieId", validateMovieId, validatePagination, getMovieComments);

/**
 * @route   GET /api/comments/movie/:movieId
 * @desc    Get all comments for a specific movie (authenticated users - MAIN ENDPOINT)
 * @access  Private (authenticated users only)
 */
router.get("/movie/:movieId", authenticateToken, validateMovieId, validatePagination, getMovieComments);

/**
 * @route   GET /api/comments/:commentId
 * @desc    Get a specific comment by ID
 * @access  Private (comment owner or admin)
 */
router.get("/:commentId", authenticateToken, validateCommentId, getCommentById);

/**
 * @route   PUT /api/comments/:commentId
 * @desc    Update a comment
 * @access  Private (comment owner only)
 */
router.put("/:commentId", authenticateToken, validateCommentId, validateCommentUpdate, updateComment);

/**
 * @route   DELETE /api/comments/:commentId
 * @desc    Delete a comment (soft delete)
 * @access  Private (comment owner or admin)
 */
router.delete("/:commentId", authenticateToken, validateCommentId, deleteComment);

export default router;