import { pool } from '../config/database.js';

/**
 * Model class for handling appointment-related database operations
 */
class Appointment {
    /**
     * Create a new appointment
     * @param {Object} appointmentData - Data for the new appointment
     * @returns {Object} The created appointment with ID
     */
    static async create(appointmentData) {
        try {
            console.log('🔍 Creating new appointment:', appointmentData);
            
            const { coach_id, user_id, appointment_time, duration_minutes } = appointmentData;
            
            // Validate coach exists and is actually a coach
            const [coachRows] = await pool.query(
                'SELECT id FROM users WHERE id = ? AND role = ?',
                [coach_id, 'coach']
            );
            
            if (coachRows.length === 0) {
                console.log('⚠️ Invalid coach ID or not a coach:', coach_id);
                return { error: 'Invalid coach ID' };
            }
            
            // Validate user exists
            const [userRows] = await pool.query(
                'SELECT id FROM users WHERE id = ?',
                [user_id]
            );
            
            if (userRows.length === 0) {
                console.log('⚠️ Invalid user ID:', user_id);
                return { error: 'Invalid user ID' };
            }
            
            // Parse and validate appointment time
            let appointmentDate;
            try {
                appointmentDate = new Date(appointment_time);
                
                // Check if date is valid
                if (isNaN(appointmentDate.getTime())) {
                    console.log('⚠️ Invalid appointment time format:', appointment_time);
                    return { error: 'Invalid appointment time format. Use ISO format (YYYY-MM-DDTHH:MM:SSZ)' };
                }
                
                // Check if appointment is in the future
                const now = new Date();
                if (appointmentDate <= now) {
                    console.log('⚠️ Appointment time must be in the future:', appointment_time);
                    return { error: 'Appointment time must be in the future' };
                }
            } catch (error) {
                console.log('⚠️ Error parsing appointment time:', error);
                return { error: 'Invalid appointment time format. Use ISO format (YYYY-MM-DDTHH:MM:SSZ)' };
            }
            
            // Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
            let dayOfWeek = appointmentDate.getDay();
            
            // Map JavaScript day number to day name for string comparison
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[dayOfWeek];
            
            const appointmentTimeStr = appointmentDate.toTimeString().slice(0, 8);
            
            // Check if the coach_availability table uses coach_id or user_id
            const [availabilityColumns] = await pool.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'coach_availability' 
                AND (COLUMN_NAME = 'coach_id' OR COLUMN_NAME = 'user_id')
            `);
            
            let coachIdColumn = 'coach_id'; // Default column name
            
            // If we found a different column name for the coach ID, use it
            if (availabilityColumns.length > 0) {
                coachIdColumn = availabilityColumns[0].COLUMN_NAME;
                console.log(`📋 Found coach ID column name in availability table: ${coachIdColumn}`);
            }
            
            // Check if the coach_availability table uses start_time/end_time or time_start/time_end
            const [timeColumns] = await pool.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'coach_availability' 
                AND (COLUMN_NAME = 'start_time' OR COLUMN_NAME = 'time_start')
                ORDER BY COLUMN_NAME
            `);
            
            // Define default column names
            let startTimeColumn = 'start_time';
            let endTimeColumn = 'end_time';
            
            // If we found a different naming pattern for time columns
            if (timeColumns.length > 0) {
                if (timeColumns[0].COLUMN_NAME === 'time_start') {
                    startTimeColumn = 'time_start';
                    endTimeColumn = 'time_end';
                }
                console.log(`📋 Found time column names in availability table: ${startTimeColumn}/${endTimeColumn}`);
            }
            
            console.log('🔍 Checking availability with:', {
                coach_id,
                dayOfWeek,
                dayName,
                appointmentTimeStr,
                date: appointmentDate,
                coachIdColumn,
                startTimeColumn,
                endTimeColumn
            });
            
            const [availabilityRows] = await pool.query(
                `SELECT id FROM coach_availability 
                 WHERE ${coachIdColumn} = ? 
                 AND day_of_week = ?
                 AND ? BETWEEN ${startTimeColumn} AND ${endTimeColumn}`,
                [coach_id, dayName, appointmentTimeStr]
            );
            
            if (availabilityRows.length === 0) {
                console.log('⚠️ Appointment time not within coach availability');
                return { error: 'Appointment time not within coach availability' };
            }
            
            // Check if appointment time conflicts with existing appointments
            const appointmentEndTime = new Date(appointmentDate);
            appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + duration_minutes);
            
