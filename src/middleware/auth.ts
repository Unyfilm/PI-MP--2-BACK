/**
 * Authentication middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthenticatedRequest, JwtPayload, HttpStatusCode, ApiResponse } from '../types/api.types';
import { UserRole } from '../types/user.types';
import { config } from '../config/environment';

/**
 * Verify JWT token and authenticate user
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Access token required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid token or user not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Attach user information to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid token',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Token expired',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Authentication failed',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Require admin role middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    res.status(HttpStatusCode.FORBIDDEN).json({
      success: false,
      message: 'Admin access required',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
    return;
  }

  next();
};

/**
 * Require moderator role or higher middleware
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const requireModerator = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MODERATOR)) {
    res.status(HttpStatusCode.FORBIDDEN).json({
      success: false,
      message: 'Moderator access required',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
    return;
  }

  next();
};

/**
 * Optional authentication middleware
 * Attaches user info if token is provided and valid, but doesn't require it
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      next();
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId);
    
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};