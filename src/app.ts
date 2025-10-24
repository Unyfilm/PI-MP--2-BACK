/**
 * Main application entry point
 * Sets up Express server with middleware, routes, and database connection
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, validateConfig, isDevelopment } from './config/environment';
import { connectDB } from './config/database';
import userRoutes from './routes/userRoutes';
import movieRoutes from './routes/movieRoutes';
import favoriteRoutes from './routes/favoriteRoutes';///En prueba, julian
import ratingRoutes from './routes/ratingRoutes';
import commentRoutes from './routes/commentRoutes';
import { ApiResponse, HttpStatusCode } from './types/api.types';

/**
 * Express application instance
 */
const app: Application = express();

/**
 * Configure CORS options
 * Allow multiple frontends (production + development)
 */
const allowedOrigins = [
  config.clientUrl, // primary from env (e.g., https://pi-mp-2-front.vercel.app)
  'http://localhost:5173',
  'https://pi-mp-2-front.vercel.app',
].filter(Boolean);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow non-browser clients (e.g., Postman) with no Origin header
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

/**
 * Apply middleware
 */
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // Cross-origin resource sharing
app.use(morgan(isDevelopment() ? 'dev' : 'combined')); // HTTP request logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

/**
 * Health check endpoint
 * @route GET /health
 * @access Public
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(HttpStatusCode.OK).json({
    success: true,
    message: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      uptime: process.uptime(),
    },
    timestamp: new Date().toISOString(),
  } as ApiResponse);
});

/**
 * API routes
 */
app.use('/api/auth', userRoutes); // Authentication routes
app.use('/api/users', userRoutes); // User routes
app.use('/api/movies', movieRoutes); // Movie routes
app.use('/api/favorites', favoriteRoutes); // Favorite routes
app.use('/api/ratings', ratingRoutes); // Rating routes
app.use('/api/comments', commentRoutes); // Comment routes

/**
 * Root endpoint
 * @route GET /
 * @access Public
 */
app.get('/', (req: Request, res: Response) => {
  res.status(HttpStatusCode.OK).json({
    success: true,
    message: 'Welcome to Movie Streaming Platform API',
    data: {
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        users: '/api/users',
        movies: '/api/movies',
        favorites: '/api/favorites',///En prueba, julian
        ratings: '/api/ratings',
        comments: '/api/comments',
      },
    },
    timestamp: new Date().toISOString(),
  } as ApiResponse);
});

/**
 * 404 handler for undefined routes
 */
app.use('*', (req: Request, res: Response) => {
  res.status(HttpStatusCode.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  } as ApiResponse);
});

/**
 * Global error handler
 */
app.use((error: Error, req: Request, res: Response, next: any) => {
  console.error('Global error handler:', error);
  
  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
    error: isDevelopment() ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
  } as ApiResponse);
});

// The server startup logic has been moved to server.ts
// This file now only exports the Express app for better separation of concerns

export default app;