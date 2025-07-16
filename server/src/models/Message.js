import { pool } from '../config/database.js';

class Message {
    /**
     * Get messages for a specific appointment
     * @param {number} appointmentId - ID of the appointment
     * @returns {Promise<Array>} - List of messages
     */
    static async getAppointmentMessages(appointmentId) {
        try {
            console.log('🔍 Getting messages for appointment ID:', appointmentId);
            
            // First verify the appointment exists
            const [appointmentRows] = await pool.query(
                'SELECT id FROM appointments WHERE id = ?',
                [appointmentId]
            );
            
            if (appointmentRows.length === 0) {
                console.log('⚠️ Appointment not found with ID:', appointmentId);
                return null;
            }
            
            // Get all messages for this appointment
            const [rows] = await pool.query(
                `SELECT 
                    m.id, 
                    m.text, 
                    m.sender_type AS sender,
                    m.read_by_coach,
                    m.read_by_user,
                    m.created_at AS timestamp,
                    u.id AS user_id,
                    u.full_name AS user_name,
                    c.id AS coach_id,
                    c.full_name AS coach_name
                FROM 
                    messages m
                LEFT JOIN 
                    appointments a ON m.appointment_id = a.id
                LEFT JOIN 
                    users u ON a.user_id = u.id
                LEFT JOIN 
                    users c ON a.coach_id = c.id
                WHERE 
                    m.appointment_id = ?
                ORDER BY 
                    m.created_at ASC`,
                [appointmentId]
            );
            
            console.log(`✅ Found ${rows.length} messages for appointment ID: ${appointmentId}`);
            return rows;
        } catch (error) {
            console.error('❌ Error getting appointment messages:', error);
            throw error;
        }
    }
    
    /**
     * Create a new message
     * @param {number} appointmentId - ID of the appointment
     * @param {Object} messageData - Message data
     * @returns {Promise<Object>} - Created message
     */
    static async createMessage(appointmentId, messageData) {
        try {
            console.log('🔍 Creating message for appointment ID:', appointmentId, messageData);
            
            const { text, sender, userId, userName } = messageData;
            
            if (!text || !sender) {
                throw new Error('Message text and sender are required');
            }
            
            // Verify sender is valid
            if (sender !== 'user' && sender !== 'coach') {
                throw new Error('Sender must be either "user" or "coach"');
            }
            
            // First verify the appointment exists and get user/coach info
            const [appointmentRows] = await pool.query(
                `SELECT 
                    a.id, 
                    a.user_id, 
                    a.coach_id,
                    u.full_name AS user_name,
                    c.full_name AS coach_name
                FROM 
                    appointments a
                LEFT JOIN 
                    users u ON a.user_id = u.id
                LEFT JOIN 
                    users c ON a.coach_id = c.id
                WHERE 
                    a.id = ?`,
                [appointmentId]
            );
            
            if (appointmentRows.length === 0) {
                console.log('⚠️ Appointment not found with ID:', appointmentId);
                return null;
            }
            
            // Set read status based on sender
            const readByCoach = sender === 'user' ? false : true;
            const readByUser = sender === 'coach' ? false : true;
            
            // Insert the message
            const [result] = await pool.query(
                `INSERT INTO messages (
                    appointment_id, 
                    text, 
                    sender_type, 
                    read_by_coach, 
                    read_by_user, 
                    created_at
                ) VALUES (?, ?, ?, ?, ?, NOW())`,
                [appointmentId, text, sender, readByCoach, readByUser]
            );
            
            if (result.affectedRows === 0) {
                throw new Error('Failed to create message');
            }
            
            // Get the created message with sender name
            const [messageRows] = await pool.query(
                `SELECT 
                    m.id, 
                    m.text, 
                    m.sender_type AS sender,
                    m.read_by_coach,
                    m.read_by_user,
                    m.created_at AS timestamp,
                    u.full_name AS user_name,
                    c.full_name AS coach_name
                FROM 
                    messages m
                LEFT JOIN 
                    appointments a ON m.appointment_id = a.id
                LEFT JOIN 
                    users u ON a.user_id = u.id
                LEFT JOIN 
                    users c ON a.coach_id = c.id
                WHERE 
                    m.id = ?`,
                [result.insertId]
            );
            
            console.log('✅ Message created with ID:', result.insertId);
            return messageRows[0];
        } catch (error) {
            console.error('❌ Error creating message:', error);
            throw error;
        }
    }
    
