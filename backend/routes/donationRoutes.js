// backend/routes/donationRoutes.js (Update Code)

import express from 'express';
import { 
    createDonation, 
    getAllDonations, 
    assignDonation, 
    updateDonationStatus,
    generateAndSendOtp, 
    clearDeliveryHistory,
    getMyDonations // <-- Naya Import!
} from '../controllers/donationController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Existing Routes
router.post('/create', protect, createDonation);
router.get('/', protect, restrictTo('ngo', 'admin'), getAllDonations);
router.put('/assign/:id', protect, restrictTo('ngo', 'admin'), assignDonation);
router.put('/status/:id', protect, restrictTo('ngo', 'admin'), updateDonationStatus);
router.post('/send-otp/:id', protect, restrictTo('ngo', 'admin'), generateAndSendOtp);
router.delete('/history', protect, restrictTo('ngo', 'admin'), clearDeliveryHistory);

// FIX: New Route for Donor's Own History
// URL: /api/v1/donations/my-donations
router.get('/my-donations', protect, restrictTo('donor', 'admin'), getMyDonations); // <-- FIX ADDED

export default router;