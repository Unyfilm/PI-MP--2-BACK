/**
 * Favorite related type definitions and interfaces
 */

import { Document } from 'mongoose';
import { PaginationQuery } from './api.types';

/**
 * Favorite interface for database document
 */
export interface IFavorite extends Document {
  _id: string;
  userId: string;
  movieId: string;
  notes?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Favorite creation request interface
 */
export interface CreateFavoriteRequest {
  userId: string;
  movieId: string;
  notes?: string;
  rating?: number;
}

/**
 * Favorite update request interface
 */
export interface UpdateFavoriteRequest {
  notes?: string;
  rating?: number;
}

/**
 * Favorite query parameters interface
 */
export interface FavoriteQueryParams extends PaginationQuery {
  genre?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * Favorite response interface
 */
export interface FavoriteResponse {
  _id: string;
  userId: string;
  movieId: {
    _id: string;
    title: string;
    poster: string;
    genre: string[];
    director: string;
    duration: number;
    releaseDate: Date;
  };
  notes?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}