            const [conflictRows] = await pool.query(
                `SELECT id FROM appointments
                 WHERE coach_id = ?
                 AND status != 'cancelled'
                 AND date = ? 
                 AND (
                    (time <= ? AND ADDTIME(time, SEC_TO_TIME(IFNULL(duration_minutes, 30) * 60)) > ?)
                    OR
                    (time < ? AND ADDTIME(time, SEC_TO_TIME(IFNULL(duration_minutes, 30) * 60)) >= ?)
                    OR
                    (time >= ? AND time < ?)
                 )`,
                [
                  coach_id, 
                  appointmentDate.toISOString().split('T')[0], // Date part only YYYY-MM-DD
                  appointmentTimeStr, // Time in HH:MM:SS format
                  appointmentTimeStr, 
                  appointmentTimeStr, 
                  appointmentTimeStr, 
                  appointmentTimeStr, 
                  appointmentEndTime.toTimeString().slice(0, 8) // End time in HH:MM:SS format
                ]
            );
            
            if (conflictRows.length > 0) {
                console.log('⚠️ Appointment time conflicts with existing appointment');
                return { error: 'Appointment time conflicts with existing appointment' };
            }
            
            // Split the appointment time into date and time parts for the appointments table
            const appointmentDatePart = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD
            const appointmentTimePart = appointmentTimeStr; // HH:MM:SS
            
            // Create appointment
            const [result] = await pool.query(
                `INSERT INTO appointments (coach_id, user_id, date, time, status, duration_minutes)
                 VALUES (?, ?, ?, ?, 'pending', ?)`,
                [coach_id, user_id, appointmentDatePart, appointmentTimePart, duration_minutes]
            );
            
            if (result.affectedRows === 0) {
                console.log('❌ Failed to create appointment');
                return { error: 'Failed to create appointment' };
            }
            
            // Get the created appointment
            const [appointmentRows] = await pool.query(
                `SELECT a.*, u.full_name as coach_name, u.profile_image as coach_avatar
                 FROM appointments a
                 JOIN users u ON a.coach_id = u.id
                 WHERE a.id = ?`,
                [result.insertId]
            );
            
