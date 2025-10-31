/**
 * Common API response interfaces and types
 */

import { Request, Response, NextFunction } from 'express';
import { IUser } from './user.types';

/**
 * Standard API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  timestamp: string;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  details?: any;
  timestamp: string;
}

/**
 * JWT payload interface
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Authenticated request interface with all Express Request properties
 */
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
  token?: string;
}

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * File upload interface
 */
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/**
 * HTTP status codes enumeration
 */
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * API endpoint paths
 */
export enum ApiEndpoints {
  AUTH_REGISTER = '/api/auth/register',
  AUTH_LOGIN = '/api/auth/login',
  AUTH_LOGOUT = '/api/auth/logout',
  AUTH_REFRESH = '/api/auth/refresh',
  AUTH_RESET_PASSWORD = '/api/auth/reset-password',
  
  USER_PROFILE = '/api/users/profile',
  USER_UPDATE = '/api/users/update',
  USER_DELETE = '/api/users/delete',
  
  MOVIES_LIST = '/api/movies',
  MOVIES_DETAIL = '/api/movies/:id',
  MOVIES_SEARCH = '/api/movies/search',
  MOVIES_TRENDING = '/api/movies/trending',
  
  FAVORITES_LIST = '/api/favorites',
  FAVORITES_ADD = '/api/favorites/:movieId',
  FAVORITES_REMOVE = '/api/favorites/:movieId',
  
  RATINGS_ADD = '/api/ratings',
  RATINGS_UPDATE = '/api/ratings/:movieId',
  RATINGS_GET = '/api/ratings/:movieId',
  
  COMMENTS_LIST = '/api/comments/:movieId',
  COMMENTS_CREATE = '/api/comments',
  COMMENTS_UPDATE = '/api/comments/:id',
  COMMENTS_DELETE = '/api/comments/:id',
}