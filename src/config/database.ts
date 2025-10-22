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
  // Skip database connection in test environment
  if (isTest()) {
    console.log('🧪 Test environment: Skipping MongoDB connection (using Memory Server)');
    return;
  }

  const dbConfig = getDatabaseConfig();
  if (!dbConfig) {
    throw new Error('Database configuration not available');
  }

  try {
    // Production-optimized connection options
    const connectionOptions = {
      ...(dbConfig.options || {}),
      // Additional production optimizations
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
    
    // Production monitoring
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
    
    // In production, attempt retry after delay
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
    return; // No connection to close in tests
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