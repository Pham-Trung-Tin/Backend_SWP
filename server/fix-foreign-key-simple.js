import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixMessagesForeignKey() {
    console.log('🔧 Bắt đầu sửa ràng buộc khóa ngoại cho bảng messages...');
    
    // Tạo connection
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL || process.env.DB_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    try {
        console.log('✅ Kết nối database thành công');
        
        // Kiểm tra constraint hiện tại
        console.log('1️⃣ Kiểm tra constraint hiện tại...');
        const [constraints] = await connection.execute(`
            SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'messages' AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        console.log('Constraints hiện tại:', constraints);
        
        if (constraints.length > 0) {
            for (const constraint of constraints) {
                console.log(`2️⃣ Xóa constraint cũ: ${constraint.CONSTRAINT_NAME}`);
                await connection.execute(`
                    ALTER TABLE messages
                    DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}
                `);
                console.log(`✅ Đã xóa constraint: ${constraint.CONSTRAINT_NAME}`);
            }
        }
        
        // Kiểm tra xem bảng appointments có tồn tại không
        console.log('3️⃣ Kiểm tra bảng appointments...');
        const [tables] = await connection.execute(`
            SHOW TABLES LIKE 'appointments'
        `);
        
        if (tables.length === 0) {
            console.log('❌ Bảng appointments không tồn tại!');
            return;
        }
        
        console.log('✅ Bảng appointments tồn tại');
        
        // Thêm constraint mới
        console.log('4️⃣ Thêm constraint mới...');
        await connection.execute(`
            ALTER TABLE messages
            ADD CONSTRAINT messages_appointment_fk
            FOREIGN KEY (appointment_id)
            REFERENCES appointments(id)
            ON DELETE CASCADE
        `);
        
        console.log('✅ Đã thêm constraint mới liên kết đến bảng appointments');
        console.log('🎉 Sửa lỗi foreign key thành công!');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error('Thông tin chi tiết:', error);
    } finally {
        await connection.end();
    }
}

// Chạy script
fixMessagesForeignKey()
    .then(() => {
        console.log('✨ Hoàn tất!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Lỗi tổng thể:', error);
        process.exit(1);
    });
