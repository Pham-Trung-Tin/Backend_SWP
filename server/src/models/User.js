import { pool } from '../config/database.js';

class User {
    static async findById(id) {
        try {
            console.log('🔍 Finding user by id:', id);
            
            const [rows] = await pool.query(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            
            if (rows.length === 0) {
                console.log('⚠️ No user found with id:', id);
                return null;
            }
            
            console.log('✅ User found:', rows[0].id, rows[0].full_name || rows[0].username);
            return rows[0];
        } catch (error) {
            console.error('❌ Error finding user by id:', error);
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
            age,          // Thêm trường age 
            quit_reason,  // Thêm trường quit_reason
            role = 'user',
            membership = 'free'  // Thêm trường membership với giá trị mặc định là 'free'
        } = userData;

        try {
            console.log('📝 Creating new user:', { ...userData, password_hash: '***hidden***' });
            
            const [result] = await pool.query(
                `INSERT INTO users (
                    username, email, password_hash, full_name, phone, 
                    date_of_birth, gender, role, age, quit_reason, membership
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    username, email, password_hash, full_name, phone, 
                    date_of_birth, gender, role, age || null, quit_reason || null, membership
                ]
            );
            
            console.log('✅ User created successfully with ID:', result.insertId);
            return result.insertId;
        } catch (error) {
            console.error('❌ Error creating user:', error);
            throw error;
        }
    }

    static async update(id, updateData) {
        try {
            console.log('📊 User.update called with id:', id);
            console.log('📦 Update data:', JSON.stringify(updateData, null, 2));
            
            // Kiểm tra dữ liệu đầu vào
            const keys = Object.keys(updateData);
            const values = Object.values(updateData);
            
            if (keys.length === 0) {
                console.log('⚠️ No data to update');
                return false;
            }
            
            // Xử lý đặc biệt cho trường age - đảm bảo nó luôn là số nguyên hoặc NULL
            if ('age' in updateData) {
                if (updateData.age === '' || updateData.age === null || updateData.age === undefined) {
                    updateData.age = null;
                } else {
                    updateData.age = parseInt(updateData.age, 10);
                    if (isNaN(updateData.age)) {
                        updateData.age = null;
                    }
                }
            }
            
            // Xử lý đặc biệt cho trường quit_reason - đảm bảo nó xử lý được mọi giá trị
            if ('quit_reason' in updateData) {
                // Kiểm tra chi tiết hơn về type và giá trị
                console.log('🔍 Original quit_reason:', updateData.quit_reason, 'Type:', typeof updateData.quit_reason);
                
                // Nếu giá trị là undefined, null hoặc chuỗi rỗng, đặt là null
                if (updateData.quit_reason === '' || updateData.quit_reason === undefined || updateData.quit_reason === null) {
                    updateData.quit_reason = null;
                    console.log('✏️ Reset quit_reason to null');
                } else {
                    // Nếu là string, giữ nguyên giá trị
                    updateData.quit_reason = String(updateData.quit_reason).trim();
                    console.log('✏️ Keep quit_reason as trimmed string:', updateData.quit_reason);
                }
            }
            
            // Lấy lại keys và values sau khi xử lý
            const processedKeys = Object.keys(updateData);
            const processedValues = Object.values(updateData);
            
            // Tạo mệnh đề SET cho SQL query
            const setClause = processedKeys.map(key => `${key} = ?`).join(', ');
            const query = `UPDATE users SET ${setClause} WHERE id = ?`;
            
            console.log('🔍 SQL query:', query);
            console.log('🔢 SQL params:', [...processedValues, id]);
            
            // Thực hiện truy vấn
            const [result] = await pool.query(query, [...processedValues, id]);
            
            console.log('✅ Update result:', JSON.stringify(result, null, 2));
            
            // Kiểm tra và trả về kết quả
            if (result.affectedRows > 0) {
                console.log('✅ Updated successfully:', result.affectedRows, 'rows affected');
                return true;
            } else {
                console.log('⚠️ No rows were updated');
                return false;
            }
        } catch (error) {
            console.error('❌ Error updating user:', error);
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
