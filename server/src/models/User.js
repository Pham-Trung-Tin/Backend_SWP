import { pool } from '../config/database.js';

class User {
    static async findById(id) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('Error finding user by id:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    static async findByUsername(username) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            return rows[0];
        } catch (error) {
            console.error('Error finding user by username:', error);
            throw error;
        }
    }

    static async create(userData) {
        const {
            username,
            email,
            password_hash,
            full_name,
            phone,
            date_of_birth,
            gender,
            role = 'user'
        } = userData;

        try {
            const [result] = await pool.query(
                `INSERT INTO users (
                    username, email, password_hash, full_name, phone, 
                    date_of_birth, gender, role
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    username, email, password_hash, full_name, phone, 
                    date_of_birth, gender, role
                ]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    static async update(id, updateData) {
        try {
            const keys = Object.keys(updateData);
            const values = Object.values(updateData);
            
            if (keys.length === 0) {
                return false;
            }
            
            const setClause = keys.map(key => `${key} = ?`).join(', ');
            const query = `UPDATE users SET ${setClause} WHERE id = ?`;
            
            const [result] = await pool.query(query, [...values, id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    static async verifyEmail(id) {
        try {
            const [result] = await pool.query(
                'UPDATE users SET email_verified = TRUE WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error verifying email:', error);
            throw error;
        }
    }

    static async updatePassword(id, newPasswordHash) {
        try {
            const [result] = await pool.query(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [newPasswordHash, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }

    static async setRefreshToken(id, token) {
        try {
            const [result] = await pool.query(
                'UPDATE users SET refresh_token = ? WHERE id = ?',
                [token, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error setting refresh token:', error);
            throw error;
        }
    }

    static async findByRefreshToken(token) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM users WHERE refresh_token = ?',
                [token]
            );
            return rows[0];
        } catch (error) {
            console.error('Error finding user by refresh token:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await pool.query(
                'DELETE FROM users WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}

export default User;
