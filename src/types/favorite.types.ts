
import { Document } from 'mongoose';
import { PaginationQuery } from './api.types';


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

export interface CreateFavoriteRequest {
  userId: string;
  movieId: string;
  notes?: string;
  rating?: number;
}

export interface UpdateFavoriteRequest {
  notes?: string;
  rating?: number;
}


export interface FavoriteQueryParams extends PaginationQuery {
  genre?: string;
  fromDate?: string;
  toDate?: string;
}


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