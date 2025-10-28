/**
 * Comment model definition for MongoDB
 * Represents user comments on movies
 */

import mongoose, { Schema, Model, Types } from 'mongoose';

/**
 * Interface para documento de comentario
 */
export interface IComment extends mongoose.Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  movieId: Types.ObjectId;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  validateContent(): boolean;
}

/**
 * Interface para el modelo Comment con métodos estáticos
 */
interface ICommentModel extends Model<IComment> {
  getMovieComments(movieId: string, page?: number, limit?: number): Promise<{
    comments: IComment[];
    total: number;
    page: number;
    pages: number;
  }>;
  getUserComments(userId: string, page?: number, limit?: number): Promise<{
    comments: IComment[];
    total: number;
    page: number;
    pages: number;
  }>;
}

/**
 * Comment schema definition
 * Stores user comments on movies
 */
const commentSchema = new Schema<IComment>({
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
  content: {
    type: String,
    required: [true, 'El contenido del comentario es requerido'],
    trim: true,
    minlength: [1, 'El comentario no puede estar vacío'],
    maxlength: [200, 'El comentario no puede exceder 200 caracteres'],
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
 * Compound index for efficient queries by movie and active status
 */
commentSchema.index({ movieId: 1, isActive: 1, createdAt: -1 });

/**
 * Index for efficient queries by user
 */
commentSchema.index({ userId: 1, isActive: 1, createdAt: -1 });

/**
 * Static method to get paginated comments for a specific movie
 * @param movieId - The movie ID to get comments for
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Paginated comments with metadata
 */
commentSchema.statics.getMovieComments = async function(
  movieId: string, 
  page: number = 1, 
  limit: number = 10
) {
  const skip = (page - 1) * limit;
  
  const [comments, total] = await Promise.all([
    this.find({
      movieId: new mongoose.Types.ObjectId(movieId),
      isActive: true,
    })
      .populate('userId', 'firstName email')
      .populate('movieId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments({
      movieId: new mongoose.Types.ObjectId(movieId),
      isActive: true,
    }),
  ]);

  const pages = Math.ceil(total / limit);

  return {
    comments,
    total,
    page,
    pages,
  };
};

/**
 * Static method to get paginated comments for a specific user
 * @param userId - The user ID to get comments for
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Paginated comments with metadata
 */
commentSchema.statics.getUserComments = async function(
  userId: string, 
  page: number = 1, 
  limit: number = 10
) {
  const skip = (page - 1) * limit;
  
  const [comments, total] = await Promise.all([
    this.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
    })
      .populate('userId', 'firstName email')
      .populate('movieId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
    }),
  ]);

  const pages = Math.ceil(total / limit);

  return {
    comments,
    total,
    page,
    pages,
  };
};

/**
 * Instance method to validate comment content
 * @returns boolean indicating if the content is valid
 */
commentSchema.methods.validateContent = function(): boolean {
  return this.content && 
         this.content.trim().length > 0 && 
         this.content.trim().length <= 200;
};

/**
 * Pre-save middleware to validate content
 */
commentSchema.pre('save', function(next) {
  // Trim content and validate
  this.content = this.content.trim();
  
  if (!this.validateContent()) {
    return next(new Error('Contenido del comentario inválido. Debe tener entre 1 y 200 caracteres.'));
  }
  
  next();
});

/**
 * Comment model
 */
export const Comment = mongoose.model<IComment, ICommentModel>('Comment', commentSchema);