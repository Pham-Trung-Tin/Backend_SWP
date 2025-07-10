import { pool } from '../config/database.js';

class Coach {
    static async findAll() {
        try {
            console.log('🔍 Finding all coaches');
            
            const [rows] = await pool.query(
                `SELECT u.*, 
                    (SELECT AVG(rating) FROM feedback WHERE coach_id = u.id) as avg_rating,
                    (SELECT COUNT(*) FROM feedback WHERE coach_id = u.id) as review_count
                FROM users u
                WHERE u.role = 'coach'
                ORDER BY IFNULL(avg_rating, 0) DESC`
            );
            
            console.log(`✅ Found ${rows.length} coaches`);
            return rows;
        } catch (error) {
            console.error('❌ Error finding all coaches:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            console.log('🔍 Finding coach by id:', id);
            
            const [rows] = await pool.query(
                `SELECT u.*, 
                    (SELECT AVG(rating) FROM feedback WHERE coach_id = u.id) as avg_rating,
                    (SELECT COUNT(*) FROM feedback WHERE coach_id = u.id) as review_count
                FROM users u
                WHERE u.id = ? AND u.role = 'coach'`,
                [id]
            );
            
            if (rows.length === 0) {
                console.log('⚠️ No coach found with id:', id);
                return null;
            }
            
            console.log('✅ Coach found:', rows[0].id, rows[0].full_name || rows[0].username);
            return rows[0];
        } catch (error) {
            console.error('❌ Error finding coach by id:', error);
            throw error;
        }
    }

    static async getAvailability(id) {
        try {
            console.log('🔍 Getting availability for coach id:', id);
            
            // First check if coach exists
            const [userRows] = await pool.query(
                'SELECT id FROM users WHERE id = ? AND role = ?',
                [id, 'coach']
            );
            
            if (userRows.length === 0) {
                console.log('⚠️ No coach found with id:', id);
                return null;
            }

            // Get coach's availability
            const [availabilityRows] = await pool.query(
                `SELECT 
                    id,
                    day_of_week,
                    TIME_FORMAT(start_time, '%H:%i') as time_start,
                    TIME_FORMAT(end_time, '%H:%i') as time_end
                FROM coach_availability
                WHERE coach_id = ?
                ORDER BY day_of_week, start_time`,
                [id]
            );

            // Get booked appointments
            const [appointmentRows] = await pool.query(
                `SELECT 
                    id,
                    DATE(appointment_time) as date,
                    TIME_FORMAT(appointment_time, '%H:%i') as time,
                    duration_minutes,
                    status
                FROM appointment
                WHERE coach_id = ? AND appointment_time >= NOW() AND status != 'cancelled'
                ORDER BY appointment_time`,
                [id]
            );

            const availability = {
                coach_id: id,
                available_slots: availabilityRows,
                booked_appointments: appointmentRows
            };
            
            console.log('✅ Got availability for coach:', id);
            return availability;
        } catch (error) {
            console.error('❌ Error getting coach availability:', error);
            throw error;
        }
    }

    static async getReviews(id) {
        try {
            console.log('🔍 Getting reviews for coach id:', id);
            
            // First check if coach exists
            const [userRows] = await pool.query(
                'SELECT id FROM users WHERE id = ? AND role = ?',
                [id, 'coach']
            );
            
            if (userRows.length === 0) {
                console.log('⚠️ No coach found with id:', id);
                return null;
            }

            const [rows] = await pool.query(
                `SELECT 
                    f.id,
                    f.coach_id,
                    f.smoker_id as user_id,
                    f.rating,
                    f.content as review_text,
                    f.created_at,
                    u.full_name as user_name,
                    u.avatar_url as user_avatar
                FROM feedback f
                JOIN users u ON f.smoker_id = u.id
                WHERE f.coach_id = ?
                ORDER BY f.created_at DESC`,
                [id]
            );
            
            console.log(`✅ Found ${rows.length} reviews for coach:`, id);
            return rows;
        } catch (error) {
            console.error('❌ Error getting coach reviews:', error);
            throw error;
        }
    }

    static async addFeedback(coachId, userId, data) {
        const { rating, review_text } = data;
        
        try {
            console.log('📝 Adding feedback for coach:', coachId);
            
            // Check if coach exists
            const [coachRows] = await pool.query(
                'SELECT id FROM users WHERE id = ? AND role = ?',
                [coachId, 'coach']
            );
            
            if (coachRows.length === 0) {
                console.log('⚠️ No coach found with id:', coachId);
                return { success: false, message: 'Coach not found' };
            }
            
            // Check if feedback already exists
            const [existingFeedback] = await pool.query(
                'SELECT id FROM feedback WHERE coach_id = ? AND smoker_id = ?',
                [coachId, userId]
            );
            
            let result;
            if (existingFeedback.length > 0) {
                // Update existing feedback
                [result] = await pool.query(
                    `UPDATE feedback
                    SET rating = ?, content = ?
                    WHERE coach_id = ? AND smoker_id = ?`,
                    [rating, review_text, coachId, userId]
                );
                
                console.log('✅ Updated existing feedback for coach:', coachId);
                return { 
                    success: true, 
                    message: 'Review updated successfully',
                    feedbackId: existingFeedback[0].id
                };
            } else {
                // Create new feedback
                [result] = await pool.query(
                    `INSERT INTO feedback (coach_id, smoker_id, rating, content)
                    VALUES (?, ?, ?, ?)`,
                    [coachId, userId, rating, review_text]
                );
                
                console.log('✅ Added new feedback for coach:', coachId);
                return { 
                    success: true, 
                    message: 'Review added successfully',
                    feedbackId: result.insertId
                };
            }
        } catch (error) {
            console.error('❌ Error adding coach feedback:', error);
            throw error;
        }
    }
}

export default Coach;