            console.log('✅ Appointment created successfully with ID:', result.insertId);
            return appointmentRows[0];
        } catch (error) {
            console.error('❌ Error creating appointment:', error);
            throw error;
        }
    }
    
    /**
     * Get all appointments for a user
     * @param {number} userId - The user's ID
     * @returns {Array} List of appointments for the user
     */
    static async getByUserId(userId) {
        try {
            console.log('🔍 Getting appointments for user ID:', userId);
            
            // First check the column name in the appointments table
            const [columns] = await pool.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'appointments' 
                AND (COLUMN_NAME = 'user_id' OR COLUMN_NAME = 'smoker_id' OR COLUMN_NAME = 'client_id' OR COLUMN_NAME = 'member_id')
            `);
            
            let userIdColumn = 'user_id'; // Default column name
            
            // If we found a different column name for the user ID, use it
            if (columns.length > 0) {
                userIdColumn = columns[0].COLUMN_NAME;
                console.log(`📋 Found user ID column name: ${userIdColumn}`);
            }
            
            const [rows] = await pool.query(
                `SELECT a.*, u.full_name as coach_name, u.profile_image as coach_avatar,
                 CONCAT(a.date, 'T', a.time) as appointment_time 
                 FROM appointments a
                 JOIN users u ON a.coach_id = u.id
                 WHERE a.${userIdColumn} = ?
                 ORDER BY a.date DESC, a.time DESC`,
                [userId]
            );
            
            console.log(`✅ Found ${rows.length} appointments for user ID:`, userId);
            return rows;
        } catch (error) {
            console.error('❌ Error getting appointments for user:', error);
            throw error;
        }
    }
    
    /**
     * Get a specific appointment by ID
     * @param {number} id - The appointment ID
     * @returns {Object} The appointment details
     */
    static async getById(id) {
        try {
            console.log('🔍 Getting appointment by ID:', id);
            
            const [rows] = await pool.query(
                `SELECT a.*, 
                        u_coach.full_name as coach_name, 
                        u_coach.profile_image as coach_avatar,
                        u_user.full_name as user_name,
                        u_user.profile_image as user_avatar,
                        CONCAT(a.date, 'T', a.time) as appointment_time
                 FROM appointments a
                 JOIN users u_coach ON a.coach_id = u_coach.id
                 JOIN users u_user ON a.user_id = u_user.id
                 WHERE a.id = ?`,
                [id]
            );
            
            if (rows.length === 0) {
                console.log('⚠️ Appointment not found with ID:', id);
                return null;
            }
            
            console.log('✅ Found appointment with ID:', id);
            return rows[0];
        } catch (error) {
            console.error('❌ Error getting appointment by ID:', error);
            throw error;
        }
    }
    
    /**
     * Update an appointment's details
     * @param {number} id - The appointment ID
     * @param {Object} updateData - The data to update
     * @returns {Object} The updated appointment
     */
    static async update(id, updateData) {
        try {
            console.log('🔍 Updating appointment ID:', id, 'with data:', updateData);
            
            // Get the current appointment to check status
            const [currentAppointment] = await pool.query(
                'SELECT * FROM appointments WHERE id = ?',
                [id]
            );
            
            if (currentAppointment.length === 0) {
                console.log('⚠️ Appointment not found with ID:', id);
                return { error: 'Appointment not found' };
            }
            
            if (currentAppointment[0].status === 'cancelled') {
                console.log('⚠️ Cannot update cancelled appointment with ID:', id);
                return { error: 'Cannot update cancelled appointment' };
            }
            
            if (updateData.appointment_time) {
                // Parse and validate appointment time
                try {
                    const appointmentDate = new Date(updateData.appointment_time);
                    
                    // Check if date is valid
                    if (isNaN(appointmentDate.getTime())) {
                        console.log('⚠️ Invalid appointment time format:', updateData.appointment_time);
                        return { error: 'Invalid appointment time format. Use ISO format (YYYY-MM-DDTHH:MM:SSZ)' };
                    }
                    
                    // Check if appointment is in the future
                    const now = new Date();
                    if (appointmentDate <= now) {
                        console.log('⚠️ Appointment time must be in the future:', updateData.appointment_time);
                        return { error: 'Appointment time must be in the future' };
                    }
                    
                    // Split into date and time for the appointments table
                    updateData.date = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD
                    updateData.time = appointmentDate.toTimeString().slice(0, 8);  // HH:MM:SS
                    
                    // Remove the appointment_time field as we're using separate date and time
                    delete updateData.appointment_time;
                    
                } catch (error) {
                    console.log('⚠️ Error parsing appointment time:', error);
                    return { error: 'Invalid appointment time format. Use ISO format (YYYY-MM-DDTHH:MM:SSZ)' };
                }
                
                // For coach availability check
                // Get the date and time to check
                const checkDate = updateData.date || currentAppointment[0].date;
                const checkTime = updateData.time || currentAppointment[0].time;
                const appointmentToCheck = new Date(checkDate + 'T' + checkTime);
                
                // Map JavaScript day number to day name for string comparison
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const dayName = dayNames[appointmentToCheck.getDay()];
                const appointmentTimeStr = checkTime;
                
                // Check if the coach_availability table uses coach_id or user_id
                const [availabilityColumns] = await pool.query(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'coach_availability' 
                    AND (COLUMN_NAME = 'coach_id' OR COLUMN_NAME = 'user_id')
                `);
                
                let coachIdColumn = 'coach_id'; // Default column name
                
                // If we found a different column name for the coach ID, use it
                if (availabilityColumns.length > 0) {
                    coachIdColumn = availabilityColumns[0].COLUMN_NAME;
                    console.log(`📋 Found coach ID column name in availability table: ${coachIdColumn}`);
                }
                
                // Check if the coach_availability table uses start_time/end_time or time_start/time_end
                const [timeColumns] = await pool.query(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'coach_availability' 
                    AND (COLUMN_NAME = 'start_time' OR COLUMN_NAME = 'time_start')
                    ORDER BY COLUMN_NAME
                `);
                
                // Define default column names
                let startTimeColumn = 'start_time';
                let endTimeColumn = 'end_time';
                
                // If we found a different naming pattern for time columns
                if (timeColumns.length > 0) {
                    if (timeColumns[0].COLUMN_NAME === 'time_start') {
                        startTimeColumn = 'time_start';
                        endTimeColumn = 'time_end';
                    }
                    console.log(`📋 Found time column names in availability table: ${startTimeColumn}/${endTimeColumn}`);
                }
                
                console.log('🔍 Checking availability with:', {
                    coach_id: currentAppointment[0].coach_id,
                    dayName,
                    appointmentTimeStr,
                    date: appointmentToCheck,
                    coachIdColumn,
                    startTimeColumn,
                    endTimeColumn
                });
                
                // Check if new time is within coach's availability
                const [availabilityRows] = await pool.query(
                    `SELECT id FROM coach_availability 
                     WHERE ${coachIdColumn} = ? 
                     AND day_of_week = ?
                     AND ? BETWEEN ${startTimeColumn} AND ${endTimeColumn}`,
                    [currentAppointment[0].coach_id, dayName, appointmentTimeStr]
                );
                
                if (availabilityRows.length === 0) {
                    console.log('⚠️ New appointment time not within coach availability');
                    return { error: 'New appointment time not within coach availability' };
                }
                
                // Check for conflicts with other appointments
                const duration = updateData.duration_minutes || currentAppointment[0].duration_minutes;
                
                // Calculate end time for SQL time comparison 
                const timePartsStart = checkTime.split(':');
                const hoursStart = parseInt(timePartsStart[0], 10);
                const minutesStart = parseInt(timePartsStart[1], 10);
                const minutesEnd = minutesStart + duration;
                const hoursEnd = hoursStart + Math.floor(minutesEnd / 60);
                const minutesEndFinal = minutesEnd % 60;
                const appointmentEndTimeStr = `${hoursEnd.toString().padStart(2, '0')}:${minutesEndFinal.toString().padStart(2, '0')}:${timePartsStart[2] || '00'}`;
                
                const [conflictRows] = await pool.query(
                    `SELECT id FROM appointments
                     WHERE coach_id = ?
                     AND id != ?
                     AND date = ?
                     AND status != 'cancelled'
                     AND (
                        (time <= ? AND ADDTIME(time, SEC_TO_TIME(IFNULL(duration_minutes, 30) * 60)) > ?)
                        OR
                        (time < ? AND ADDTIME(time, SEC_TO_TIME(IFNULL(duration_minutes, 30) * 60)) >= ?)
                        OR
                        (time >= ? AND time < ?)
                     )`,
                    [
                      currentAppointment[0].coach_id,
                      id,
                      checkDate,
                      appointmentEndTimeStr, 
                      checkTime,
                      appointmentEndTimeStr,
                      checkTime,
                      checkTime,
                      appointmentEndTimeStr
                    ]
                );
                
                if (conflictRows.length > 0) {
                    console.log('⚠️ New appointment time conflicts with existing appointment');
                    return { error: 'New appointment time conflicts with existing appointment' };
                }
            }
            
            // Build update query dynamically
            const allowedFields = ['date', 'time', 'duration_minutes', 'status', 'notes'];
            const updates = [];
            const values = [];
            
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    values.push(updateData[field]);
                }
            }
            
            if (updates.length === 0) {
                console.log('⚠️ No valid fields to update');
                return { error: 'No valid fields to update' };
            }
            
            values.push(id);
            
            // Execute update query
            const [result] = await pool.query(
                `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
            
            if (result.affectedRows === 0) {
                console.log('❌ Failed to update appointment ID:', id);
                return { error: 'Failed to update appointment' };
            }
            
            // Get the updated appointment
            const [updatedRows] = await pool.query(
                `SELECT a.*, 
                        u_coach.full_name as coach_name, 
                        u_coach.profile_image as coach_avatar,
                        u_user.full_name as user_name,
                        u_user.profile_image as user_avatar,
                        CONCAT(a.date, 'T', a.time) as appointment_time
                 FROM appointments a
                 JOIN users u_coach ON a.coach_id = u_coach.id
                 JOIN users u_user ON a.user_id = u_user.id
                 WHERE a.id = ?`,
                [id]
            );
            
            console.log('✅ Successfully updated appointment ID:', id);
            return updatedRows[0];
        } catch (error) {
            console.error('❌ Error updating appointment:', error);
            throw error;
        }
    }
    
    /**
     * Update appointment status only
     * @param {number} id - Appointment ID
     * @param {string} status - New status
     * @returns {Object} Updated appointment
     */
    static async updateStatus(id, status) {
        try {
            console.log('🔍 Updating appointment status:', id, 'to', status);
            
            // Check if appointment exists
            const [currentRows] = await pool.query(
                'SELECT * FROM appointments WHERE id = ?',
                [id]
            );
            
            if (currentRows.length === 0) {
                console.log('⚠️ Appointment not found with ID:', id);
                return null;
            }

            // Update status
            const [updateResult] = await pool.query(
                'UPDATE appointments SET status = ?, updated_at = NOW() WHERE id = ?',
                [status, id]
            );

            if (updateResult.affectedRows === 0) {
                console.log('⚠️ No rows affected when updating appointment status:', id);
                return null;
            }

            // Get updated appointment
            const [updatedRows] = await pool.query(
                'SELECT * FROM appointments WHERE id = ?',
                [id]
            );

            console.log('✅ Appointment status updated successfully:', updatedRows[0]);
            return updatedRows[0];
        } catch (error) {
            console.error('❌ Error updating appointment status:', error);
            throw error;
        }
    }
    
    /**
     * Delete an appointment
     * @param {number} id - The appointment ID
     * @returns {boolean} Success indicator
     */
    static async delete(id) {
        try {
            console.log('🔍 Deleting appointment ID:', id);
            
            const [result] = await pool.query(
                'DELETE FROM appointments WHERE id = ?',
                [id]
            );
            
            if (result.affectedRows === 0) {
                console.log('⚠️ Appointment not found with ID:', id);
                return false;
            }
            
            console.log('✅ Successfully deleted appointment ID:', id);
            return true;
        } catch (error) {
            console.error('❌ Error deleting appointment:', error);
            throw error;
        }
    }
    
    /**
     * Cancel an appointment
     * @param {number} id - The appointment ID
     * @returns {Object} The cancelled appointment
     */
    static async cancel(id) {
        try {
            console.log('🔍 Cancelling appointment ID:', id);
            
            // Check if the appointment exists and is not already cancelled
            const [currentAppointment] = await pool.query(
                'SELECT * FROM appointments WHERE id = ?',
                [id]
            );
            
            if (currentAppointment.length === 0) {
                console.log('⚠️ Appointment not found with ID:', id);
                return { error: 'Appointment not found' };
            }
            
            if (currentAppointment[0].status === 'cancelled') {
                console.log('⚠️ Appointment already cancelled with ID:', id);
                return { error: 'Appointment already cancelled' };
            }
            
            // Update status to cancelled
            const [result] = await pool.query(
                'UPDATE appointments SET status = ? WHERE id = ?',
                ['cancelled', id]
            );
            
            if (result.affectedRows === 0) {
                console.log('❌ Failed to cancel appointment ID:', id);
                return { error: 'Failed to cancel appointment' };
            }
            
            // Get the updated appointment
            const [updatedRows] = await pool.query(
                `SELECT a.*, 
                        u_coach.full_name as coach_name, 
                        u_coach.profile_image as coach_avatar,
                        u_user.full_name as user_name,
                        u_user.profile_image as user_avatar,
                        CONCAT(a.date, 'T', a.time) as appointment_time
                 FROM appointments a
                 JOIN users u_coach ON a.coach_id = u_coach.id
                 JOIN users u_user ON a.user_id = u_user.id
                 WHERE a.id = ?`,
                [id]
            );
            
            console.log('✅ Successfully cancelled appointment ID:', id);
            return updatedRows[0];
        } catch (error) {
            console.error('❌ Error cancelling appointment:', error);
            throw error;
        }
    }
    
    /**
     * Add a rating and feedback for an appointment
     * @param {number} id - The appointment ID
     * @param {Object} ratingData - Rating and feedback data
     * @returns {Object} The rating data with ID
     */
    static async addRating(id, ratingData) {
        try {
            console.log('🔍 Adding rating for appointment ID:', id, 'with data:', ratingData);
            
            // Check if the appointment exists and is completed
            const [appointmentRows] = await pool.query(
                'SELECT * FROM appointments WHERE id = ?',
                [id]
            );
            
            if (appointmentRows.length === 0) {
                console.log('⚠️ Appointment not found with ID:', id);
                return { error: 'Appointment not found' };
            }
            
            const appointment = appointmentRows[0];
            
            if (appointment.status !== 'completed') {
                console.log('⚠️ Cannot rate an appointment that is not completed, ID:', id);
                return { error: 'Can only rate completed appointments' };
            }
            
            // Check if rating already exists for this appointment
            const [existingRatings] = await pool.query(
                'SELECT id FROM feedback WHERE coach_id = ? AND smoker_id = ?',
                [appointment.coach_id, appointment.user_id]
            );
            
            const { rating, content } = ratingData;
            
            let result;
            if (existingRatings.length > 0) {
                // Update existing rating
                [result] = await pool.query(
                    'UPDATE feedback SET rating = ?, content = ?, created_at = NOW() WHERE coach_id = ? AND smoker_id = ?',
                    [rating, content, appointment.coach_id, appointment.user_id]
                );
            } else {
                // Create new rating
                [result] = await pool.query(
                    'INSERT INTO feedback (coach_id, smoker_id, rating, content) VALUES (?, ?, ?, ?)',
                    [appointment.coach_id, appointment.user_id, rating, content]
                );
            }
            
            if (!result || (result.affectedRows === 0 && !existingRatings.length)) {
                console.log('❌ Failed to add rating for appointment ID:', id);
                return { error: 'Failed to add rating' };
            }
            
            // Get the created/updated feedback
            const [feedbackRows] = await pool.query(
                'SELECT * FROM feedback WHERE coach_id = ? AND smoker_id = ?',
                [appointment.coach_id, appointment.user_id]
            );
            
            console.log('✅ Successfully added rating for appointment ID:', id);
            return feedbackRows[0];
        } catch (error) {
            console.error('❌ Error adding rating:', error);
            throw error;
        }
    }
    
    /**
     * Get appointments by coach ID
     * @param {number} coachId - ID of the coach
     * @returns {Promise<Array>} List of appointments
     */
    static async getByCoachId(coachId) {
        try {
            console.log('🔍 Getting appointments for coach ID:', coachId);
            
            // Get appointments for the coach with detailed information
            const [rows] = await pool.query(
                `SELECT 
                    a.id,
                    a.user_id,
                    a.coach_id,
                    a.date,
                    a.time,
                    CONCAT(a.date, 'T', a.time) as appointment_time,
                    a.duration_minutes,
                    a.status,
                    a.created_at,
                    a.updated_at,
                    u.full_name as user_name,
                    u.email as user_email,
                    u.phone as user_phone,
                    u.profile_image as user_avatar
                FROM 
                    appointments a
                LEFT JOIN 
                    users u ON a.user_id = u.id
                WHERE 
                    a.coach_id = ?
                ORDER BY 
                    a.date DESC, a.time DESC`,
                [coachId]
            );
            
            console.log(`✅ Found ${rows.length} appointments for coach ID: ${coachId}`);
            return rows;
        } catch (error) {
            console.error('❌ Error getting appointments by coach ID:', error);
            throw error;
        }
    }
}

export default Appointment;
