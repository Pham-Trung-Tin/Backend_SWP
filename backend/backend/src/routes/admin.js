import express from 'express';
import {
  getPlatformStats,
  getAllUsers,
  getUserById,
  updateUserMembership,
  deactivateUser,
  getRecentActivity
} from '../controllers/adminController.js';
import { authenticateToken as authenticate, requireAdmin } from '../middleware/auth.js';
import { body, query, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Validation middleware
const validateGetAllUsers = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  query('membershipType')
    .optional()
    .isIn(['free', 'premium', 'pro'])
    .withMessage('Invalid membership type'),
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
  handleValidationErrors
];

const validateGetUserById = [
  param('id')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  handleValidationErrors
];

const validateUpdateUserMembership = [
  param('id')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('membershipType')
    .isIn(['free', 'premium', 'pro'])
    .withMessage('Invalid membership type'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Duration must be between 1 and 12 months'),
  handleValidationErrors
];

const validateDeactivateUser = [
  param('id')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  handleValidationErrors
];

const validateGetRecentActivity = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Routes
router.get('/stats', getPlatformStats);
router.get('/users', validateGetAllUsers, getAllUsers);
router.get('/users/:id', validateGetUserById, getUserById);
router.put('/users/:id/membership', validateUpdateUserMembership, updateUserMembership);
router.patch('/users/:id/deactivate', validateDeactivateUser, deactivateUser);
router.get('/activity', validateGetRecentActivity, getRecentActivity);

export default router;
