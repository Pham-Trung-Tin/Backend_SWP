import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Tạo bảng messages với ràng buộc khóa ngoại đúng
 */
async function createMessagesTableFixed() {
    try {
        console.log('📝 Tạo bảng messages với ràng buộc khóa ngoại đúng...');
        
        // Bước 1: Xóa bảng messages nếu tồn tại
        console.log('1️⃣ Xóa bảng messages nếu tồn tại...');
        try {
            await pool.query('DROP TABLE IF EXISTS messages');
            console.log('✅ Đã xóa bảng messages');
        } catch (error) {
            console.error('❌ Lỗi khi xóa bảng messages:', error);
        }
        
        // Bước 2: Tạo bảng messages mới với ràng buộc khóa ngoại đúng
        console.log('2️⃣ Tạo bảng messages mới...');
        await pool.query(`
            CREATE TABLE messages (
                id INT PRIMARY KEY AUTO_INCREMENT,
                appointment_id INT NOT NULL,
                sender_type ENUM('user', 'coach') NOT NULL,
                text TEXT NOT NULL,
                read_by_coach BOOLEAN DEFAULT FALSE,
                read_by_user BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Đã tạo bảng messages mới với khóa ngoại liên kết đến bảng appointments');
        
        // Bước 3: Thêm các chỉ mục (index)
        console.log('3️⃣ Thêm các chỉ mục...');
        try {
            await pool.query('ALTER TABLE messages ADD INDEX idx_messages_appointment_id (appointment_id)');
            console.log('✅ Đã thêm chỉ mục cho appointment_id');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️ Chỉ mục cho appointment_id đã tồn tại');
            } else {
                throw error;
            }
        }
        
        try {
            await pool.query('ALTER TABLE messages ADD INDEX idx_messages_read_sender (sender_type, read_by_coach, read_by_user)');
            console.log('✅ Đã thêm chỉ mục cho read status');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️ Chỉ mục cho read status đã tồn tại');
            } else {
                throw error;
            }
        }
        
        console.log('🎉 Đã tạo bảng messages thành công với ràng buộc khóa ngoại đúng!');
    } catch (error) {
        console.error('❌ Lỗi khi tạo bảng messages:', error);
        throw error;
    }
}

// Thực thi nếu được gọi trực tiếp
if (process.argv[1] === new URL(import.meta.url).pathname) {
    createMessagesTableFixed()
        .then(() => {
            console.log('✨ Quá trình tạo bảng messages hoàn tất');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Lỗi:', error);
            process.exit(1);
        });
}

export default createMessagesTableFixed;
