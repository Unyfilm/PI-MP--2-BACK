/**
 * Rating model definition for MongoDB
 * Represents individual user ratings for movies
 */

/**
 * Rating model definition for MongoDB
 * Representa calificaciones individuales de usuarios para películas
 */

import mongoose, { Schema, Model, Types } from 'mongoose';

/**
 * Interface para documento de calificación
 */
export interface IRating extends mongoose.Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  movieId: Types.ObjectId;
  rating: number; 
  review: string; 
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  validateRating(): boolean;
}

/**
 * Interface para el modelo Rating con métodos estáticos
 */
interface IRatingModel extends Model<IRating> {
  calculateMovieStats(movieId: string): Promise<{
    average: number;
    count: number;
    distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  }>;
}

/**
 * Rating schema definition
 * Stores individual ratings given by users to movies
 */
const ratingSchema = new Schema<IRating>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID de usuario es requerido'],
    index: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'ID de película es requerido'],
    index: true,
  },
  rating: {
    type: Number,
    required: [true, 'Calificación es requerida'],
    min: [1, 'La calificación debe ser al menos 1 estrella'],
    max: [5, 'La calificación no puede ser más de 5 estrellas'],
    validate: {
      validator: Number.isInteger,
      message: 'La calificación debe ser un número entero',
    },
  },
  review: {
    type: String,
    trim: true,
    maxlength: [500, 'Review cannot exceed 500 characters'],
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

/**
 * Compound index to ensure one rating per user per movie
 */
ratingSchema.index({ userId: 1, movieId: 1 }, { unique: true });

/**
 * Index for efficient queries by movie
 */
ratingSchema.index({ movieId: 1, isActive: 1 });

/**
 * Index for efficient queries by user
 */
ratingSchema.index({ userId: 1, isActive: 1 });

/**
 * Static method to calculate movie rating statistics
 * @param movieId - The movie ID to calculate statistics for
 * @returns Rating statistics including average, count, and distribution
 */
ratingSchema.statics.calculateMovieStats = async function(movieId: string) {
  const pipeline = [
    {
      $match: {
        movieId: new mongoose.Types.ObjectId(movieId),
        isActive: true,
      },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
  ];

  const results = await this.aggregate(pipeline);
  
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRatings = 0;
  let totalScore = 0;

  results.forEach((result: any) => {
    const rating = result._id;
    const count = result.count;
    distribution[rating as keyof typeof distribution] = count;
    totalRatings += count;
    totalScore += rating * count;
  });

  const average = totalRatings > 0 ? parseFloat((totalScore / totalRatings).toFixed(1)) : 0;

  return {
    average,
    count: totalRatings,
    distribution,
  };
};

/**
 * Instance method to validate if user can rate this movie
 * @returns boolean indicating if the rating is valid
 */
ratingSchema.methods.validateRating = function(): boolean {
  return this.rating >= 1 && this.rating <= 5 && Number.isInteger(this.rating);
};

/**
 * Pre-save middleware to validate rating
 */
ratingSchema.pre('save', function(next) {
  if (this.rating < 1 || this.rating > 5 || !Number.isInteger(this.rating)) {
    return next(new Error('Valor de calificación inválido. Debe ser un entero entre 1 y 5.'));
  }
  next();
});

/**
 * Rating model
 */
export const Rating = mongoose.model<IRating, IRatingModel>('Rating', ratingSchema);