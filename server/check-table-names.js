import { pool } from './src/config/database.js';

(async () => {
    try {
        console.log('📋 Checking table names...');
        
        // Show all tables
        const [rows] = await pool.query('SHOW TABLES');
        console.log('All tables:', rows);
        
        // Check if appointments table exists
        const [appointmentsTable] = await pool.query('SHOW TABLES LIKE "appointments"');
        console.log('Appointments table (plural):', appointmentsTable);
        
        // Check if appointment table exists
        const [appointmentTable] = await pool.query('SHOW TABLES LIKE "appointment"');
        console.log('Appointment table (singular):', appointmentTable);
        
        // Check table structure
        if (appointmentsTable.length > 0) {
            console.log('\n📊 Structure of appointments table:');
            const [structure] = await pool.query('DESCRIBE appointments');
            console.log(structure);
        }
        
        if (appointmentTable.length > 0) {
            console.log('\n📊 Structure of appointment table:');
            const [structure] = await pool.query('DESCRIBE appointment');
            console.log(structure);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
})();
