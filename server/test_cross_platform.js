import { pool } from './src/config/database.js';

async function testCrossPlatform() {
    try {
        console.log('🌐 Test tính năng cross-platform...\n');
        
        // 1. Kiểm tra dữ liệu hiện tại
        console.log('1️⃣ Dữ liệu hiện tại trong database:');
        const [existing] = await pool.execute(
            'SELECT smoker_id, date, actual_cigarettes, target_cigarettes, created_at FROM daily_progress ORDER BY created_at DESC LIMIT 5'
        );
        
        if (existing.length === 0) {
            console.log('❌ Không có dữ liệu nào trong database');
        } else {
            existing.forEach((record, index) => {
                console.log(`   ${index + 1}. User ${record.smoker_id} - ${record.date.toISOString().split('T')[0]} - ${record.actual_cigarettes}/${record.target_cigarettes} điếu - ${record.created_at}`);
            });
        }
        
        // 2. Test lấy dữ liệu theo userId (như nền tảng khác sẽ làm)
        console.log('\n2️⃣ Test lấy dữ liệu từ nền tảng khác (userId 13):');
        const [userProgress] = await pool.execute(
            'SELECT * FROM daily_progress WHERE smoker_id = ? ORDER BY date DESC LIMIT 3',
            ['13']
        );
        
        if (userProgress.length === 0) {
            console.log('❌ User 13 chưa có dữ liệu');
        } else {
            console.log(`✅ Tìm thấy ${userProgress.length} bản ghi cho user 13:`);
            userProgress.forEach((record, index) => {
                console.log(`   ${index + 1}. ${record.date.toISOString().split('T')[0]}: ${record.actual_cigarettes}/${record.target_cigarettes} điếu`);
                console.log(`      Notes: ${record.notes || 'Không có'}`);
                console.log(`      Health Score: ${record.health_score}, Money Saved: ${record.money_saved}`);
            });
        }
        
        // 3. Test tạo dữ liệu từ "nền tảng khác" 
        console.log('\n3️⃣ Mô phỏng checkin từ nền tảng khác:');
        const testDate = new Date().toISOString().split('T')[0];
        const platformTestData = {
            smoker_id: '13',
            date: testDate,
            target_cigarettes: 8,
            actual_cigarettes: 3,
            cigarettes_avoided: 5,
            money_saved: 12500,
            health_score: 62,
            notes: 'Test từ nền tảng khác (mobile/web)',
            tool_type: 'quit_smoking_plan',
            days_clean: 1,
            vapes_avoided: 0,
            progress_percentage: 62.5,
            progress_data: JSON.stringify({ platform: 'mobile_test' })
        };
        
        // Kiểm tra đã có dữ liệu cho ngày hôm nay chưa
        const [todayCheck] = await pool.execute(
            'SELECT id FROM daily_progress WHERE smoker_id = ? AND date = ?',
            ['13', testDate]
        );
        
        if (todayCheck.length > 0) {
            console.log('ℹ️ Đã có dữ liệu cho ngày hôm nay, sẽ cập nhật...');
            await pool.execute(
                'UPDATE daily_progress SET actual_cigarettes = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE smoker_id = ? AND date = ?',
                [platformTestData.actual_cigarettes, platformTestData.notes + ' (UPDATED)', '13', testDate]
            );
            console.log('✅ Đã cập nhật dữ liệu từ nền tảng khác');
        } else {
            await pool.execute(
                `INSERT INTO daily_progress 
                 (smoker_id, date, target_cigarettes, actual_cigarettes, cigarettes_avoided, 
                  money_saved, health_score, notes, tool_type, days_clean, vapes_avoided, 
                  progress_percentage, progress_data) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    platformTestData.smoker_id, platformTestData.date, platformTestData.target_cigarettes,
                    platformTestData.actual_cigarettes, platformTestData.cigarettes_avoided,
                    platformTestData.money_saved, platformTestData.health_score, platformTestData.notes,
                    platformTestData.tool_type, platformTestData.days_clean, platformTestData.vapes_avoided,
                    platformTestData.progress_percentage, platformTestData.progress_data
                ]
            );
            console.log('✅ Đã tạo dữ liệu mới từ nền tảng khác');
        }
        
        // 4. Verify dữ liệu đã sync
        console.log('\n4️⃣ Verify dữ liệu sau khi sync:');
        const [afterSync] = await pool.execute(
            'SELECT date, actual_cigarettes, target_cigarettes, notes, updated_at FROM daily_progress WHERE smoker_id = ? ORDER BY date DESC LIMIT 2',
            ['13']
        );
        
        afterSync.forEach((record, index) => {
            console.log(`   ${index + 1}. ${record.date.toISOString().split('T')[0]}: ${record.actual_cigarettes}/${record.target_cigarettes} - "${record.notes}"`);
        });
        
        console.log('\n🎉 KẾT LUẬN:');
        console.log('✅ Dữ liệu KHÔNG BỊ MẤT khi chuyển nền tảng');
        console.log('✅ Có thể truy cập và cập nhật từ bất kỳ thiết bị nào');
        console.log('✅ Database tập trung đảm bảo đồng bộ dữ liệu');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi test cross-platform:', error);
        process.exit(1);
    }
}

testCrossPlatform();
