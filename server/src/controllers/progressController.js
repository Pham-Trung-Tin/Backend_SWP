import { pool } from '../config/database.js';
import { sendError, sendSuccess } from '../utils/response.js';

// POST /api/progress/checkin - Create daily checkin
export const createCheckin = async (req, res) => {
    if (!req.user || !req.user.id) {
        return sendError(res, 'Authentication required', 401);
    }

    try {
        const {
            date,
            targetCigarettes,
            actualCigarettes,
            notes,
            healthScore = 0,
            moneySaved = 0,
            cigarettesAvoided = 0
        } = req.body;

        // Validation
        if (!date) {
            return sendError(res, 'Date is required', 400);
        }

        if (targetCigarettes === undefined || targetCigarettes < 0) {
            return sendError(res, 'Target cigarettes must be a non-negative number', 400);
        }

        if (actualCigarettes === undefined || actualCigarettes < 0) {
            return sendError(res, 'Actual cigarettes must be a non-negative number', 400);
        }

        // Check if checkin already exists for this date
        const [existing] = await pool.execute(
            'SELECT id FROM daily_progress WHERE smoker_id = ? AND date = ?',
            [req.user.id, date]
        );

        if (existing.length > 0) {
            return sendError(res, 'Checkin already exists for this date. Use PUT to update.', 409);
        }
        
        // Calculate cigarettes avoided if not provided
        const calculatedCigarettesAvoided = 
            cigarettesAvoided || Math.max(0, targetCigarettes - actualCigarettes);
            
        // Calculate streak days
        let streakDays = 0;
        if (actualCigarettes === 0) {
            // Check previous streak
            const [prevStreak] = await pool.execute(
                `SELECT streak_days FROM daily_progress 
                 WHERE smoker_id = ? 
                 AND date < ? 
                 ORDER BY date DESC 
                 LIMIT 1`,
                [req.user.id, date]
            );
            
            // If there was a previous day with a streak, increment it
            streakDays = prevStreak.length > 0 ? prevStreak[0].streak_days + 1 : 1;
        }

        // Insert new checkin
        const [result] = await pool.execute(
            `INSERT INTO daily_progress 
             (smoker_id, date, target_cigarettes, actual_cigarettes, notes, 
             health_score, money_saved, cigarettes_avoided, streak_days) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                date,
                targetCigarettes,
                actualCigarettes,
                notes || null,
                healthScore,
                moneySaved,
                calculatedCigarettesAvoided,
                streakDays
            ]
        );

        // Get the created checkin
        const [checkin] = await pool.execute(
            'SELECT * FROM daily_progress WHERE id = ?',
            [result.insertId]
        );

        console.log(`✅ Checkin created for user ${req.user.id} on ${date}`);
        return sendSuccess(res, 'Daily checkin created successfully', checkin[0]);

    } catch (error) {
        console.error('❌ Error creating checkin:', error);
        return sendError(res, 'Failed to create daily checkin', 500);
    }
};

// GET /api/progress/user - Get all checkins for user
export const getUserProgress = async (req, res) => {
    if (!req.user || !req.user.id) {
        return sendError(res, 'Authentication required', 401);
    }

    try {
        const { startDate, endDate, limit } = req.query;

        let query = 'SELECT * FROM daily_progress WHERE smoker_id = ?';
        let params = [req.user.id];

        // Add date filters if provided
        if (startDate) {
            query += ' AND date >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND date <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY date DESC';

        // Add limit if provided
        if (limit && !isNaN(limit)) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }

        const [progress] = await pool.execute(query, params);

        console.log(`✅ Retrieved ${progress.length} progress entries for user ${req.user.id}`);
        return sendSuccess(res, 'User progress retrieved successfully', progress);

    } catch (error) {
        console.error('❌ Error getting user progress:', error);
        return sendError(res, 'Failed to retrieve progress data', 500);
    }
};

// GET /api/progress/user/:date - Get checkin for specific date
export const getCheckinByDate = async (req, res) => {
    if (!req.user || !req.user.id) {
        return sendError(res, 'Authentication required', 401);
    }

    try {
        const { date } = req.params;

        if (!date) {
            return sendError(res, 'Date parameter is required', 400);
        }

        const [checkin] = await pool.execute(
            'SELECT * FROM daily_progress WHERE smoker_id = ? AND date = ?',
            [req.user.id, date]
        );

        if (checkin.length === 0) {
            return sendError(res, 'No checkin found for this date', 404);
        }

        console.log(`✅ Retrieved checkin for user ${req.user.id} on ${date}`);
        return sendSuccess(res, 'Checkin retrieved successfully', checkin[0]);

    } catch (error) {
        console.error('❌ Error getting checkin by date:', error);
        return sendError(res, 'Failed to retrieve checkin', 500);
    }
};

// PUT /api/progress/checkin/:date - Update checkin for specific date
export const updateCheckin = async (req, res) => {
    if (!req.user || !req.user.id) {
        return sendError(res, 'Authentication required', 401);
    }

    try {
        const { date } = req.params;
        const {
            targetCigarettes,
            actualCigarettes,
            notes,
            healthScore,
            moneySaved,
            cigarettesAvoided
        } = req.body;

        if (!date) {
            return sendError(res, 'Date parameter is required', 400);
        }

        // Check if checkin exists
        const [existing] = await pool.execute(
            'SELECT * FROM daily_progress WHERE smoker_id = ? AND date = ?',
            [req.user.id, date]
        );

        if (existing.length === 0) {
            return sendError(res, 'No checkin found for this date', 404);
        }

        const existingRecord = existing[0];
        
        // Build update query dynamically
        const updates = [];
        const params = [];

        if (targetCigarettes !== undefined && targetCigarettes >= 0) {
            updates.push('target_cigarettes = ?');
            params.push(targetCigarettes);
        }

        if (actualCigarettes !== undefined && actualCigarettes >= 0) {
            updates.push('actual_cigarettes = ?');
            params.push(actualCigarettes);
            
            // Recalculate streak_days
            let streakDays = 0;
            if (actualCigarettes === 0) {
                // Check previous day's streak
                const [prevStreak] = await pool.execute(
                    `SELECT streak_days FROM daily_progress 
                     WHERE smoker_id = ? 
                     AND date < ? 
                     ORDER BY date DESC 
                     LIMIT 1`,
                    [req.user.id, date]
                );
                
                streakDays = prevStreak.length > 0 ? prevStreak[0].streak_days + 1 : 1;
                updates.push('streak_days = ?');
                params.push(streakDays);
            } else if (existingRecord.streak_days > 0) {
                // Reset streak if user smoked today
                updates.push('streak_days = 0');
            }
            
            // Recalculate cigarettes avoided if target was provided too
            if (targetCigarettes !== undefined) {
                const calculatedCigarettesAvoided = Math.max(0, targetCigarettes - actualCigarettes);
                updates.push('cigarettes_avoided = ?');
                params.push(calculatedCigarettesAvoided);
            }
        }

        if (notes !== undefined) {
            updates.push('notes = ?');
            params.push(notes);
        }

        if (healthScore !== undefined) {
            updates.push('health_score = ?');
            params.push(healthScore);
        }

        if (moneySaved !== undefined) {
            updates.push('money_saved = ?');
            params.push(moneySaved);
        }
        
        if (cigarettesAvoided !== undefined) {
            updates.push('cigarettes_avoided = ?');
            params.push(cigarettesAvoided);
        }

        if (updates.length === 0) {
            return sendError(res, 'No fields to update', 400);
        }

        params.push(req.user.id, date);

        const updateQuery = `
            UPDATE daily_progress 
            SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
            WHERE smoker_id = ? AND date = ?
        `;

        await pool.execute(updateQuery, params);

        // Get updated checkin
        const [updated] = await pool.execute(
            'SELECT * FROM daily_progress WHERE smoker_id = ? AND date = ?',
            [req.user.id, date]
        );

        console.log(`✅ Checkin updated for user ${req.user.id} on ${date}`);
        return sendSuccess(res, 'Checkin updated successfully', updated[0]);

    } catch (error) {
        console.error('❌ Error updating checkin:', error);
        return sendError(res, 'Failed to update checkin', 500);
    }
};

// DELETE /api/progress/checkin/:date - Delete checkin for specific date
export const deleteCheckin = async (req, res) => {
    if (!req.user || !req.user.id) {
        return sendError(res, 'Authentication required', 401);
    }

    try {
        const { date } = req.params;

        if (!date) {
            return sendError(res, 'Date parameter is required', 400);
        }

        // Check if checkin exists
        const [existing] = await pool.execute(
            'SELECT * FROM daily_progress WHERE smoker_id = ? AND date = ?',
            [req.user.id, date]
        );

        if (existing.length === 0) {
            return sendError(res, 'No checkin found for this date', 404);
        }

        // Delete checkin
        await pool.execute(
            'DELETE FROM daily_progress WHERE smoker_id = ? AND date = ?',
            [req.user.id, date]
        );

        console.log(`✅ Checkin deleted for user ${req.user.id} on ${date}`);
        return sendSuccess(res, 'Checkin deleted successfully', existing[0]);

    } catch (error) {
        console.error('❌ Error deleting checkin:', error);
        return sendError(res, 'Failed to delete checkin', 500);
    }
};

// GET /api/progress/stats - Get progress statistics
export const getProgressStats = async (req, res) => {
    if (!req.user || !req.user.id) {
        return sendError(res, 'Authentication required', 401);
    }

    try {
        const { days = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        const startDateStr = startDate.toISOString().split('T')[0];

        // Get basic stats
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_checkins,
                AVG(actual_cigarettes) as avg_cigarettes,
                SUM(CASE WHEN actual_cigarettes <= target_cigarettes THEN 1 ELSE 0 END) as goals_met,
                MIN(actual_cigarettes) as best_day,
                MAX(actual_cigarettes) as worst_day,
                MAX(streak_days) as max_streak,
                SUM(cigarettes_avoided) as total_cigarettes_avoided,
                SUM(money_saved) as total_money_saved,
                AVG(health_score) as avg_health_score
            FROM daily_progress 
            WHERE smoker_id = ? AND date >= ?
        `, [req.user.id, startDateStr]);

        // Get streak information
        const [recentCheckins] = await pool.execute(`
            SELECT date, actual_cigarettes, target_cigarettes
            FROM daily_progress 
            WHERE smoker_id = ?
            ORDER BY date DESC
            LIMIT 30
        `, [req.user.id]);

        // Calculate current streak
        let currentStreak = 0;
        for (const checkin of recentCheckins) {
            if (checkin.actual_cigarettes <= checkin.target_cigarettes) {
                currentStreak++;
            } else {
                break;
            }
        }

        // Get total reduction since first checkin
        const [firstCheckin] = await pool.execute(`
            SELECT actual_cigarettes, date
            FROM daily_progress 
            WHERE smoker_id = ?
            ORDER BY date ASC
            LIMIT 1
        `, [req.user.id]);

        const [lastCheckin] = await pool.execute(`
            SELECT actual_cigarettes, date
            FROM daily_progress 
            WHERE smoker_id = ?
            ORDER BY date DESC
            LIMIT 1
        `, [req.user.id]);

        let totalReduction = 0;
        let reductionPercentage = 0;
        if (firstCheckin.length > 0 && lastCheckin.length > 0) {
            totalReduction = firstCheckin[0].actual_cigarettes - lastCheckin[0].actual_cigarettes;
            reductionPercentage = firstCheckin[0].actual_cigarettes > 0
                ? Math.round((totalReduction / firstCheckin[0].actual_cigarettes) * 100)
                : 0;
        }

        const result = {
            period_days: parseInt(days),
            total_checkins: stats[0].total_checkins || 0,
            avg_cigarettes: Math.round((stats[0].avg_cigarettes || 0) * 10) / 10,
            goals_met: stats[0].goals_met || 0,
            success_rate: stats[0].total_checkins > 0
                ? Math.round((stats[0].goals_met / stats[0].total_checkins) * 100)
                : 0,
            best_day: stats[0].best_day || 0,
            worst_day: stats[0].worst_day || 0,
            current_streak: currentStreak,
            max_streak: stats[0].max_streak || 0,
            total_reduction: totalReduction,
            reduction_percentage: reductionPercentage,
            total_cigarettes_avoided: stats[0].total_cigarettes_avoided || 0,
            total_money_saved: stats[0].total_money_saved || 0,
            avg_health_score: stats[0].avg_health_score ? Math.round(stats[0].avg_health_score * 10) / 10 : 0,
            first_checkin_date: firstCheckin.length > 0 ? firstCheckin[0].date : null,
            last_checkin_date: lastCheckin.length > 0 ? lastCheckin[0].date : null
        };

        console.log(`✅ Stats calculated for user ${req.user.id} (${days} days)`);
        return sendSuccess(res, 'Progress statistics retrieved successfully', result);

    } catch (error) {
        console.error('❌ Error getting progress stats:', error);
        return sendError(res, 'Failed to retrieve progress statistics', 500);
    }
};

