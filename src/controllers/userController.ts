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
 * Retrieves the authenticated user's profile information
 * @route GET /api/users/profile
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Usuario no autenticado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user || !user.isActive) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Usuario no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        role: user.role,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al obtener el perfil del usuario',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Update user profile
 * Updates the authenticated user's profile information with validation
 * @route PUT /api/users/profile
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with authenticated user and update data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const updateData: UpdateUserRequest = req.body;

    if (!userId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Usuario no autenticado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate input fields
    if (!updateData || Object.keys(updateData).length === 0) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'No se proporcionaron datos para actualizar',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Define allowed fields for profile update
    const allowedFields = ['username', 'firstName', 'lastName', 'email', 'profilePicture', 'preferences'];
    const filteredUpdateData: any = {};

    // Filter and validate each field
    for (const key of Object.keys(updateData)) {
      if (allowedFields.includes(key)) {
        const value = updateData[key as keyof UpdateUserRequest];
        
        // Skip empty values
        if (value === undefined || value === null || value === '') {
          continue;
        }

        // Validate specific fields
        if (key === 'email' && value) {
          if (!validateEmail(value as string)) {
            res.status(HttpStatusCode.BAD_REQUEST).json({
              success: false,
              message: 'Por favor ingresa un email válido',
              timestamp: new Date().toISOString(),
            } as ApiResponse);
            return;
          }

          // Check if email is already taken by another user
          const existingUser = await User.findOne({ 
            email: value, 
            _id: { $ne: userId },
            isActive: true 
          });
          
          if (existingUser) {
            res.status(HttpStatusCode.CONFLICT).json({
              success: false,
              message: 'Este email ya está en uso por otro usuario',
              timestamp: new Date().toISOString(),
            } as ApiResponse);
            return;
          }
        }

        if (key === 'username' && value) {
          // Validate username format
          if (typeof value === 'string' && value.length < 3) {
            res.status(HttpStatusCode.BAD_REQUEST).json({
              success: false,
              message: 'El nombre de usuario debe tener al menos 3 caracteres',
              timestamp: new Date().toISOString(),
            } as ApiResponse);
            return;
          }

          // Check if username is already taken
          const existingUser = await User.findOne({ 
            username: value, 
            _id: { $ne: userId },
            isActive: true 
          });
          
          if (existingUser) {
            res.status(HttpStatusCode.CONFLICT).json({
              success: false,
              message: 'Este nombre de usuario ya está en uso',
              timestamp: new Date().toISOString(),
            } as ApiResponse);
            return;
          }
        }

        if (key === 'firstName' && value) {
          if (typeof value === 'string' && value.length < 2) {
            res.status(HttpStatusCode.BAD_REQUEST).json({
              success: false,
              message: 'El nombre debe tener al menos 2 caracteres',
              timestamp: new Date().toISOString(),
            } as ApiResponse);
            return;
          }
        }

        if (key === 'lastName' && value) {
          if (typeof value === 'string' && value.length < 2) {
            res.status(HttpStatusCode.BAD_REQUEST).json({
              success: false,
              message: 'El apellido debe tener al menos 2 caracteres',
              timestamp: new Date().toISOString(),
            } as ApiResponse);
            return;
          }
        }

        filteredUpdateData[key] = value;
      }
    }

    if (Object.keys(filteredUpdateData).length === 0) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'No se encontraron campos válidos para actualizar',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Update user with validation
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...filteredUpdateData,
        updatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: true,
        select: '-password -resetPasswordToken -resetPasswordExpires'
      }
    );

    if (!updatedUser || !updatedUser.isActive) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Usuario no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName: updatedUser.fullName,
        profilePicture: updatedUser.profilePicture,
        preferences: updatedUser.preferences,
        updatedAt: updatedUser.updatedAt,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Update user profile error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Datos de entrada inválidos',
        error: validationErrors.join(', '),
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = 'Este valor ya está en uso';
      
      if (field === 'email') {
        message = 'Este email ya está registrado';
      } else if (field === 'username') {
        message = 'Este nombre de usuario ya está en uso';
      }

      res.status(HttpStatusCode.CONFLICT).json({
        success: false,
        message,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al actualizar el perfil del usuario',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Change user password
 * Updates the authenticated user's password with security validation
 * @route PUT /api/users/change-password
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with authenticated user and password data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const changeUserPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, confirmPassword }: ChangePasswordRequest = req.body;

    if (!userId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Usuario no autenticado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Todos los campos son requeridos',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate new password confirmation
    if (newPassword !== confirmPassword) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Las contraseñas no coinciden',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Validate new password strength
    if (!validatePassword(newPassword)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Find user and verify current password
    const user = await User.findById(userId).select('+password');
    if (!user || !user.isActive) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Usuario no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'La contraseña actual es incorrecta',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Check if new password is different from current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'La nueva contraseña debe ser diferente a la actual',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error) {
    console.error('Change password error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al cambiar la contraseña',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

/**
 * Delete user account - Permanently removes user data from database
 * Handles DELETE /api/users/account endpoint for US-5 - Eliminar cuenta
 * 
 * This endpoint completely removes the user's account and all associated data
 * from the database. Once deleted, the account cannot be recovered.
 * 
 * @route DELETE /api/users/account
 * @access Private - Requires valid JWT authentication token
 * @param {AuthenticatedRequest} req - Express request object with authenticated user data
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response indicating success/failure of account deletion
 * 
 * @example
 * // Success Response
 * {
 *   "success": true,
 *   "message": "Cuenta eliminada exitosamente",
 *   "data": {
 *     "redirectTo": "/register",
 *     "message": "Cuenta eliminada"
 *   },
 *   "timestamp": "2025-01-01T12:00:00.000Z"
 * }
 * 
 * @example
 * // Error Response
 * {
 *   "success": false,
 *   "message": "Usuario no encontrado",
 *   "timestamp": "2025-01-01T12:00:00.000Z"
 * }
 */
export const deleteUserAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Usuario no autenticado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Find the user first to ensure they exist
    const user = await User.findById(userId);
    
    if (!user || !user.isActive) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Usuario no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Permanently delete user data from database (hard delete)
    await User.findByIdAndDelete(userId);

    console.log(`User account deleted successfully: ${user.email} (ID: ${userId})`);

    // Response with redirect information for frontend
    res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Cuenta eliminada exitosamente',
      data: {
        redirectTo: '/register',
        message: 'Cuenta eliminada',
        deletedUser: {
          email: user.email,
          username: user.username,
          deletedAt: new Date().toISOString()
        }
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error al eliminar la cuenta',
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