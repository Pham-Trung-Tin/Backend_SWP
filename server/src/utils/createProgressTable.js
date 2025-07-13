import { pool } from '../config/database.js';

const createProgressTable = async () => {
    try {

        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS daily_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                smoker_id INT NOT NULL,
                date DATE NOT NULL,
                target_cigarettes INT NOT NULL DEFAULT 0,
                actual_cigarettes INT NOT NULL DEFAULT 0,
                notes TEXT,
                health_score INT DEFAULT 0,
                money_saved DECIMAL(10,2) DEFAULT 0,
                cigarettes_avoided INT DEFAULT 0,
                streak_days INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_smoker_date (smoker_id, date),
                FOREIGN KEY (smoker_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_smoker_date (smoker_id, date),
                INDEX idx_date (date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await pool.execute(createTableSQL);

    } catch (error) {
        throw error;
    }
};

export default createProgressTable;