    /**
     * Mark messages as read
     * @param {number} appointmentId - ID of the appointment
     * @param {string} reader - Who is marking messages as read ('user' or 'coach')
     * @returns {Promise<Object>} - Result of the operation
     */
    static async markAsRead(appointmentId, reader) {
        try {
            console.log(`🔍 Marking messages as read for appointment ID: ${appointmentId} by ${reader}`);
            
            // Determine which field to update based on reader
            const updateField = reader === 'coach' ? 'read_by_coach = TRUE' : 'read_by_user = TRUE';
            const senderToMark = reader === 'coach' ? 'user' : 'coach';
            
            // Update only messages from the other party
            const [result] = await pool.query(
                `UPDATE 
                    messages 
                SET 
                    ${updateField} 
                WHERE 
                    appointment_id = ? AND 
                    sender_type = ?`,
                [appointmentId, senderToMark]
            );
            
            console.log(`✅ Marked ${result.affectedRows} messages as read`);
            return { 
                success: true, 
                count: result.affectedRows 
            };
        } catch (error) {
            console.error('❌ Error marking messages as read:', error);
            throw error;
        }
    }
    
    /**
     * Get unread message counts for a user or coach
     * @param {number} userId - ID of the user or coach
     * @param {string} userType - Type of user ('user' or 'coach')
     * @returns {Promise<Object>} - Unread message counts by appointment
     */
    static async getUnreadCounts(userId, userType) {
        try {
            console.log(`🔍 Getting unread counts for ${userType} ID: ${userId}`);
            
            // Determine which field and condition to use based on userType
            const readField = userType === 'coach' ? 'read_by_coach' : 'read_by_user';
            const senderToCheck = userType === 'coach' ? 'user' : 'coach';
            const idField = userType === 'coach' ? 'coach_id' : 'user_id';
            
            // Get unread counts per appointment
            const [rows] = await pool.query(
                `SELECT 
                    m.appointment_id,
                    COUNT(*) as unread_count
                FROM 
                    messages m
                JOIN
                    appointments a ON m.appointment_id = a.id
                WHERE 
                    a.${idField} = ? AND 
                    m.sender_type = ? AND 
                    m.${readField} = FALSE
                GROUP BY 
                    m.appointment_id`,
                [userId, senderToCheck]
            );
            
            // Convert the rows to an object with appointment_id as key
            const counts = {};
            rows.forEach(row => {
                counts[row.appointment_id] = row.unread_count;
            });
            
            console.log(`✅ Found unread counts for ${rows.length} appointments`);
            return counts;
        } catch (error) {
            console.error('❌ Error getting unread counts:', error);
            throw error;
        }
    }
    
    /**
     * Get the latest message for an appointment
     * @param {number} appointmentId - ID of the appointment
     * @returns {Promise<Object>} - The latest message
     */
    static async getLatestMessage(appointmentId) {
        try {
            console.log(`🔍 Getting latest message for appointment ID: ${appointmentId}`);
            
            // Get the latest message for this appointment
            const [rows] = await pool.query(
                `SELECT 
                    m.*,
                    u_sender.full_name AS sender_name,
                    u_sender.profile_image AS sender_avatar,
                    a.user_id,
                    a.coach_id,
                    u_user.full_name AS user_name,
                    u_coach.full_name AS coach_name
                FROM 
                    messages m
                JOIN
                    appointments a ON m.appointment_id = a.id
                LEFT JOIN
                    users u_sender ON m.sender_id = u_sender.id
                LEFT JOIN
                    users u_user ON a.user_id = u_user.id
                LEFT JOIN
                    users u_coach ON a.coach_id = u_coach.id
                WHERE 
                    m.appointment_id = ?
                ORDER BY 
                    m.created_at DESC
                LIMIT 1`,
                [appointmentId]
            );
            
            if (rows.length === 0) {
                console.log(`⚠️ No messages found for appointment ID: ${appointmentId}`);
                return null;
            }
            
            console.log(`✅ Found latest message for appointment ID: ${appointmentId}`);
            return rows[0];
        } catch (error) {
            console.error('❌ Error getting latest message:', error);
            throw error;
        }
    }
}

export default Message;
