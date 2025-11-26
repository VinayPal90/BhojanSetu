// backend/routes/authRoutes.js

import express from 'express';
import { 
    registerController, 
    loginController, 
    getUserProfile, 
    updateUserProfile, 
    verifyEmail, 
    resendOtp,
    getAllUsers, 
    updateUserVerificationStatus, 
    getSystemStats 
} from '../controllers/authController.js'; 
import { protect, restrictTo } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// REGISTER & LOGIN
router.post('/register', registerController);
router.post('/login', loginController);

// EMAIL VERIFICATION ROUTES
router.post('/verify-email', verifyEmail); 
router.post('/resend-otp', resendOtp);     

// PROFILE ROUTES
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// **********************************************
// ************** ADMIN ROUTES (PROTECTED) *************
// **********************************************

// Get all users (Admin only)
router.get('/admin/users', protect, restrictTo('admin'), getAllUsers);

// Update Verification Status (Admin only)
router.put('/admin/verify-user/:id', protect, restrictTo('admin'), updateUserVerificationStatus);

// Get System Stats (Admin only)
router.get('/admin/stats', protect, restrictTo('admin'), getSystemStats);


export default router;