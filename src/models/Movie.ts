/**
 * Movie model definition for MongoDB
 */

import mongoose, { Schema } from 'mongoose';
import { 
  IMovie, 
  MovieRating, 
  RatingDistribution, 
  SubtitleTrack, 
  MovieSortBy 
} from '../types/movie.types';

/**
 * Rating distribution schema
 */
const ratingDistributionSchema = new Schema<RatingDistribution>({
  1: { type: Number, default: 0 },
  2: { type: Number, default: 0 },
  3: { type: Number, default: 0 },
  4: { type: Number, default: 0 },
  5: { type: Number, default: 0 },
}, { _id: false });

/**
 * Movie rating schema
 */
const movieRatingSchema = new Schema<MovieRating>({
  average: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  count: {
    type: Number,
    min: 0,
    default: 0,
  },
  distribution: {
    type: ratingDistributionSchema,
    default: () => ({}),
  },
}, { _id: false });

/**
 * Subtitle track schema
 */
const subtitleTrackSchema = new Schema<SubtitleTrack>({
  language: {
    type: String,
    required: true,
    trim: true,
  },
  languageCode: {
    type: String,
    required: true,
    match: [/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid language code format'],
  },
  url: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

/**
 * Movie schema definition
 */
const movieSchema = new Schema<IMovie>({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Movie description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  synopsis: {
    type: String,
    required: [true, 'Movie synopsis is required'],
    trim: true,
    maxlength: [2000, 'Synopsis cannot exceed 2000 characters'],
  },
  releaseDate: {
    type: Date,
    required: [true, 'Release date is required'],
  },
  duration: {
    type: Number,
    required: [true, 'Movie duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
  },
  genre: [{
    type: String,
    required: true,
    trim: true,
  }],
  director: {
    type: String,
    required: [true, 'Director is required'],
    trim: true,
    maxlength: [100, 'Director name cannot exceed 100 characters'],
  },
  cast: [{
    type: String,
    trim: true,
    maxlength: [100, 'Cast member name cannot exceed 100 characters'],
  }],
  poster: {
    type: String,
    required: [true, 'Poster image URL is required'],
  },
  port: {
    type: String,
    default: '',
  },
  trailer: {
    type: String,
    default: '',
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
  },
  cloudinaryVideoId: {
    type: String,
    required: [true, 'Cloudinary video ID is required'],
    trim: true,
  },
  thumbnails: [{
    type: String,
  }],
  rating: {
    type: movieRatingSchema,
    default: () => ({}),
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    default: 'en',
  },
  subtitles: [subtitleTrackSchema],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    min: 0,
    default: 0,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

/**
 * Indexes for better query performance
 */
movieSchema.index({ title: 'text', description: 'text', synopsis: 'text' });
movieSchema.index({ genre: 1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ 'rating.average': -1 });
movieSchema.index({ views: -1 });
movieSchema.index({ isActive: 1 });

/**
 * Virtual for formatted duration
 */
movieSchema.virtual('formattedDuration').get(function(this: any) {
  if (!this.duration || this.duration <= 0) {
    return 'N/A';
  }
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

/**
 * Virtual for release year
 */
movieSchema.virtual('releaseYear').get(function(this: any) {
  return this.releaseDate ? this.releaseDate.getFullYear() : null;
});

/**
 * Static method to get trending movies
 */
movieSchema.statics.getTrending = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ views: -1, 'rating.average': -1 })
    .limit(limit);
};

/**
 * Static method to search movies
 */
movieSchema.statics.searchMovies = function(query: string, options: any = {}) {
  const searchQuery = {
    $text: { $search: query },
    isActive: true,
  };

  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20);
};

/**
 * Movie model interface with static methods
 */
interface IMovieModel extends mongoose.Model<IMovie> {
  getTrending(limit?: number): Promise<IMovie[]>;
  searchMovies(query: string, options?: any): Promise<IMovie[]>;
}

/**
 * Movie model
 */
export const Movie = mongoose.model<IMovie, IMovieModel>('Movie', movieSchema);