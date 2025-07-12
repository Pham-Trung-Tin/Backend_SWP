// Test checkin cho ngày mai (13/7/2025)
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

async function testTomorrowCheckin() {
    console.log('🧪 Testing tomorrow checkin (13/7/2025)...\n');
    
    try {
        // Giả sử user checkin vào ngày mai với dữ liệu này
        const tomorrowData = {
            date: '2025-07-13',
            targetCigarettes: 8,        // Mục tiêu giảm xuống 8 điếu
            actualCigarettes: 5,        // Thực tế hút 5 điếu
            notes: 'Ngày thứ 4 - cảm thấy dễ thở hơn',
            packPrice: 25000
        };
        
        console.log('📤 Client data for tomorrow:', tomorrowData);
        
        const response = await fetch(`${API_BASE}/api/progress/13`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tomorrowData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('\n✅ Server response:', result);
            
            const data = result.data;
            console.log('\n📊 Server calculations for tomorrow:');
            console.log(`- Target: ${data.target_cigarettes} điếu`);
            console.log(`- Actual: ${data.actual_cigarettes} điếu`);
            console.log(`- Avoided: ${data.cigarettes_avoided} điếu`);
            console.log(`- Money saved: ${data.money_saved} VND`);
            console.log(`- Health score: ${data.health_score}%`);
            console.log(`- Progress: ${data.progress_percentage}%`);
            console.log(`- Streak: ${data.streak_days} ngày`);
            
            // Parse progress_data để xem totals
            const progressData = typeof data.progress_data === 'string' 
                ? JSON.parse(data.progress_data) 
                : data.progress_data;
                
            if (progressData?.totals) {
                console.log('\n📈 Cumulative totals:');
                console.log(`- Total days: ${progressData.totals.totalDays}`);
                console.log(`- Total avoided: ${progressData.totals.totalAvoided} điếu`);
                console.log(`- Total saved: ${progressData.totals.totalSaved} VND`);
                console.log(`- Best streak: ${progressData.totals.bestStreak} ngày`);
            }
            
            if (progressData?.milestones && progressData.milestones.length > 0) {
                console.log('\n🏆 New milestones:', progressData.milestones);
            }
            
        } else {
            console.error('❌ Error:', result);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testTomorrowCheckin();
