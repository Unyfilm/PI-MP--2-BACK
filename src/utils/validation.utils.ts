
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const validatePassword = (password: string): boolean => {
  if (password.length < 8) return false;
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
};


export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};


export const validateMovieDuration = (duration: number): boolean => {
  return Number.isInteger(duration) && duration > 0 && duration <= 1000; // Max 1000 minutes (~16.5 hours)
};


export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};


export const validateRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
};


export const validateGenres = (genres: string[]): boolean => {
  if (!Array.isArray(genres) || genres.length === 0) return false;
  
  const validGenres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
    'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'
  ];
  
  return genres.every(genre => validGenres.includes(genre));
};


export const sanitizeString = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};


export const validatePagination = (page?: number, limit?: number) => {
  const validatedPage = Math.max(1, page || 1);
  const validatedLimit = Math.min(Math.max(1, limit || 20), 100); // Max 100 items per page
  
  return { page: validatedPage, limit: validatedLimit };
};