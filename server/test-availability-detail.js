import { pool } from './src/config/database.js';

/**
 * Debug script specifically for the availability check
 */
const main = async () => {
    try {
        // Lấy thông tin về cấu trúc bảng coach_availability
        console.log('🔍 Kiểm tra cấu trúc bảng coach_availability...');
        const [tableInfo] = await pool.query(`
            SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'coach_availability'
        `);
        
        console.log('Cấu trúc bảng:', tableInfo);
        
        // Lấy dữ liệu mẫu từ bảng
        console.log('\n🔍 Dữ liệu trong bảng coach_availability cho coach ID 13:');
        const [availabilityData] = await pool.query(
            'SELECT * FROM coach_availability WHERE coach_id = ?',
            [13]
        );
        
        console.log('Dữ liệu lịch làm việc:', availabilityData);
        
        // Test với ngày cụ thể
        const testDate = new Date('2025-07-08T09:00:00Z');
        console.log('\n🔍 Kiểm tra với ngày:', testDate);
        
        // Tính toán ngày trong tuần theo Javascript (0=Sunday, 1=Monday, ..., 6=Saturday)
        const jsDay = testDate.getDay();
        console.log('Ngày trong tuần (JS format - 0=Sunday):', jsDay);
        
        // Chuyển đổi sang định dạng 1=Monday, ..., 7=Sunday
        const dbDay = jsDay === 0 ? 7 : jsDay;
        console.log('Ngày trong tuần (DB format - 1=Monday):', dbDay);
        
        // Lấy chuỗi thời gian
        const timeStr = testDate.toTimeString().slice(0, 8);
        console.log('Chuỗi thời gian:', timeStr);
        
        // Truy vấn trực tiếp để kiểm tra tính khả dụng
        console.log('\n🔍 Thực hiện truy vấn kiểm tra tính khả dụng:');
        const [availabilityCheck] = await pool.query(
            `SELECT id FROM coach_availability 
             WHERE coach_id = ? 
             AND day_of_week = ?
             AND ? BETWEEN start_time AND end_time`,
            [13, dbDay, timeStr]
        );
        
        if (availabilityCheck.length === 0) {
            console.log('⚠️ Không tìm thấy lịch làm việc phù hợp');
        } else {
            console.log('✅ Tìm thấy lịch làm việc phù hợp:', availabilityCheck);
        }
        
        // Kiểm tra chính xác các trường dữ liệu
        console.log('\n🔍 Kiểm tra chi tiết các trường trong truy vấn:');
        const [detailedCheck] = await pool.query(
            `SELECT * FROM coach_availability 
             WHERE coach_id = ?`,
            [13]
        );
        
        for (const avail of detailedCheck) {
            console.log(`Kiểm tra cho lịch ID ${avail.id}:`);
            console.log(`- coach_id: ${avail.coach_id === 13 ? '✅ Khớp' : '❌ Không khớp'}`);
            console.log(`- day_of_week: ${avail.day_of_week} ${avail.day_of_week === dbDay ? '✅ Khớp' : '❌ Không khớp'}`);
            console.log(`- Thời gian: ${timeStr} nằm giữa ${avail.start_time} và ${avail.end_time}: ${
                timeStr >= avail.start_time && timeStr <= avail.end_time ? '✅ Khớp' : '❌ Không khớp'
            }`);
        }
        
    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        // Đóng kết nối
        pool.end();
    }
};

main();
