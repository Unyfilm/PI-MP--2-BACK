import { Request, Response } from "express";
import { Favorite } from "../models/favorite"; // ✅ mantienes tu importación

// ======================
// CREATE - Añadir favorito
// ======================
export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { userId, movieId } = req.body;

    if (!userId || !movieId) {
      return res
        .status(400)
        .json({ message: "userId y movieId son requeridos." });
    }

    // Verificar si ya existe
    const existingFavorite = await Favorite.findOne({ userId, movieId });
    if (existingFavorite) {
      return res
        .status(409)
        .json({ message: "La película ya está en favoritos." });
    }

    const newFavorite = await Favorite.create({ userId, movieId });
    return res.status(201).json({
      message: "Película añadida a favoritos.",
      favorite: newFavorite,
    });
  } catch (error) {
    console.error("Error al añadir favorito:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// ======================
// READ - Obtener favoritos por usuario
// ======================
export const getFavoritesByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const favorites = await Favorite.find({ userId }).populate("movieId");
    return res.status(200).json(favorites);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return res.status(500).json({ message: "Error al obtener favoritos." });
  }
};

// ======================
// DELETE - Eliminar un favorito
// ======================
export const deleteFavorite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedFavorite = await Favorite.findByIdAndDelete(id);
    if (!deletedFavorite) {
      return res.status(404).json({ message: "Favorito no encontrado." });
    }

    return res
      .status(200)
      .json({ message: "Película eliminada de favoritos." });
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// ======================
// ACTTUALIZAR - Modificar favorito
// ======================
export const updateFavorite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedFavorite = await Favorite.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedFavorite) {
      return res.status(404).json({ message: "Favorito no encontrado." });
    }

    return res.status(200).json({
      message: "Favorito actualizado correctamente.",
      favorite: updatedFavorite,
    });
  } catch (error) {
    console.error("Error al actualizar favorito:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

