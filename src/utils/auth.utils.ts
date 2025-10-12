/**
 * Authentication utilities
 */

import * as jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { JwtPayload } from '../types/api.types';
import { UserRole } from '../types/user.types';

/**
 * Generate JWT token
 * @param userId - User ID
 * @param email - User email
 * @param role - User role
 * @returns JWT token string
 */
export const generateToken = (userId: string, email: string, role: UserRole): string => {
  const payload = {
    userId,
    email,
    role: role as string,
  };

  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload as any, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as any);
};

/**
 * Verify JWT token
 * @param token - JWT token string
 * @returns Decoded JWT payload
 */
export const verifyToken = (token: string): JwtPayload => {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};

/**
 * Generate refresh token
 * @param userId - User ID
 * @returns Refresh token string
 */
export const generateRefreshToken = (userId: string): string => {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ userId } as any, config.jwtSecret, {
    expiresIn: '30d',
  } as any);
};

/**
 * Extract token from authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};