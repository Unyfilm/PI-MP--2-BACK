/**
 * User controller - Handles user-related HTTP requests
 */

import { Request, Response } from 'express';
import { User } from '../models/User';
import { 
  RegisterUserRequest, 
  LoginUserRequest, 
  UpdateUserRequest,
  ResetPasswordRequest,
  ChangePasswordRequest 
} from '../types/user.types';
import { ApiResponse, AuthenticatedRequest, HttpStatusCode } from '../types/api.types';
import { generateToken } from '../utils/auth.utils';
import { validateEmail, validatePassword } from '../utils/validation.utils';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName }: RegisterUserRequest = req.body;

    // Validate input
    if (!username || !email || !password || !firstName || !lastName) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'All fields are required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Invalid email format',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate password strength
    if (!validatePassword(password)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(HttpStatusCode.CONFLICT).json({
        success: false,
        message: 'User with this email or username already exists',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.role);

    res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Register user error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to register user',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginUserRequest = req.body;

    // Validate input
    if (!email || !password) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Email and password are required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Find user by email and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.role);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          preferences: user.preferences,
        },
        token,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Login user error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to login user',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        role: user.role,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to get user profile',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const updateData: UpdateUserRequest = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    const allowedFields = ['username', 'firstName', 'lastName', 'profilePicture', 'preferences'];
    const filteredUpdateData: any = {};

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdateData[key] = updateData[key as keyof UpdateUserRequest];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      filteredUpdateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        preferences: user.preferences,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to update user profile',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Delete user account
 * @route DELETE /api/users/account
 * @access Private
 */
export const deleteUserAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    // Soft delete by setting isActive to false
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Account deleted successfully',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to delete user account',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};