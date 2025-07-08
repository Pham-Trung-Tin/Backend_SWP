import { body, validationResult } from 'express-validator';
import { sendValidationError } from '../utils/response.js';

// Validation rules for registration
export const validateRegister = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'), body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),

    body('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),

    body('phone')
        .optional()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Phone number must be 10-11 digits'),

    body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Date of birth must be a valid date'), body('gender')
            .optional()
            .isIn(['male', 'female', 'other'])
            .withMessage('Gender must be male, female, or other'),

    // Smoking information (optional for registration)
    body('cigarettesPerDay')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Cigarettes per day must be between 0 and 100'),

    body('costPerPack')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Cost per pack must be a positive number'),

    body('cigarettesPerPack')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Cigarettes per pack must be between 1 and 50')
];

// Validation rules for login
export const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Please provide email or username'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Validation rules for profile update
export const validateProfileUpdate = [
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),

    body('phone')
        .optional()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Phone number must be 10-11 digits'),

    body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Date of birth must be a valid date'),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),

    body('avatarUrl')
        .optional()
        .isURL()
        .withMessage('Avatar URL must be a valid URL')
];

// Validation rules for password change
export const validateChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'), body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Password confirmation does not match');
                }
                return true;
            })
];

// Validation rules for email verification
export const validateEmailVerification = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('verificationCode')
        .trim()
        .isLength({ min: 6, max: 6 })
        .matches(/^[0-9]{6}$/)
        .withMessage('Verification code must be 6 digits')
];

// Validation rules for resend verification
export const validateResendVerification = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
];

// Validation rules for forgot password
export const validateForgotPassword = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
];

// Validation rules for reset password
export const validateResetPassword = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('resetCode')
        .trim()
        .isLength({ min: 6, max: 6 })
        .matches(/^[0-9]{6}$/)
        .withMessage('Reset code must be 6 digits'),

    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
];

// Validation rules for refresh token
export const validateRefreshToken = [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required')
];

// Middleware to handle validation errors
// Validation rules for smoking status update
export const validateSmokingStatus = [
    body('smokingStatus')
        .isIn(['active', 'quitting', 'quit'])
        .withMessage('Smoking status must be active, quitting, or quit'),
        
    body('cigarettesPerDay')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Cigarettes per day must be a number between 0 and 100'),
        
    body('yearsSmoked')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Years smoked must be a number between 0 and 100'),
        
    body('quitDate')
        .optional()
        .isISO8601()
        .withMessage('Quit date must be a valid date')
];

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendValidationError(res, errors.array());
    }
    next();
};
