const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
// Get all membership types
router.get('/', membershipController.getAllMemberships);

// Get membership by type
router.get('/type/:type', membershipController.getMembershipByType);

// Protected routes
// Subscribe to a membership
router.post('/subscribe', protect, membershipController.subscribe);

// Get user's active subscription
router.get('/subscription', protect, membershipController.getActiveSubscription);

// Check access to feature
router.post('/check-access', protect, membershipController.checkFeatureAccess);

module.exports = router;