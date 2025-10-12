/**
 * Environment configuration management
 * Handles all environment variables and configuration settings
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Application configuration interface
 */
export interface AppConfig {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  clientUrl: string;
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  pexelsApiKey: string;
  email: {
    service: string;
    user: string;
    pass: string;
  };
}

/**
 * Application configuration object
 */
export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  pexelsApiKey: process.env.PEXELS_API_KEY || '',
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
};

/**
 * Validates required environment variables
 * @throws Error if required variables are missing
 */
export const validateConfig = (): void => {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
};

/**
 * Checks if application is in production mode
 * @returns boolean
 */
export const isProduction = (): boolean => {
  return config.nodeEnv === 'production';
};

/**
 * Checks if application is in development mode
 * @returns boolean
 */
export const isDevelopment = (): boolean => {
  return config.nodeEnv === 'development';
};