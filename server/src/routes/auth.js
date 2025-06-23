import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController.js';
import {
    validateRegister,
    validateLogin,
    validateProfileUpdate,
    validateChangePassword,
    validateEmailVerification,
    validateResendVerification,
    validateForgotPassword,
    validateResetPassword,
    validateRefreshToken,
    handleValidationErrors
} from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting configurations
const authLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS), // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false
});

const loginLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000, // 15 minutes
    max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX), // Limit each IP to 5 login requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.',
        data: null
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Public routes
router.post('/register',
    authLimiter,
    validateRegister,
    handleValidationErrors,
    authController.register
);

router.post('/login',
    loginLimiter,
    validateLogin,
    handleValidationErrors,
    authController.login
);

router.post('/refresh-token',
    authLimiter,
    validateRefreshToken,
    handleValidationErrors,
    authController.refreshToken
);

router.post('/verify-email',
    authLimiter,
    validateEmailVerification,
    handleValidationErrors,
    authController.verifyEmail
);

router.post('/resend-verification',
    authLimiter,
    validateResendVerification,
    handleValidationErrors,
    authController.resendVerificationCode
);

router.post('/forgot-password',
    authLimiter,
    validateForgotPassword,
    handleValidationErrors,
    authController.forgotPassword
);

router.post('/reset-password',
    authLimiter,
    validateResetPassword,
    handleValidationErrors,
    authController.resetPassword
);

// Protected routes
router.get('/profile',
    authenticateToken,
    authController.getProfile
);

router.put('/profile',
    authenticateToken,
    validateProfileUpdate,
    handleValidationErrors,
    authController.updateProfile
);

router.post('/change-password',
    authenticateToken,
    validateChangePassword,
    handleValidationErrors,
    authController.changePassword
);

router.post('/logout',
    authenticateToken,
    authController.logout
);

export default router;
