// server/routes/authRoutes.js
import express from 'express';
import * as authController from '../controllers/authController.js';
import * as authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authMiddleware.verifyResetToken, authController.resetPassword);

export default router;
