/**
 * Favorite routes definition
 */

import express from "express";
import {
  addFavorite,
  getAllFavorites,
  getMyFavorites,
  getMyFavoriteById,
  getFavoritesByUser,
  deleteFavorite,
  updateFavorite,
} from "../controllers/favoriteController";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { validateFavoriteCreation, validateFavoriteUpdate } from "../middleware/validation";

const router = express.Router();

/**
 * @route   GET /api/favorites
 * @desc    Get all favorites in the system (admin only)
 * @access  Private (admin only)
 */
router.get("/", authenticateToken, requireAdmin, getAllFavorites);

/**
 * @route   GET /api/favorites/me
 * @desc    Get authenticated user's favorite movies with pagination and filters
 * @access  Private (authenticated users only)
 */
router.get("/me", authenticateToken, getMyFavorites);

/**
 * @route   GET /api/favorites/me/:favoriteId
 * @desc    Get a specific favorite of the authenticated user
 * @access  Private (authenticated users only)
 */
router.get("/me/:favoriteId", authenticateToken, getMyFavoriteById);

/**
 * @route   POST /api/favorites
 * @desc    Add a movie to favorites
 * @access  Private (authenticated users only)
 */
router.post("/", authenticateToken, validateFavoriteCreation, addFavorite);

/**
 * @route   GET /api/favorites/:userId
 * @desc    Get user's favorite movies with pagination and filters
 * @access  Private (authenticated users only)
 */
router.get("/:userId", authenticateToken, getFavoritesByUser);

/**
 * @route   PUT /api/favorites/:id
 * @desc    Update a favorite (notes, rating)
 * @access  Private (authenticated users only)
 */
router.put("/:id", authenticateToken, validateFavoriteUpdate, updateFavorite);

/**
 * @route   DELETE /api/favorites/:id
 * @desc    Remove a movie from favorites
 * @access  Private (authenticated users only)
 */
router.delete("/:id", authenticateToken, deleteFavorite);

export default router;
