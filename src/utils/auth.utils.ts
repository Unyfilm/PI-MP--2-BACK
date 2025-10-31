import * as jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { JwtPayload } from '../types/api.types';
import { UserRole } from '../types/user.types';



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


export const verifyToken = (token: string): JwtPayload => {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};


export const generateRefreshToken = (userId: string): string => {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ userId } as any, config.jwtSecret, {
    expiresIn: '30d',
  } as any);
};

export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};