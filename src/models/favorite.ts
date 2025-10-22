import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  movieId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Favorite = mongoose.model<IFavorite>('Favorite', favoriteSchema);
