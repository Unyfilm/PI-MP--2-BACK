import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { RevokedToken } from '../models/RevokedToken';
import { AuthenticatedRequest, JwtPayload, HttpStatusCode, ApiResponse } from '../types/api.types';
import { UserRole } from '../types/user.types';
import { config } from '../config/environment';


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

    
    const revokedToken = await RevokedToken.findOne({ token });
    if (revokedToken) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Token has been revoked',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

   
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Token inválido o usuario no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    req.user = user;
    req.userId = user._id;
    req.token = token; 

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

    
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    
    const user = await User.findById(decoded.userId);
    
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    }

    next();
  } catch (error) {
    
    next();
  }
};