import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getProgressDashboard,
  updateQuitPlan,
  getUserAchievements
} from '../controllers/userController.js';
import { authenticateToken as authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation middleware
const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Invalid phone number format'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required'),
  body('smokingHistory.yearsSmoked')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Years smoked must be between 0 and 100'),
  body('smokingHistory.averageCigarettesPerDay')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Average cigarettes per day must be between 1 and 100'),
  body('smokingHistory.costPerPack')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost per pack must be a positive number'),
  body('smokingHistory.cigarettesPerPack')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Cigarettes per pack must be between 1 and 50'),
  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Emergency contact name must be between 2 and 100 characters'),
  body('emergencyContact.phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Invalid emergency contact phone number'),
  body('emergencyContact.relationship')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Relationship must be between 2 and 50 characters'),
  handleValidationErrors
];

const validateUpdateQuitPlan = [
  body('quitDate')
    .optional()
    .isISO8601()
    .withMessage('Valid quit date is required'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('triggers')
    .optional()
    .isArray()
    .withMessage('Triggers must be an array'),
  body('copingStrategies')
    .optional()
    .isArray()
    .withMessage('Coping strategies must be an array'),
  body('supportSystem')
    .optional()
    .isArray()
    .withMessage('Support system must be an array'),
  body('goals')
    .optional()
    .isArray()
    .withMessage('Goals must be an array'),
  handleValidationErrors
];

// Routes
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, validateUpdateProfile, updateUserProfile);
router.get('/dashboard', authenticate, getProgressDashboard);
router.put('/quit-plan', authenticate, validateUpdateQuitPlan, updateQuitPlan);
router.get('/achievements', authenticate, getUserAchievements);

export default router;