// GET /api/progress/chart-data - Get data for progress charts
export const getChartData = async (req, res) => {
    if (!req.user || !req.user.id) {
        return sendError(res, 'Authentication required', 401);
    }

    try {
        const { days = 30, type = 'cigarettes' } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        const startDateStr = startDate.toISOString().split('T')[0];

        let query, fields;

        switch (type) {
            case 'cigarettes':
                fields = 'date, actual_cigarettes, target_cigarettes';
                break;
            case 'health':
                fields = 'date, health_score, cigarettes_avoided, streak_days';
                break;
            case 'financial':
                fields = 'date, money_saved, cigarettes_avoided';
                break;
            case 'comprehensive':
                fields = 'date, actual_cigarettes, target_cigarettes, health_score, money_saved, cigarettes_avoided';
                break;
            default:
                fields = 'date, actual_cigarettes, target_cigarettes';
        }

        query = `
            SELECT ${fields}
            FROM daily_progress 
            WHERE smoker_id = ? AND date >= ?
            ORDER BY date ASC
        `;

        const [chartData] = await pool.execute(query, [req.user.id, startDateStr]);

        // Format data for frontend charts
        const formattedData = chartData.map(row => ({
            date: row.date,
            actual: row.actual_cigarettes || 0,
            target: row.target_cigarettes || 0,
            healthScore: row.health_score || 0,
            cigarettesAvoided: row.cigarettes_avoided || 0,
            moneySaved: row.money_saved || 0,
            streakDays: row.streak_days || 0
        }));

        console.log(`✅ Chart data retrieved for user ${req.user.id} (${days} days, type: ${type})`);
        return sendSuccess(res, 'Chart data retrieved successfully', {
            type,
            period_days: parseInt(days),
            data: formattedData
        });

    } catch (error) {
        console.error('❌ Error getting chart data:', error);
        return sendError(res, 'Failed to retrieve chart data', 500);
    }
};

