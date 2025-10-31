/**
 * Database configuration and connection setup
 * Handles MongoDB Atlas connection with environment-specific optimizations
 */

import mongoose from 'mongoose';
import { getDatabaseConfig, isTest, isProduction, config } from './environment';

/**
 * Establish connection to MongoDB with environment-specific configuration
 */
export const connectDB = async (): Promise<void> => {
  if (isTest()) {
    console.log('🧪 Test environment: Skipping MongoDB connection (using Memory Server)');
    return;
  }

  const dbConfig = getDatabaseConfig();
  if (!dbConfig) {
    throw new Error('Database configuration not available');
  }

  try {
    const connectionOptions = {
      ...(dbConfig.options || {}),
      ...(isProduction() && {
        retryWrites: true,
        w: 'majority' as const,
        appName: 'MovieStreamingPlatform',
        connectTimeoutMS: 30000,
        heartbeatFrequencyMS: 10000,
      }),
    };

    await mongoose.connect(dbConfig.uri, connectionOptions);
    
    console.log(`✅ Connected to MongoDB Atlas (${config.nodeEnv})`);
    
    if (isProduction()) {
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });
    }
    
  } catch (error: any) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    
    if (isProduction()) {
      console.log('🔄 Retrying connection in 5 seconds...');
      setTimeout(() => connectDB(), 5000);
    } else {
      process.exit(1);
    }
  }
};

/**
 * Gracefully disconnect from MongoDB
 */
export const disconnectDB = async (): Promise<void> => {
  if (isTest()) {
    return; 
  }

  try {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error: any) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
  }
};

/**
 * Setup graceful shutdown handlers
 */
export const setupGracefulShutdown = (): void => {
  const shutdown = async (signal: string) => {
    console.log(`\n📴 Received ${signal}. Shutting down gracefully...`);
    await disconnectDB();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};