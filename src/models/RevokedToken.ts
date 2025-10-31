/**
 * Revoked Token model - Stores invalidated JWT tokens
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface for revoked token document
 */
export interface IRevokedToken extends Document {
  token: string;
  revokedAt: Date;
  expiresAt: Date;
}

/**
 * Revoked token schema definition
 */
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

/**
 * Revoked Token model
 */
export const RevokedToken = mongoose.model<IRevokedToken>('RevokedToken', revokedTokenSchema);