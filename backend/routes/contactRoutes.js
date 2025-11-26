// backend/routes/contactRoutes.js

import express from 'express';
import { sendContactEmail } from '../controllers/contactController.js';

const router = express.Router();

// Public route for contact form submission
router.post('/', sendContactEmail);

export default router;