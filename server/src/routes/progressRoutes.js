import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    createCheckin,
    getUserProgress,
    getCheckinByDate,
    updateCheckin,
    deleteCheckin,
    getProgressStats,
    getChartData
} from '../controllers/progressController.js';

const router = express.Router();

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
