
import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IComment extends mongoose.Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  movieId: Types.ObjectId;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  validateContent(): boolean;
}


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


commentSchema.index({ movieId: 1, isActive: 1, createdAt: -1 });


commentSchema.index({ userId: 1, isActive: 1, createdAt: -1 });

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
      .populate('userId', 'firstName lastName email')
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
      .populate('userId', 'firstName lastName email')
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


commentSchema.methods.validateContent = function(): boolean {
  return this.content && 
         this.content.trim().length > 0 && 
         this.content.trim().length <= 200;
};


commentSchema.pre('save', function(next) {
  
  this.content = this.content.trim();
  
  if (!this.validateContent()) {
    return next(new Error('Contenido del comentario inválido. Debe tener entre 1 y 200 caracteres.'));
  }
  
  next();
});


export const Comment = mongoose.model<IComment, ICommentModel>('Comment', commentSchema);