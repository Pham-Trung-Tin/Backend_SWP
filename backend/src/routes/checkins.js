import express from 'express';
import {
  createDailyCheckin,
  getUserCheckins,
  getTodayCheckin,
  getCheckinStats,
  getWeeklyProgress,
  deleteCheckin
} from '../controllers/checkinController.js';
import { authenticateToken as authenticate } from '../middleware/auth.js';
import { body, query, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation middleware
const validateDailyCheckin = [
  body('smokingStatus')
    .isIn(['smoke-free', 'smoked', 'relapsed'])
    .withMessage('Invalid smoking status'),
  body('cigarettesSmoked')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Cigarettes smoked must be between 0 and 100'),
  body('moodLevel')
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood level must be between 1 and 10'),
  body('cravingLevel')
    .isInt({ min: 1, max: 10 })
    .withMessage('Craving level must be between 1 and 10'),
  body('stressLevel')
    .isInt({ min: 1, max: 10 })
    .withMessage('Stress level must be between 1 and 10'),
  body('withdrawalSymptoms')
    .optional()
    .isArray()
    .withMessage('Withdrawal symptoms must be an array'),
  body('withdrawalSymptoms.*')
    .optional()
    .isIn([
      'irritability', 'anxiety', 'difficulty-concentrating', 'restlessness',
      'increased-appetite', 'sleep-disturbances', 'depression', 'fatigue',
      'headaches', 'cough', 'constipation'
    ])
    .withMessage('Invalid withdrawal symptom'),
  body('alternativeActivities')
    .optional()
    .isArray()
    .withMessage('Alternative activities must be an array'),
  body('stressFactors')
    .optional()
    .isArray()
    .withMessage('Stress factors must be an array'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('achievements')
    .optional()
    .isArray()
    .withMessage('Achievements must be an array'),
  body('weight')
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage('Weight must be between 30 and 300'),
  body('exerciseMinutes')
    .optional()
    .isInt({ min: 0, max: 600 })
    .withMessage('Exercise minutes must be between 0 and 600'),
  body('sleepHours')
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage('Sleep hours must be between 0 and 24'),
  handleValidationErrors
];

const validateGetCheckins = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  handleValidationErrors
];

const validateGetStats = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
  handleValidationErrors
];

const validateDeleteCheckin = [
  param('id')
    .isMongoId()
    .withMessage('Valid check-in ID is required'),
  handleValidationErrors
];

// Routes
router.post('/', authenticate, validateDailyCheckin, createDailyCheckin);
router.get('/', authenticate, validateGetCheckins, getUserCheckins);
router.get('/today', authenticate, getTodayCheckin);
router.get('/stats', authenticate, validateGetStats, getCheckinStats);
router.get('/weekly', authenticate, getWeeklyProgress);
router.delete('/:id', authenticate, validateDeleteCheckin, deleteCheckin);

export default router;
