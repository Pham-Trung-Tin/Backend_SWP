import { pool } from '../config/database.js';

export const createQuitPlanTable = async () => {
    try {
        // Create quit_smoking_plan table if it doesn't exist
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS quit_smoking_plan (
                id INT AUTO_INCREMENT PRIMARY KEY,
                smoker_id INT NOT NULL,
                plan_name VARCHAR(100) NOT NULL,
                start_date DATE NOT NULL,
                initial_cigarettes INT NOT NULL,
                strategy ENUM('gradual', 'aggressive', 'cold_turkey') DEFAULT 'gradual',
                goal VARCHAR(255),
                weeks JSON,
                total_weeks INT NOT NULL,
                status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_smoker_id (smoker_id),
                FOREIGN KEY (smoker_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
    } catch (error) {
    }
};

export default createQuitPlanTable;
