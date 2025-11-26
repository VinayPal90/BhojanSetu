// backend/routes/messageRoutes.js

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { allMessages, sendMessage, clearChatHistory } from '../controllers/messageController.js';

const router = express.Router();

// Get all messages for a donation thread
router.get('/:donationId', protect, allMessages);

// Send a new message
router.post('/', protect, sendMessage);

// NEW: Delete/Clear chat history
router.delete('/:donationId', protect, clearChatHistory);

export default router;