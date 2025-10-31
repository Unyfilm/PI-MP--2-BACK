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


export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
   
    const { username, email, password, confirmPassword, firstName, lastName, age } = req.body;

    
    if (!email || !password || !confirmPassword || !firstName || !lastName || !age) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Email, contraseña, nombre, apellido y edad son requeridos',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    if (typeof email !== 'string' || !validateEmail(email)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Por favor ingresa un email válido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    if (typeof password !== 'string' || !validatePassword(password)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    if (password !== confirmPassword) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Las contraseñas no coinciden',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const existingConditions: any[] = [{ email }];
    if (username) {
      existingConditions.push({ username });
    }
    
    const existingUser = await User.findOne({
      $or: existingConditions,
    });

    if (existingUser) {
      let message = 'Este correo electrónico ya está registrado';
      if (existingUser.email === email) {
        message = 'Este correo electrónico ya está registrado. Por favor usa uno diferente.';
      } else if (username && existingUser.username === username) {
        message = 'Este nombre de usuario ya está en uso. Por favor usa uno diferente.';
      }
      
      res.status(HttpStatusCode.CONFLICT).json({
        success: false,
        message,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    if (typeof age !== 'number' || age < 13 || age > 120 || !Number.isInteger(age)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'La edad debe ser un número entero entre 13 y 120 años',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const user = new User({
      username: username || undefined, // Explicitly set to undefined if not provided
      email,
      password,
      firstName,
      lastName,
      age,
    });

    
    if (!username) {
      user.username = await user.generateUsername();
    }

    await user.save();

    
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
          age: user.age,
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


export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginUserRequest = req.body;

    
    if (!email || !password) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Email y contraseña son requeridos',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Credenciales inválidas',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: 'Credenciales inválidas',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
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
          age: user.age,
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
        age: user.age,
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

    
    if (!updateData || Object.keys(updateData).length === 0) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'No se proporcionaron datos para actualizar',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const allowedFields = ['username', 'firstName', 'lastName', 'age', 'email', 'profilePicture', 'preferences'];
    const filteredUpdateData: any = {};

    
    for (const key of Object.keys(updateData)) {
      if (allowedFields.includes(key)) {
        const value = updateData[key as keyof UpdateUserRequest];
        
        // Skip empty values
        if (value === undefined || value === null || value === '') {
          continue;
        }

        
        if (key === 'email' && value) {
          if (!validateEmail(value as string)) {
            res.status(HttpStatusCode.BAD_REQUEST).json({
              success: false,
              message: 'Por favor ingresa un email válido',
              timestamp: new Date().toISOString(),
            } as ApiResponse);
            return;
          }

          
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
        
          if (typeof value === 'string' && value.length < 3) {
            res.status(HttpStatusCode.BAD_REQUEST).json({
              success: false,
              message: 'El nombre de usuario debe tener al menos 3 caracteres',
              timestamp: new Date().toISOString(),
            } as ApiResponse);
            return;
          }

          
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

        if (key === 'age' && value) {
          if (typeof value !== 'number' || value < 13 || value > 120 || !Number.isInteger(value)) {
            res.status(HttpStatusCode.BAD_REQUEST).json({
              success: false,
              message: 'La edad debe ser un número entero entre 13 y 120 años',
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
        age: updatedUser.age,
        fullName: updatedUser.fullName,
        profilePicture: updatedUser.profilePicture,
        preferences: updatedUser.preferences,
        updatedAt: updatedUser.updatedAt,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Update user profile error:', error);
    
    
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

    
    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Todos los campos son requeridos',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

  
    if (newPassword !== confirmPassword) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Las contraseñas no coinciden',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    if (!validatePassword(newPassword)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const user = await User.findById(userId).select('+password');
    if (!user || !user.isActive) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Usuario no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'La contraseña actual es incorrecta',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'La nueva contraseña debe ser diferente a la actual',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save({ validateModifiedOnly: true });

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

    const user = await User.findById(userId);
    
    if (!user || !user.isActive) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Usuario no encontrado',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    await User.findByIdAndDelete(userId);

    console.log(`User account deleted successfully: ${user.email} (ID: ${userId})`);

    
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

    
    const decoded = jwt.decode(token) as any;
    const expiresAt = new Date(decoded.exp * 1000); // Convert from seconds to milliseconds

    
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


export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email }: ResetPasswordRequest = req.body;

    
    if (!email) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'El email es requerido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    if (!validateEmail(email)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Por favor ingresa un email válido',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    const user = await User.findOne({ email });
    
    
    if (user && user.isActive) {
      
      const resetToken = jwt.sign(
        { userId: user._id, email: user.email },
        config.jwtSecret,
        { expiresIn: '1h' }
      );

      
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save({ validateModifiedOnly: true });

      
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


export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password, confirmPassword } = req.body;

    
    if (!token || !password || !confirmPassword) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Token, contraseña y confirmación de contraseña son requeridos',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    if (!validatePassword(password)) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
    if (password !== confirmPassword) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Las contraseñas no coinciden',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    
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

    
    user.password = password; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateModifiedOnly: true });

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