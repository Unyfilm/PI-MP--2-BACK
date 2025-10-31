
import { Response } from 'express';
import { ApiResponse, PaginatedResponse, ErrorResponse, HttpStatusCode } from '../types/api.types';


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


export const sendNotFound = (res: Response, resource: string = 'Resource'): void => {
  sendError(
    res,
    `${resource} not found`,
    `The requested ${resource.toLowerCase()} could not be found`,
    HttpStatusCode.NOT_FOUND
  );
};

export const sendValidationError = (res: Response, message: string, details?: any): void => {
  sendError(
    res,
    'Validation failed',
    message,
    HttpStatusCode.BAD_REQUEST,
    details
  );
};


export const sendUnauthorized = (res: Response, message: string = 'Unauthorized'): void => {
  sendError(
    res,
    message,
    'You are not authorized to access this resource',
    HttpStatusCode.UNAUTHORIZED
  );
};


export const sendForbidden = (res: Response, message: string = 'Forbidden'): void => {
  sendError(
    res,
    message,
    'You do not have permission to access this resource',
    HttpStatusCode.FORBIDDEN
  );
};