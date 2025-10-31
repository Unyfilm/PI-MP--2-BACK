
import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  username?: string;  
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  profilePicture?: string;
  isActive: boolean;
  role: UserRole;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  
  resetPasswordToken?: string;
  
  resetPasswordExpires?: Date;
  
  fullName: string;
  
  displayName: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateUsername(): Promise<string>;
}


export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}


export interface UserPreferences {
  language: string;
  notifications: boolean;
  autoplay: boolean;
  qualityPreference: VideoQuality;
}


export enum VideoQuality {
  LOW = '480p',
  MEDIUM = '720p',
  HIGH = '1080p',
  ULTRA = '4K',
}


export interface RegisterUserRequest {
  username?: string; 
  password: string;
  firstName: string;
  lastName: string;
  age: number;
}


export interface LoginUserRequest {
  email: string;
  password: string;
}


export interface UpdateUserRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  profilePicture?: string;
  preferences?: Partial<UserPreferences>;
}


export interface ResetPasswordRequest {
  email: string;
}


export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}