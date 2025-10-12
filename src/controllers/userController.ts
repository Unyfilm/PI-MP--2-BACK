/**
 * User controller - Handles user-related HTTP requests
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { RevokedToken } from '../models/RevokedToken';
import { 
  RegisterUserRequest, 
  LoginUserRequest, 
  UpdateUserRequest,
  ResetPasswordRequest,
  ChangePasswordRequest 
} from '../types/user.types';
import { sendPasswordResetEmail } from '../services/emailService';
import { ApiResponse, AuthenticatedRequest, HttpStatusCode } from '../types/api.types';
import { generateToken } from '../utils/auth.utils';
import { validateEmail, validatePassword } from '../utils/validation.utils';
import { config } from '../config/environment';

/**
 * Register a new user
 * Handles POST /api/auth/register
 *
 * @route POST /api/auth/register
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Accept confirmPassword from body
    const { username, email, password, confirmPassword, firstName, lastName } = req.body;

    // Validate input
    if (!username || !email || !password || !confirmPassword || !firstName || !lastName) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Todos los campos son requeridos',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate email format (específico)
    if (typeof email !== 'string' || !validateEmail(email)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Por favor ingresa un email válido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate password strength (específico)
    if (typeof password !== 'string' || !validatePassword(password)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Confirm password match
    if (password !== confirmPassword) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Las contraseñas no coinciden',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'correo electrónico' : 'nombre de usuario';
      res.status(HttpStatusCode.CONFLICT).json({
        success: false,
        message: `Este ${field} ya está registrado. Por favor usa uno diferente.`,
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

    // Registration successful, do not auto-login, just respond
    res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: 'Registro exitoso',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Register user error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Ocurrió un error. Por favor intenta más tarde.',
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
        message: 'Email y contraseña son requeridos',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Find user by email and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Credenciales inválidas',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Credenciales inválidas',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.role);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Inicio de sesión exitoso',
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
      message: 'Error interno del servidor',
      error: 'Error al iniciar sesión',
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

/**
 * Logout user - Invalidates session/token
 * Handles POST /api/auth/logout
 *
 * @route POST /api/auth/logout
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with user authentication
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const logoutUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const token = req.token;

    if (!token) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Token no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Decode token to get expiration time
    const decoded = jwt.decode(token) as any;
    const expiresAt = new Date(decoded.exp * 1000); // Convert from seconds to milliseconds

    // Add token to blacklist
    await RevokedToken.create({
      token,
      expiresAt,
    });
    
    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Sesión cerrada exitosamente',
      data: {
        redirectTo: '/login'
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Logout user error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al cerrar sesión',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Request password reset - Send reset token to user's email
 * Handles POST /api/auth/forgot-password
 *
 * @route POST /api/auth/forgot-password
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email }: ResetPasswordRequest = req.body;

    // Validate input
    if (!email) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'El email es requerido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Por favor ingresa un email válido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    // Always return success for security (don't reveal if email exists)
    // But only process if user actually exists
    if (user && user.isActive) {
      // Generate reset token (valid for 1 hour)
      const resetToken = jwt.sign(
        { userId: user._id, email: user.email },
        config.jwtSecret,
        { expiresIn: '1h' }
      );

      // Save token to user document
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // Send reset email
      const resetLink = `${config.clientUrl}/reset-password?token=${resetToken}`;
      
      try {
        const emailSent = await sendPasswordResetEmail(email, resetLink);
        if (emailSent) {
          console.log(`✅ Password reset email sent to ${email}`);
        } else {
          console.log(`⚠️ Email service failed, falling back to simulation for ${email}: ${resetLink}`);
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
        console.log(`[EMAIL FALLBACK] Reset link for ${email}: ${resetLink}`);
      }
    }

    // Always return success response for security
    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña',
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al procesar la solicitud',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Reset password using valid token
 * Handles POST /api/auth/reset-password
 *
 * @route POST /api/auth/reset-password
 * @access Public
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validate input
    if (!token || !password || !confirmPassword) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Token, contraseña y confirmación de contraseña son requeridos',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate password strength
    if (!validatePassword(password)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Confirm passwords match
    if (password !== confirmPassword) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Las contraseñas no coinciden',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Enlace inválido o caducado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Find user with valid reset token
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Enlace inválido o caducado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Update password and clear reset fields
    user.password = password; // Will be hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Contraseña restablecida exitosamente',
      data: {
        redirectTo: '/login'
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al restablecer la contraseña',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};