// POST /api/progress/:userId - Create daily checkin with userId (no auth required)
export const createCheckinByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            date = new Date().toISOString().split('T')[0],
            targetCigarettes,
            actualCigarettes,
            notes,
            healthScore = 0,
            moneySaved = 0,
            cigarettesAvoided = 0,
            toolType = 'quit_smoking_plan',
            daysClean = 0,
            vapesAvoided = 0,
            progressPercentage = 0,
            progressData = {}
        } = req.body;

        console.log(`📝 Creating checkin for user ${userId} on ${date}:`, req.body);

        // Validation
        if (!userId) {
            return sendError(res, 'User ID is required', 400);
        }

        if (targetCigarettes === undefined || targetCigarettes < 0) {
            return sendError(res, 'Target cigarettes must be a non-negative number', 400);
        }

        if (actualCigarettes === undefined || actualCigarettes < 0) {
            return sendError(res, 'Actual cigarettes must be a non-negative number', 400);
        }

        // Check if user exists
        const [userCheck] = await pool.execute(
            'SELECT id FROM users WHERE id = ?',
            [userId]
        );

        if (userCheck.length === 0) {
            return sendError(res, 'User not found', 404);
        }

        // Check if checkin already exists for this date
        const [existing] = await pool.execute(
            'SELECT id FROM daily_progress WHERE smoker_id = ? AND date = ?',
            [userId, date]
        );

        if (existing.length > 0) {
            console.log(`⚠️ Checkin already exists for user ${userId} on ${date}, updating instead...`);
            // Update existing checkin
            return updateCheckinByUserId(req, res);
        }
        
        // Calculate cigarettes avoided if not provided
        const calculatedCigarettesAvoided = 
            cigarettesAvoided || Math.max(0, targetCigarettes - actualCigarettes);
            
        // Calculate streak days
        let streakDays = 0;
        if (actualCigarettes === 0) {
            // Check previous streak
            const [prevStreak] = await pool.execute(
                `SELECT streak_days FROM daily_progress 
                 WHERE smoker_id = ? 
                 AND date < ? 
                 ORDER BY date DESC 
                 LIMIT 1`,
                [userId, date]
            );
            
            // If there was a previous day with a streak, increment it
            streakDays = prevStreak.length > 0 ? prevStreak[0].streak_days + 1 : 1;
        }

        // Calculate progress percentage if not provided
        const calculatedProgressPercentage = progressPercentage || 
            (targetCigarettes > 0 ? Math.round(((targetCigarettes - actualCigarettes) / targetCigarettes) * 100) : 0);

        // Insert new checkin
        const [result] = await pool.execute(
            `INSERT INTO daily_progress 
             (smoker_id, date, target_cigarettes, actual_cigarettes, notes, 
             health_score, money_saved, cigarettes_avoided, streak_days, 
             tool_type, days_clean, vapes_avoided, progress_percentage, progress_data) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                date,
                targetCigarettes,
                actualCigarettes,
                notes || null,
                healthScore,
                moneySaved,
                calculatedCigarettesAvoided,
                streakDays,
                toolType,
                daysClean,
                vapesAvoided,
                calculatedProgressPercentage,
                JSON.stringify(progressData)
            ]
        );

        // Get the created checkin
        const [checkin] = await pool.execute(
            'SELECT * FROM daily_progress WHERE id = ?',
            [result.insertId]
        );

        console.log(`✅ Checkin created for user ${userId} on ${date} with ID ${result.insertId}`);
        return sendSuccess(res, 'Daily checkin created successfully', checkin[0]);

    } catch (error) {
        console.error('❌ Error creating checkin by userId:', error);
        return sendError(res, 'Failed to create daily checkin', 500);
    }
};

// PUT /api/progress/:userId - Update daily checkin with userId (no auth required)
export const updateCheckinByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            date = new Date().toISOString().split('T')[0],
            targetCigarettes,
            actualCigarettes,
            notes,
            healthScore,
            moneySaved,
            cigarettesAvoided,
            toolType,
            daysClean,
            vapesAvoided,
            progressPercentage,
            progressData
        } = req.body;

        console.log(`📝 Updating checkin for user ${userId} on ${date}:`, req.body);

        if (!userId) {
            return sendError(res, 'User ID is required', 400);
        }

        // Check if checkin exists
        const [existing] = await pool.execute(
            'SELECT * FROM daily_progress WHERE smoker_id = ? AND date = ?',
            [userId, date]
        );

        if (existing.length === 0) {
            return sendError(res, 'No checkin found for this date', 404);
        }

        const existingRecord = existing[0];
        
        // Build update query dynamically
        const updates = [];
        const params = [];

        if (targetCigarettes !== undefined && targetCigarettes >= 0) {
            updates.push('target_cigarettes = ?');
            params.push(targetCigarettes);
        }

        if (actualCigarettes !== undefined && actualCigarettes >= 0) {
            updates.push('actual_cigarettes = ?');
            params.push(actualCigarettes);
            
            // Recalculate streak_days
            let streakDays = 0;
            if (actualCigarettes === 0) {
                // Check previous day's streak
                const [prevStreak] = await pool.execute(
                    `SELECT streak_days FROM daily_progress 
                     WHERE smoker_id = ? 
                     AND date < ? 
                     ORDER BY date DESC 
                     LIMIT 1`,
                    [userId, date]
                );
                
                streakDays = prevStreak.length > 0 ? prevStreak[0].streak_days + 1 : 1;
                updates.push('streak_days = ?');
                params.push(streakDays);
            } else if (existingRecord.streak_days > 0) {
                // Reset streak if user smoked today
                updates.push('streak_days = 0');
            }
            
            // Recalculate cigarettes avoided and progress percentage
            if (targetCigarettes !== undefined) {
                const calculatedCigarettesAvoided = Math.max(0, targetCigarettes - actualCigarettes);
                updates.push('cigarettes_avoided = ?');
                params.push(calculatedCigarettesAvoided);
                
                const calculatedProgressPercentage = targetCigarettes > 0 ? 
                    Math.round(((targetCigarettes - actualCigarettes) / targetCigarettes) * 100) : 0;
                updates.push('progress_percentage = ?');
                params.push(calculatedProgressPercentage);
            }
        }

        if (notes !== undefined) {
            updates.push('notes = ?');
            params.push(notes);
        }

        if (healthScore !== undefined) {
            updates.push('health_score = ?');
            params.push(healthScore);
        }

        if (moneySaved !== undefined) {
            updates.push('money_saved = ?');
            params.push(moneySaved);
        }
        
        if (cigarettesAvoided !== undefined) {
            updates.push('cigarettes_avoided = ?');
            params.push(cigarettesAvoided);
        }

        if (toolType !== undefined) {
            updates.push('tool_type = ?');
            params.push(toolType);
        }

        if (daysClean !== undefined) {
            updates.push('days_clean = ?');
            params.push(daysClean);
        }

        if (vapesAvoided !== undefined) {
            updates.push('vapes_avoided = ?');
            params.push(vapesAvoided);
        }

        if (progressPercentage !== undefined) {
            updates.push('progress_percentage = ?');
            params.push(progressPercentage);
        }

        if (progressData !== undefined) {
            updates.push('progress_data = ?');
            params.push(JSON.stringify(progressData));
        }

        if (updates.length === 0) {
            return sendError(res, 'No fields to update', 400);
        }

        params.push(userId, date);

        const updateQuery = `
            UPDATE daily_progress 
            SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
            WHERE smoker_id = ? AND date = ?
        `;

        await pool.execute(updateQuery, params);

        // Get updated checkin
        const [updated] = await pool.execute(
            'SELECT * FROM daily_progress WHERE smoker_id = ? AND date = ?',
            [userId, date]
        );

        console.log(`✅ Checkin updated for user ${userId} on ${date}`);
        return sendSuccess(res, 'Checkin updated successfully', updated[0]);

    } catch (error) {
        console.error('❌ Error updating checkin by userId:', error);
        return sendError(res, 'Failed to update checkin', 500);
    }
};

// GET /api/progress/:userId - Get all progress for user (no auth required)
export const getProgressByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, limit } = req.query;

        if (!userId) {
            return sendError(res, 'User ID is required', 400);
        }

        let query = 'SELECT * FROM daily_progress WHERE smoker_id = ?';
        let params = [userId];

        // Add date filters if provided
        if (startDate) {
            query += ' AND date >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND date <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY date DESC';

        // Add limit if provided
        if (limit && !isNaN(limit)) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }

        const [progress] = await pool.execute(query, params);

        console.log(`✅ Retrieved ${progress.length} progress entries for user ${userId}`);
        return sendSuccess(res, 'User progress retrieved successfully', progress);

    } catch (error) {
        console.error('❌ Error getting progress by userId:', error);
        return sendError(res, 'Failed to retrieve progress data', 500);
    }
};
