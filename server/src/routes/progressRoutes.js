import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    createCheckin,
    getUserProgress,
    getCheckinByDate,
    updateCheckin,
    deleteCheckin,
    getProgressStats,
    getChartData,
    createCheckinByUserId,
    updateCheckinByUserId,
    getProgressByUserId
} from '../controllers/progressController.js';

const router = express.Router();

// Routes without authentication for userId pattern (phù hợp với flow hiện tại)
// POST /api/progress/:userId - Create/Update daily checkin by userId
router.post('/:userId', createCheckinByUserId);

// PUT /api/progress/:userId - Update daily checkin by userId  
router.put('/:userId', updateCheckinByUserId);

// GET /api/progress/:userId - Get progress by userId
router.get('/:userId', getProgressByUserId);

// Routes với authentication (flow cũ)
// POST /api/progress/checkin - Create daily checkin
router.post('/checkin', authenticateToken, createCheckin);

// GET /api/progress/user - Get all checkins for user
router.get('/user', authenticateToken, getUserProgress);

// GET /api/progress/user/:date - Get checkin for specific date
router.get('/user/:date', authenticateToken, getCheckinByDate);

// PUT /api/progress/checkin/:date - Update checkin for specific date
router.put('/checkin/:date', authenticateToken, updateCheckin);

// DELETE /api/progress/checkin/:date - Delete checkin for specific date
router.delete('/checkin/:date', authenticateToken, deleteCheckin);

// GET /api/progress/stats - Get progress statistics
router.get('/stats', authenticateToken, getProgressStats);

// GET /api/progress/chart-data - Get data for progress charts
router.get('/chart-data', authenticateToken, getChartData);

export default router;
