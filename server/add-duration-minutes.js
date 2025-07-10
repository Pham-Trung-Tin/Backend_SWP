import { pool } from './src/config/database.js';

/**
 * Adds duration_minutes column to appointments table
 */
async function addDurationMinutesColumn() {
    try {
        console.log('Adding duration_minutes column to appointments table...');
        
        // Check if the duration_minutes column already exists
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'appointments' 
              AND COLUMN_NAME = 'duration_minutes'
        `);
        
        if (columns.length > 0) {
            console.log('✅ duration_minutes column already exists');
        } else {
            // Add the column if it doesn't exist
            await pool.query(`
                ALTER TABLE appointments 
                ADD COLUMN duration_minutes INT NOT NULL DEFAULT 30 
                COMMENT 'Duration in minutes' AFTER time
            `);
            console.log('✅ duration_minutes column added successfully');
        }
        
        // Check the appointments table structure
        const [allColumns] = await pool.query('SHOW COLUMNS FROM appointments');
        console.log('Current appointments table structure:');
        allColumns.forEach(col => {
            console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
        });
        
        console.log('Column addition completed successfully! 🎉');
    } catch (error) {
        console.error('❌ Error adding duration_minutes column:', error);
    } finally {
        try {
            // Close the database connection
            await pool.end();
            console.log('Database connection closed');
        } catch (error) {
            console.error('Error closing database connection:', error);
        }
    }
}

// Execute the function
addDurationMinutesColumn();
