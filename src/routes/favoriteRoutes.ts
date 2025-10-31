

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


router.get("/", authenticateToken, requireAdmin, getAllFavorites);


router.get("/me", authenticateToken, getMyFavorites);


router.get("/me/:favoriteId", authenticateToken, getMyFavoriteById);


router.post("/", authenticateToken, validateFavoriteCreation, addFavorite);


router.get("/:userId", authenticateToken, getFavoritesByUser);


router.put("/:id", authenticateToken, validateFavoriteUpdate, updateFavorite);


router.delete("/:id", authenticateToken, deleteFavorite);

export default router;
