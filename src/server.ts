
import app from './app';
import { connectDB, setupGracefulShutdown } from './config/database';
import { validateConfig, config, logConfig, isProduction } from './config/environment';


const startServer = async (): Promise<void> => {
  try {
    
    validateConfig();
    
    
    logConfig();
    
   
    await connectDB();
    
    
    setupGracefulShutdown();
    
    
    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      
      if (!isProduction()) {
        console.log(`📡 Health check: http://localhost:${config.port}/health`);
        console.log(`🎬 API docs: http://localhost:${config.port}/`);
      }
    });

    
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


process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});


startServer();