import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkAppointment() {
    // Create a connection using connection parameters from .env
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('Connected to database successfully!');
        
        // Check appointment table structure
        const [tables] = await connection.query('SHOW TABLES');
        console.log('\nTables in database:');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`- ${tableName}`);
        });
        
        // Find appointment-like tables
        const appointmentTables = tables
            .map(table => Object.values(table)[0])
            .filter(name => name.toLowerCase().includes('appoint'));
        
        if (appointmentTables.length > 0) {
            console.log(`\nFound ${appointmentTables.length} appointment-related tables:`, appointmentTables);
            
            // Check each appointment table
            for (const tableName of appointmentTables) {
                console.log(`\nChecking table: ${tableName}`);
                
                // Get table structure
                const [columns] = await connection.query(`DESCRIBE ${tableName}`);
                console.log(`Columns in ${tableName}:`, columns.map(col => col.Field).join(', '));
                
                // Check if appointment ID 22 exists
                const [rows] = await connection.query(`SELECT * FROM ${tableName} WHERE id = 22`);
                
                if (rows.length > 0) {
                    console.log(`✅ Found appointment with ID 22 in table ${tableName}:`);
                    console.log(JSON.stringify(rows[0], null, 2));
                } else {
                    console.log(`❌ Appointment with ID 22 not found in table ${tableName}`);
                }
            }
        } else {
            console.log('\n❌ No appointment-related tables found');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        connection.end();
    }
}

checkAppointment();
