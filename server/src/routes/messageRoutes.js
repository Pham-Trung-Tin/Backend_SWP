import express from 'express';
import { 
    getAppointmentMessages, 
    createMessage, 
    markMessagesAsRead, 
    getUnreadMessageCounts 
} from '../controllers/messageController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route GET /api/messages/unread-counts
 * @desc Get unread message counts for the authenticated user
 * @access Private - Requires authentication
 */
router.get('/unread-counts', requireAuth, getUnreadMessageCounts);

export default router;
