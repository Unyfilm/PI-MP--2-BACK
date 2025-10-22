import express from "express";
import {
  addFavorite,
  getFavoritesByUser,
  deleteFavorite,
  updateFavorite,
} from "../controllers/favoriteController";

const router = express.Router();

// Crear un nuevo favorito
router.post("/", addFavorite);

//Obtener los favoritos de un usuario
router.get("/:userId", getFavoritesByUser);

//Eliminar un favorito por su ID
router.delete("/:id", deleteFavorite);

// Actualizar un favorito (opcional)
router.put("/:id", updateFavorite);

export default router;
