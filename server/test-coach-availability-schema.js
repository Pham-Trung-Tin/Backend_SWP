import { pool } from './src/config/database.js';

/**
 * Debug script to verify coach_availability schema and data
 */
const main = async () => {
    try {
        // Check table schema
        console.log('🔍 Verifying coach_availability table schema...');
        const [tableSchema] = await pool.query(`
            DESCRIBE coach_availability
        `);
        
        console.log('Table schema:', tableSchema);
        
        // Get sample data from coach with ID 13
        console.log('\n🔍 Checking availability data for coach ID 13:');
        const [availabilityData] = await pool.query(
            'SELECT * FROM coach_availability WHERE coach_id = ?',
            [13]
        );
        
        console.log('Availability data:', availabilityData);
        
        // Insert a test appointment
        console.log('\n🔍 Inserting a test appointment...');
        
        // Convert ISO date to MySQL format
        const appointmentDate = new Date('2025-07-08T10:00:00Z');
        const formattedDate = appointmentDate.toISOString().slice(0, 19).replace('T', ' ');
        
        const [result] = await pool.query(
            `INSERT INTO appointment (coach_id, user_id, appointment_time, duration_minutes, status)
             VALUES (?, ?, ?, ?, 'pending')`,
            [13, 18, formattedDate, 60]
        );
        
        console.log('Appointment inserted with ID:', result.insertId);
        
        // Get the inserted appointment
        const [appointment] = await pool.query(
            'SELECT * FROM appointment WHERE id = ?',
            [result.insertId]
        );
        
        console.log('Inserted appointment:', appointment[0]);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close connection
        pool.end();
    }
};

main();
