
import dotenv from 'dotenv';


const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });


export type Environment = 'development' | 'production' | 'test' | 'staging';


export interface AppConfig {
  port: number;
  nodeEnv: Environment;
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

  trustProxy: boolean;
  rateLimitWindow: number;
  rateLimitMax: number;
}


const getCurrentEnvironment = (): Environment => {
  const env = process.env.NODE_ENV || 'development';
  const validEnvs: Environment[] = ['development', 'production', 'test', 'staging'];
  return validEnvs.includes(env as Environment) ? env as Environment : 'development';
};


const currentEnv = getCurrentEnvironment();
export const isProduction = (): boolean => currentEnv === 'production';
export const isDevelopment = (): boolean => currentEnv === 'development';
export const isTest = (): boolean => currentEnv === 'test';
export const isStaging = (): boolean => currentEnv === 'staging';


export const getDatabaseConfig = () => {
  if (isTest()) {
    
    return null;
  }
  
  return {
    uri: config.mongodbUri,
    options: {
      maxPoolSize: isProduction() ? 10 : 5,
      serverSelectionTimeoutMS: isProduction() ? 30000 : 5000,
      socketTimeoutMS: isProduction() ? 45000 : 0,
    },
  };
};


export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: currentEnv,
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
  
  trustProxy: isProduction(),
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};


const getRequiredVars = (env: Environment): string[] => {
  const base = ['MONGODB_URI', 'JWT_SECRET'];
  
  switch (env) {
    case 'production':
      return [...base, 'CLIENT_URL'];
    case 'test':
      return ['JWT_SECRET']; // Tests use MongoDB Memory Server
    default:
      return base;
  }
};


export const validateConfig = (): void => {
  const requiredVars = getRequiredVars(config.nodeEnv);
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for ${config.nodeEnv}: ${missing.join(', ')}`
    );
  }
  
  
  if (isProduction()) {
    if (config.jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
    
    if (!config.clientUrl.startsWith('https://')) {
      console.warn('⚠️ CLIENT_URL should use HTTPS in production');
    }
  }
};


export const logConfig = (): void => {
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🚀 Port: ${config.port}`);
  console.log(`🔗 Client URL: ${config.clientUrl}`);
  
  if (!isProduction()) {
    console.log(`📊 Database: ${config.mongodbUri ? '✅ Configured' : '❌ Missing'}`);
    console.log(`🔑 JWT Secret: ${config.jwtSecret ? '✅ Configured' : '❌ Missing'}`);
  }
};