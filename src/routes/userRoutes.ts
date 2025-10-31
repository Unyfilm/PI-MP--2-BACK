import { Router } from 'express';
import { 
  registerUser, 
  loginUser, 
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile, 
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount 
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { validateUserRegistration, validateUserLogin, validateUserUpdate } from '../middleware/validation';

const router = Router();

router.post('/register', registerUser);


router.post('/login', loginUser);


router.post('/logout', authenticateToken, logoutUser);


router.post('/forgot-password', forgotPassword);


router.post('/reset-password', resetPassword);


router.get('/profile', authenticateToken, getUserProfile);


router.put('/profile', authenticateToken, validateUserUpdate, updateUserProfile);

router.put('/change-password', authenticateToken, changeUserPassword);


router.delete('/account', authenticateToken, deleteUserAccount);

export default router;