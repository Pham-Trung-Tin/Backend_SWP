import { pool } from './src/config/database.js';

async function checkAppointment(id) {
    try {
        console.log(`Checking if appointment with ID ${id} exists...`);
        
        const [rows] = await pool.query('SELECT * FROM appointment WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            console.log(`❌ Appointment with ID ${id} does NOT exist in the database.`);
            return;
        }
        
        console.log(`✅ Appointment found with ID ${id}:`);
        console.log(JSON.stringify(rows[0], null, 2));
        
        // Check if the appointment is related to a user and coach
        console.log('\nChecking user and coach access...');
        const userId = rows[0].user_id;
        const coachId = rows[0].coach_id;
        
        console.log(`User ID: ${userId}, Coach ID: ${coachId}`);
        
        // Optional: Get user and coach details
        if (userId) {
            const [userRows] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [userId]);
            if (userRows.length > 0) {
                console.log('User details:', userRows[0]);
            }
        }
        
        if (coachId) {
            const [coachRows] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [coachId]);
            if (coachRows.length > 0) {
                console.log('Coach details:', coachRows[0]);
            }
        }
        
    } catch (error) {
        console.error('Error checking appointment:', error);
    } finally {
        pool.end();
    }
}

// Check appointment with ID 22
checkAppointment(22);
