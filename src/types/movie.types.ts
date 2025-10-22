/**
 * Movie related type definitions and interfaces
 */

import { Document } from 'mongoose';

/**
 * Movie interface for database document
 */
export interface IMovie extends Document {
  _id: string;
  title: string;
  description: string;
  synopsis: string;
  releaseDate: Date;
  duration: number; // in minutes
  genre: string[];
  director: string;
  cast: string[];
  poster: string;
  trailer: string;
  videoUrl: string;
  cloudinaryVideoId: string;
  thumbnails: string[];
  rating: MovieRating;
  language: string;
  subtitles: SubtitleTrack[];
  tags: string[];
  isActive: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Movie rating interface
 */
export interface MovieRating {
  average: number;
  count: number;
  distribution: RatingDistribution;
}

/**
 * Rating distribution interface
 */
export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

/**
 * Subtitle track interface
 */
export interface SubtitleTrack {
  language: string;
  languageCode: string;
  url: string;
  isDefault: boolean;
}

/**
 * Movie creation request interface
 */
export interface CreateMovieRequest {
  title: string;
  description: string;
  synopsis: string;
  releaseDate: string;
  duration: number;
  genre: string[];
  director: string;
  cast: string[];
  poster: string;
  trailer: string;
  videoUrl: string;
  cloudinaryVideoId: string;
  language: string;
  tags: string[];
}

/**
 * Movie update request interface
 */
export interface UpdateMovieRequest {
  title?: string;
  description?: string;
  synopsis?: string;
  releaseDate?: string;
  duration?: number;
  genre?: string[];
  director?: string;
  cast?: string[];
  poster?: string;
  trailer?: string;
  videoUrl?: string;
  cloudinaryVideoId?: string;
  language?: string;
  tags?: string[];
  isActive?: boolean;
}

/**
 * Movie search filters interface
 */
export interface MovieSearchFilters {
  genre?: string[];
  releaseYear?: number;
  minRating?: number;
  language?: string;
  director?: string;
  sortBy?: MovieSortBy;
  sortOrder?: SortOrder;
}

/**
 * Movie sorting options enumeration
 */
export enum MovieSortBy {
  TITLE = 'title',
  RELEASE_DATE = 'releaseDate',
  RATING = 'rating.average',
  VIEWS = 'views',
  CREATED_AT = 'createdAt',
}

/**
 * Sort order enumeration
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}