import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// GET /api/quit-plans/active - Get user's active quit plan
router.get('/active', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Lấy kế hoạch mới nhất được đánh dấu là active
        const [activePlans] = await db.query(
            'SELECT * FROM quit_smoking_plan WHERE user_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1',
            [userId]
        );
        
        // Nếu không có kế hoạch active, thử lấy kế hoạch gần đây nhất
        if (activePlans.length === 0) {
            const [recentPlans] = await db.query(
                'SELECT * FROM quit_smoking_plan WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
                [userId]
            );
            
            if (recentPlans.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No quit plan found for user'
                });
            }
            
            return res.json({
                success: true,
                data: recentPlans[0],
                message: 'Retrieved most recent quit plan'
            });
        }
        
        return res.json({
            success: true,
            data: activePlans[0],
            message: 'Active quit plan retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching active quit plan:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the active quit plan',
            error: error.message
        });
    }
});

export default router;
