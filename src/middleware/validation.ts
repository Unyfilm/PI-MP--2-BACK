/**
 * Validation middleware using express-validator
 */

import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { HttpStatusCode, ApiResponse } from '../types/api.types';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      error: errors.array()[0].msg,
      details: errors.array(),
      timestamp: new Date().toISOString(),
    } as ApiResponse);
    return;
  }
  
  next();
};

/**
 * User registration validation rules
 */
export const validateUserRegistration = [
  body('username')
    .optional() 
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
    
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
    
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
    
  body('age')
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be a number between 13 and 120'),
    
  handleValidationErrors,
];

/**
 * User login validation rules
 */
export const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  handleValidationErrors,
];

/**
 * User update validation rules
 */
export const validateUserUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
    
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
    
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be a number between 13 and 120'),
    
  body('profilePicture')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL'),
    
  handleValidationErrors,
];

/**
 * Movie creation validation rules
 */
export const validateMovieCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
    
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
    
  body('synopsis')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Synopsis must be between 1 and 2000 characters'),
    
  body('releaseDate')
    .isISO8601()
    .withMessage('Release date must be a valid date'),
    
  body('duration')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Duration must be between 1 and 1000 minutes'),
    
  body('genre')
    .isArray({ min: 1 })
    .withMessage('At least one genre is required'),
    
  body('director')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Director name must be between 1 and 100 characters'),
    
  body('poster')
    .isURL()
    .withMessage('Poster must be a valid URL'),
    
  body('videoUrl')
    .isURL()
    .withMessage('Video URL must be a valid URL'),
    
  body('language')
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be between 2 and 5 characters'),
    
  handleValidationErrors,
];

/**
 * Movie update validation rules
 */
export const validateMovieUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
    
  body('synopsis')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Synopsis must be between 1 and 2000 characters'),
    
  body('releaseDate')
    .optional()
    .isISO8601()
    .withMessage('Release date must be a valid date'),
    
  body('duration')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Duration must be between 1 and 1000 minutes'),
    
  body('genre')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one genre is required'),
    
  body('director')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Director name must be between 1 and 100 characters'),
    
  body('poster')
    .optional()
    .isURL()
    .withMessage('Poster must be a valid URL'),
    
  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('Video URL must be a valid URL'),
    
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be between 2 and 5 characters'),
    
  handleValidationErrors,
];

/**
 * Rating creation and update validation rules
 */
export const validateRatingCreation = [
  body('movieId')
    .notEmpty()
    .withMessage('Movie ID is required')
    .isMongoId()
    .withMessage('Movie ID must be a valid MongoDB ID'),
    
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be a number between 1 and 5')
    .custom((value) => {
      if (![1, 2, 3, 4, 5].includes(value)) {
        throw new Error('Rating must be exactly 1, 2, 3, 4, or 5 stars');
      }
      return true;
    }),
    
  body('review')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review must not exceed 1000 characters'),
    
  handleValidationErrors,
];

/**
 * Rating query parameters validation rules
 */
export const validateRatingQuery = [
  body('movieId')
    .optional()
    .isMongoId()
    .withMessage('Movie ID must be a valid MongoDB ID'),
    
  handleValidationErrors,
];

/**
 * Rating update validation rules (for PUT endpoint)
 */
export const validateRatingUpdate = [
  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be a number between 1 and 5')
    .custom((value) => {
      if (value !== undefined && ![1, 2, 3, 4, 5].includes(value)) {
        throw new Error('Rating must be exactly 1, 2, 3, 4, or 5 stars');
      }
      return true;
    }),
    
  body('review')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review must not exceed 1000 characters'),
    
  handleValidationErrors,
];

/**
 * Favorite creation validation rules
 */
export const validateFavoriteCreation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
    
  body('movieId')
    .notEmpty()
    .withMessage('Movie ID is required')
    .isMongoId()
    .withMessage('Movie ID must be a valid MongoDB ObjectId'),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
    
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
    
  handleValidationErrors,
];

/**
 * Favorite update validation rules
 */
export const validateFavoriteUpdate = [
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
    
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
    
  handleValidationErrors,
];