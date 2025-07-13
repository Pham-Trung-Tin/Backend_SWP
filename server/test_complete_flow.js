// Test script để kiểm tra flow hoàn chỉnh
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

async function testCompleteFlow() {
    console.log('🧪 Testing complete API flow...\n');
    
    try {
        // Test data - chỉ gửi dữ liệu cơ bản
        const testData = {
            date: '2025-07-12',
            targetCigarettes: 15,
            actualCigarettes: 10,
            notes: 'Test flow: client → server calculations → database',
            packPrice: 30000
        };
        
        console.log('📤 Client sending basic data:', testData);
        
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
            console.log('\n✅ Server response:', result);
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
            
            console.log('\n🎉 Flow test completed successfully!');
        } else {
            console.error('❌ Server error:', result);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCompleteFlow();
