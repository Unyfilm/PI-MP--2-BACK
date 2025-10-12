/**
 * User related type definitions and interfaces
 */

import { Document } from 'mongoose';

/**
 * User interface for database document
 */
export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  isActive: boolean;
  role: UserRole;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  /**
   * Token for password reset (optional)
   */
  resetPasswordToken?: string;
  /**
   * Expiration date for the reset token (optional)
   */
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User role enumeration
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  language: string;
  notifications: boolean;
  autoplay: boolean;
  qualityPreference: VideoQuality;
}

/**
 * Video quality enumeration
 */
export enum VideoQuality {
  LOW = '480p',
  MEDIUM = '720p',
  HIGH = '1080p',
  ULTRA = '4K',
}

/**
 * User registration request interface
 */
export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * User login request interface
 */
export interface LoginUserRequest {
  email: string;
  password: string;
}

/**
 * User update request interface
 */
export interface UpdateUserRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  preferences?: Partial<UserPreferences>;
}

/**
 * Password reset request interface
 */
export interface ResetPasswordRequest {
  email: string;
}

/**
 * Change password request interface
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}