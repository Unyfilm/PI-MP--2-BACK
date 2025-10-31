
import { Document } from 'mongoose';


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


export interface CreateRatingRequest {
  movieId: string;
  rating: number; 
  review?: string; 
}

export interface UpdateRatingRequest {
  rating?: number; 
  review?: string; 
}


export interface RatingResponse {
  id: string;
  userId: string;
  movieId: string;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
}


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


export interface RatingQueryParams {
  page?: number;
  limit?: number;
  movieId?: string;
  userId?: string;
  rating?: number;
  sortBy?: 'createdAt' | 'rating' | 'updatedAt';
  order?: 'asc' | 'desc';
}