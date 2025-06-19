import express from 'express';
import {
  getMembershipInfo,
  upgradeMembership,
  cancelMembership,
  getMembershipPlans,
  getPaymentHistory
} from '../controllers/membershipController.js';
import { authenticateToken as authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation middleware
const validateUpgradeMembership = [
  body('membershipType')
    .isIn(['premium', 'pro'])
    .withMessage('Invalid membership type'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Duration must be between 1 and 12 months'),
  handleValidationErrors
];

const validateCancelMembership = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
  handleValidationErrors
];

// Routes
router.get('/info', authenticate, getMembershipInfo);
router.get('/plans', getMembershipPlans);
router.post('/upgrade', authenticate, validateUpgradeMembership, upgradeMembership);
router.post('/cancel', authenticate, validateCancelMembership, cancelMembership);
router.get('/payment-history', authenticate, getPaymentHistory);

export default router;
