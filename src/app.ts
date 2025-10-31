
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, validateConfig, isDevelopment } from './config/environment';
import { connectDB } from './config/database';
import userRoutes from './routes/userRoutes';
import movieRoutes from './routes/movieRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import ratingRoutes from './routes/ratingRoutes';
import commentRoutes from './routes/commentRoutes';
import { ApiResponse, HttpStatusCode } from './types/api.types';


const app: Application = express();


const allowedOrigins = [
  config.clientUrl, 
  'http://localhost:5173',
  'https://pi-mp-2-front.vercel.app',
].filter(Boolean);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(helmet()); 
app.use(cors(corsOptions)); 
app.use(morgan(isDevelopment() ? 'dev' : 'combined')); 
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 


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


app.use('/api/auth', userRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/movies', movieRoutes); 
app.use('/api/favorites', favoriteRoutes); 
app.use('/api/ratings', ratingRoutes); 
app.use('/api/comments', commentRoutes); 


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
        favorites: '/api/favorites',
        ratings: '/api/ratings',
        comments: '/api/comments',
      },
    },
    timestamp: new Date().toISOString(),
  } as ApiResponse);
});


app.use('*', (req: Request, res: Response) => {
  res.status(HttpStatusCode.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  } as ApiResponse);
});


app.use((error: Error, req: Request, res: Response, next: any) => {
  console.error('Global error handler:', error);
  
  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
    error: isDevelopment() ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
  } as ApiResponse);
});

export default app;