/**
 * User routes definition
 */

import { Router } from 'express';
import { 
  registerUser, 
  loginUser, 
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile, 
  updateUserProfile, 
  deleteUserAccount 
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { validateUserRegistration, validateUserLogin, validateUserUpdate } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticateToken, logoutUser);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', resetPassword);

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, validateUserUpdate, updateUserProfile);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account (soft delete)
 * @access  Private
 */
router.delete('/account', authenticateToken, deleteUserAccount);

export default router;