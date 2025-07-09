import express from 'express';
import { 
    getAllCoaches, 
    getCoachById, 
    getCoachAvailability, 
    getCoachReviews, 
    addCoachFeedback 
} from '../controllers/coachController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllCoaches);
router.get('/:id', getCoachById);
router.get('/:id/availability', getCoachAvailability);
router.get('/:id/reviews', getCoachReviews);

// Protected routes - require authentication
router.post('/:id/feedback', requireAuth, addCoachFeedback);

export default router;
