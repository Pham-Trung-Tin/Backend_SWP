import { pool } from '../config/database.js';

const updateProgressTable = async () => {
    try {
        // Check if progress_data column exists
        const [columns] = await pool.execute(
            `SELECT COLUMN_NAME 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() 
             AND TABLE_NAME = 'daily_progress' 
             AND COLUMN_NAME = 'progress_data'`
        );
        
        // If progress_data column doesn't exist, add all new columns
        if (columns.length === 0) {
            console.log('Updating daily_progress table structure...');
            
            // Add new columns to the table
            await pool.execute(`
                ALTER TABLE daily_progress
                ADD COLUMN tool_type VARCHAR(50) DEFAULT 'dashboard' AFTER date,
                ADD COLUMN progress_data JSON AFTER notes,
                ADD COLUMN days_clean INT DEFAULT 0 AFTER progress_data,
                ADD COLUMN money_saved DECIMAL(10,2) DEFAULT 0.00 AFTER days_clean,
                ADD COLUMN cigarettes_avoided INT DEFAULT 0 AFTER money_saved,
                ADD COLUMN vapes_avoided INT DEFAULT 0 AFTER cigarettes_avoided,
                ADD COLUMN health_score INT DEFAULT 0 AFTER vapes_avoided,
                ADD COLUMN progress_percentage INT DEFAULT 0 AFTER health_score
            `);
            
            console.log('daily_progress table successfully updated!');
        } else {
            console.log('daily_progress table already has the updated structure.');
        }
        
    } catch (error) {
        console.error('Error updating daily_progress table:', error);
        throw error;
    }
};

export default updateProgressTable;
