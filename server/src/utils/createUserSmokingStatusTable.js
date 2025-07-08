import { pool } from '../config/database.js';

const createUserSmokingStatusTable = async () => {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS user_smoking_status (
                id INT AUTO_INCREMENT PRIMARY KEY,
                UserID INT NOT NULL,
                SmokingStatus ENUM('active', 'quitting', 'quit') NOT NULL DEFAULT 'active',
                CigarettesPerDay INT DEFAULT NULL,
                YearsSmoked INT DEFAULT NULL,
                QuitDate DATE DEFAULT NULL,
                LastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (UserID) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (UserID)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
    } catch (error) {
        throw error;
    }
};

export default createUserSmokingStatusTable;
