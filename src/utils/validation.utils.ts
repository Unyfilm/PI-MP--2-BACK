/**
 * Validation utilities
 */

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns Boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Must contain at least 8 characters, including uppercase, lowercase, number, and special character
 * @param password - Password string to validate
 * @returns Boolean indicating if password meets requirements
 */
export const validatePassword = (password: string): boolean => {
  if (password.length < 8) return false;
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
};

/**
 * Validate username format
 * Must be 3-30 characters, alphanumeric and underscores only
 * @param username - Username string to validate
 * @returns Boolean indicating if username is valid
 */
export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Validate movie duration
 * Must be a positive integer representing minutes
 * @param duration - Duration in minutes
 * @returns Boolean indicating if duration is valid
 */
export const validateMovieDuration = (duration: number): boolean => {
  return Number.isInteger(duration) && duration > 0 && duration <= 1000; // Max 1000 minutes (~16.5 hours)
};

/**
 * Validate URL format
 * @param url - URL string to validate
 * @returns Boolean indicating if URL is valid
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate movie rating
 * Must be between 1 and 5
 * @param rating - Rating number to validate
 * @returns Boolean indicating if rating is valid
 */
export const validateRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
};

/**
 * Validate genre array
 * @param genres - Array of genre strings
 * @returns Boolean indicating if genres are valid
 */
export const validateGenres = (genres: string[]): boolean => {
  if (!Array.isArray(genres) || genres.length === 0) return false;
  
  const validGenres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
    'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'
  ];
  
  return genres.every(genre => validGenres.includes(genre));
};

/**
 * Sanitize string input
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

/**
 * Validate pagination parameters
 * @param page - Page number
 * @param limit - Items per page
 * @returns Object with validated page and limit
 */
export const validatePagination = (page?: number, limit?: number) => {
  const validatedPage = Math.max(1, page || 1);
  const validatedLimit = Math.min(Math.max(1, limit || 20), 100); // Max 100 items per page
  
  return { page: validatedPage, limit: validatedLimit };
};