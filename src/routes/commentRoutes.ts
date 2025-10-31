
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

const validateCommentUpdate = [
  body('content')
    .notEmpty()
    .withMessage('El contenido del comentario es requerido')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El comentario debe tener entre 1 y 200 caracteres'),
  
  handleValidationErrors,
];

const validateCommentId = [
  param('commentId')
    .isMongoId()
    .withMessage('El ID del comentario debe ser un ObjectId válido'),
  
  handleValidationErrors,
];
const validateMovieId = [
  param('movieId')
    .isMongoId()
    .withMessage('El ID de la película debe ser un ObjectId válido'),
  
  handleValidationErrors,
];
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
router.post("/", authenticateToken, validateCommentCreation, createComment);
router.get("/", authenticateToken, requireAdmin, validatePagination, getAllComments);
router.get("/me", authenticateToken, validatePagination, getMyComments);
router.get("/public/movie/:movieId", validateMovieId, validatePagination, getMovieComments);
router.get("/movie/:movieId", authenticateToken, validateMovieId, validatePagination, getMovieComments);
router.get("/:commentId", authenticateToken, validateCommentId, getCommentById);
router.put("/:commentId", authenticateToken, validateCommentId, validateCommentUpdate, updateComment);
router.delete("/:commentId", authenticateToken, validateCommentId, deleteComment);

export default router;