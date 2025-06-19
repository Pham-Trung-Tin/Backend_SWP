import express from 'express';
import {
  getUserAppointments,
  bookAppointment,
  updateAppointment,
  cancelAppointment,
  rateAppointment,
  getAvailableSlots,
  getAppointmentStats
} from '../controllers/appointmentController.js';
import { authenticateToken as authenticate } from '../middleware/auth.js';
import { body, query, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation middleware
const validateBookAppointment = [
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid time format (HH:MM) is required'),
  body('coachName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Coach name must be between 2 and 100 characters'),
  body('appointmentType')
    .isIn(['consultation', 'group-session', 'one-on-one', 'follow-up'])
    .withMessage('Invalid appointment type'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  handleValidationErrors
];

const validateUpdateAppointment = [
  param('id')
    .isMongoId()
    .withMessage('Valid appointment ID is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
  handleValidationErrors
];

const validateCancelAppointment = [
  param('id')
    .isMongoId()
    .withMessage('Valid appointment ID is required'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason cannot exceed 200 characters'),
  handleValidationErrors
];

const validateRateAppointment = [
  param('id')
    .isMongoId()
    .withMessage('Valid appointment ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Feedback cannot exceed 500 characters'),
  handleValidationErrors
];

const validateAvailableSlots = [
  query('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  query('coachId')
    .optional()
    .isMongoId()
    .withMessage('Valid coach ID is required if provided'),
  handleValidationErrors
];

// Routes
router.get('/', authenticate, getUserAppointments);
router.post('/', authenticate, validateBookAppointment, bookAppointment);
router.put('/:id', authenticate, validateUpdateAppointment, updateAppointment);
router.patch('/:id/cancel', authenticate, validateCancelAppointment, cancelAppointment);
router.post('/:id/rate', authenticate, validateRateAppointment, rateAppointment);
router.get('/available-slots', authenticate, validateAvailableSlots, getAvailableSlots);
router.get('/stats', authenticate, getAppointmentStats);

export default router;
