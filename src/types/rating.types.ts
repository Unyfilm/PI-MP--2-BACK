/**
 * Rating related type definitions and interfaces
 */

import { Document } from 'mongoose';

/**
 * Rating interface for database document
 * Represents an individual user rating for a movie
 */
export interface IRating extends Document {
  _id: string;
  userId: string;
  movieId: string;
  rating: number; 
  review: string; 
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  validateRating(): boolean;
}

/**
 * Rating creation request interface
 */
export interface CreateRatingRequest {
  movieId: string;
  rating: number; 
  review?: string;
}

/**
 * Rating update request interface
 */
export interface UpdateRatingRequest {
  rating?: number; 
  review?: string;
}

/**
 * Rating response interface for API responses
 */
export interface RatingResponse {
  id: string;
  userId: string;
  movieId: string;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Movie rating statistics interface
 */
export interface MovieRatingStats {
  average: number;
  count: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * User rating with movie details interface
 */
export interface UserRatingWithMovie {
  id: string;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
  movie: {
    id: string;
    title: string;
    poster: string;
    releaseDate: Date;
  };
}

/**
 * Rating query parameters interface
 */
export interface RatingQueryParams {
  page?: number;
  limit?: number;
  movieId?: string;
  userId?: string;
  rating?: number;
  sortBy?: 'createdAt' | 'rating' | 'updatedAt';
  order?: 'asc' | 'desc';
}