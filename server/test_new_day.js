// Test tạo checkin cho ngày mới
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

async function testNewDayCheckin() {
    console.log('🧪 Testing new day checkin creation...\n');
    
    try {
        // Test data cho ngày mới
        const testData = {
            date: '2025-07-13',
            targetCigarettes: 10,
            actualCigarettes: 6,
            notes: 'New day test - client basic data only',
            packPrice: 25000
        };
        
        console.log('📤 Client sending basic data for new day:', testData);
        
        // Gửi request đến server
        const response = await fetch(`${API_BASE}/api/progress/13`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('\n✅ Server response for new checkin:', result);
            console.log('\n📊 Server calculations:');
            console.log(`- Cigarettes avoided: ${result.data.cigarettes_avoided}`);
            console.log(`- Money saved: ${result.data.money_saved} VND`);
            console.log(`- Health score: ${result.data.health_score}`);
            console.log(`- Streak days: ${result.data.streak_days}`);
            console.log(`- Progress percentage: ${result.data.progress_percentage}%`);
            
            if (result.data.summary) {
                console.log('\n🏆 Milestones:', result.data.summary.milestones);
                console.log('📈 Totals:', result.data.summary.totals);
            }
            
            if (result.data.progress_data) {
                const progressData = typeof result.data.progress_data === 'string' 
                    ? JSON.parse(result.data.progress_data) 
                    : result.data.progress_data;
                console.log('\n🎯 Progress Data:', progressData);
            }
            
            console.log('\n🎉 New day checkin test completed successfully!');
        } else {
            console.error('❌ Server error:', result);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testNewDayCheckin();
