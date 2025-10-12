/**
 * Response utilities for consistent API responses
 */

import { Response } from 'express';
import { ApiResponse, PaginatedResponse, ErrorResponse, HttpStatusCode } from '../types/api.types';

/**
 * Send success response
 * @param res - Express response object
 * @param message - Success message
 * @param data - Response data
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: HttpStatusCode = HttpStatusCode.OK
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  } as ApiResponse<T>);
};

/**
 * Send error response
 * @param res - Express response object
 * @param message - Error message
 * @param error - Error details
 * @param statusCode - HTTP status code (default: 500)
 * @param details - Additional error details
 */
export const sendError = (
  res: Response,
  message: string,
  error: string,
  statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
  details?: any
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    error,
    details,
    timestamp: new Date().toISOString(),
  } as ErrorResponse);
};

/**
 * Send paginated response
 * @param res - Express response object
 * @param message - Success message
 * @param data - Array of data items
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param totalItems - Total number of items
 * @param itemsPerPage - Number of items per page
 */
export const sendPaginatedResponse = <T>(
  res: Response,
  message: string,
  data: T[],
  currentPage: number,
  totalPages: number,
  totalItems: number,
  itemsPerPage: number
): void => {
  res.status(HttpStatusCode.OK).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
    timestamp: new Date().toISOString(),
  } as PaginatedResponse<T>);
};

/**
 * Send not found response
 * @param res - Express response object
 * @param resource - Name of the resource that was not found
 */
export const sendNotFound = (res: Response, resource: string = 'Resource'): void => {
  sendError(
    res,
    `${resource} not found`,
    `The requested ${resource.toLowerCase()} could not be found`,
    HttpStatusCode.NOT_FOUND
  );
};

/**
 * Send validation error response
 * @param res - Express response object
 * @param message - Validation error message
 * @param details - Validation error details
 */
export const sendValidationError = (res: Response, message: string, details?: any): void => {
  sendError(
    res,
    'Validation failed',
    message,
    HttpStatusCode.BAD_REQUEST,
    details
  );
};

/**
 * Send unauthorized response
 * @param res - Express response object
 * @param message - Unauthorized message
 */
export const sendUnauthorized = (res: Response, message: string = 'Unauthorized'): void => {
  sendError(
    res,
    message,
    'You are not authorized to access this resource',
    HttpStatusCode.UNAUTHORIZED
  );
};

/**
 * Send forbidden response
 * @param res - Express response object
 * @param message - Forbidden message
 */
export const sendForbidden = (res: Response, message: string = 'Forbidden'): void => {
  sendError(
    res,
    message,
    'You do not have permission to access this resource',
    HttpStatusCode.FORBIDDEN
  );
};