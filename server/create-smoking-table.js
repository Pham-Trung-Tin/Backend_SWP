// Manually create user_smoking_status table
import { pool } from './src/config/database.js';

const createTable = async () => {
    try {
        console.log('🔧 Creating user_smoking_status table...');

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS user_smoking_status (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                is_smoker BOOLEAN NOT NULL DEFAULT TRUE,
                cigarettes_per_day INT DEFAULT NULL,
                years_smoking INT DEFAULT NULL,
                quit_attempts INT DEFAULT 0,
                motivation_level INT DEFAULT NULL CHECK (motivation_level >= 1 AND motivation_level <= 10),
                quit_reasons TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✅ user_smoking_status table created successfully');

        // Check if table exists and show structure
        const [tables] = await pool.execute("SHOW TABLES LIKE 'user_smoking_status'");
        console.log('📋 Table exists:', tables.length > 0);

        if (tables.length > 0) {
            const [columns] = await pool.execute("DESCRIBE user_smoking_status");
            console.log('📋 Table structure:');
            columns.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
            });
        }

    } catch (error) {
        console.error('❌ Error creating table:', error.message);
    } finally {
        await pool.end();
    }
};

createTable();
