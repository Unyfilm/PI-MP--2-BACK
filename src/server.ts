/**
 * Production-ready server entry point
 * Handles graceful startup, shutdown, and environment-specific optimizations
 */

import app from './app';
import { connectDB, setupGracefulShutdown } from './config/database';
import { validateConfig, config, logConfig, isProduction } from './config/environment';

/**
 * Start the server with comprehensive error handling
 */
const startServer = async (): Promise<void> => {
  try {
    // Validate configuration before starting
    validateConfig();
    
    // Log safe configuration details
    logConfig();
    
    // Connect to database (skipped in test environment)
    await connectDB();
    
    // Setup graceful shutdown handlers
    setupGracefulShutdown();
    
    // Start Express server
    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      
      if (!isProduction()) {
        console.log(`📡 Health check: http://localhost:${config.port}/health`);
        console.log(`🎬 API docs: http://localhost:${config.port}/`);
      }
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${config.port} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();