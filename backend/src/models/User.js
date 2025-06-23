import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {    static async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
            return rows.length ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
            return rows.length ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    static async findByUsername(username) {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
            return rows.length ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    static async create(userData) {
        try {
            const { username, email, password, full_name } = userData;
            const hashedPassword = await bcrypt.hash(password, 10);
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            const query = `
                INSERT INTO users (
                    username, 
                    email, 
                    password_hash, 
                    full_name, 
                    profileImage,
                    email_verified, 
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, NOW())
            `;
            
            const [result] = await pool.query(query, [
                username,
                email,
                hashedPassword,
                full_name,
                '/uploads/avatars/default.png',
                false
            ]);
            
            return {
                id: result.insertId,
                username,
                email,
                full_name,
                profileImage: '/uploads/avatars/default.png'
            };
        } catch (error) {
            throw error;
        }
    }

    static async update(id, updateData) {
        try {
            // Generate SET clause dynamically
            const setClause = Object.keys(updateData)
                .map(key => {
                    // Handle specific field name conversions
                    let column = key;
                    switch(key) {
                        case 'name':
                            column = 'full_name';
                            break;
                        case 'profileImage':
                            column = 'profile_image';
                            break;
                        case 'dateOfBirth':
                            column = 'date_of_birth';
                            break;
                        default:
                            // Convert camelCase to snake_case for DB column names
                            column = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                    }
                    return `${column} = ?`;
                })
                .join(', ');
            
            // Get values in the same order as the SET clause
            const values = Object.values(updateData);
            
            // Add user ID to values array
            values.push(id);
            
            const query = `UPDATE users SET ${setClause} WHERE id = ?`;
            
            await pool.query(query, values);
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async verifyEmail(userId) {
        try {
            await pool.query('UPDATE users SET email_verified = TRUE WHERE id = ?', [userId]);
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async updatePassword(userId, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);
            return true;
        } catch (error) {
            throw error;
        }
    }
    
    static async comparePassword(providedPassword, storedPassword) {
        return await bcrypt.compare(providedPassword, storedPassword);
    }
    
    static async updateLastLogin(userId) {
        try {
            await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
            return true;
        } catch (error) {
            throw error;
        }
    }
    
    // Additional methods for account management
    static async deleteAccount(userId) {
        try {
            await pool.query('DELETE FROM users WHERE id = ?', [userId]);
            return true;
        } catch (error) {
            throw error;
        }
    }
}

export default User;
