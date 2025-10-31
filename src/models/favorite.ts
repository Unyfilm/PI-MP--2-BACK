import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  movieId: mongoose.Types.ObjectId;
  notes?: string;
  rating?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new Schema<IFavorite>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  movieId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Movie', 
    required: true,
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: ''
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: function(value: number) {
        return value === undefined || Number.isInteger(value);
      },
      message: 'Rating must be an integer'
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


favoriteSchema.index(
  { userId: 1, movieId: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);


favoriteSchema.index({ createdAt: 1 });


favoriteSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
  this.where({ isActive: { $ne: false } });
});

export const Favorite = mongoose.model<IFavorite>('Favorite', favoriteSchema);
