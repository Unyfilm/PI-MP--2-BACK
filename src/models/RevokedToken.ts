
import mongoose, { Schema, Document } from 'mongoose';


export interface IRevokedToken extends Document {
  token: string;
  revokedAt: Date;
  expiresAt: Date;
}


const revokedTokenSchema = new Schema<IRevokedToken>({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  revokedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, 
  },
}, {
  timestamps: true,
});


export const RevokedToken = mongoose.model<IRevokedToken>('RevokedToken', revokedTokenSchema);