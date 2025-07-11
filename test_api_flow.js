// Test script để kiểm tra flow API
const API_BASE = 'http://localhost:5000';

// Test data
const testCheckinData = {
    date: new Date().toISOString().split('T')[0],
    targetCigarettes: 10,
    actualCigarettes: 5,
    cigarettesAvoided: 5,
    moneySaved: 25000,
    healthScore: 50,
    notes: 'Test từ script'
};

async function testApiFlow() {
    try {
        console.log('🧪 Bắt đầu test API flow...\n');

        // 1. Test endpoint create checkin trực tiếp (không auth)
        console.log('1️⃣ Test create checkin endpoint...');
        try {
            const response = await fetch(`${API_BASE}/api/progress/checkin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testCheckinData)
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.status === 401) {
                console.log('❌ Cần authentication - đây là lý do không lưu được!');
            } else if (response.status === 200 || response.status === 201) {
                console.log('✅ API hoạt động tốt!');
            }
            
        } catch (error) {
            console.log('❌ Lỗi kết nối:', error.message);
        }

        // 2. Test pattern :userId với userId thực tế
        console.log('\n2️⃣ Test pattern :userId với userId 13...');
        try {
            const response = await fetch(`${API_BASE}/api/progress/13`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testCheckinData)
            });
            
            console.log('UserID pattern status:', response.status);
            const data = await response.json();
            console.log('UserID pattern response:', data);
            
            if (response.status === 200 || response.status === 201) {
                console.log('✅ Flow mới hoạt động! Dữ liệu đã được lưu vào database!');
            } else if (response.status === 404) {
                console.log('❌ User ID 13 không tồn tại trong database');
            }
            
        } catch (error) {
            console.log('❌ Pattern :userId lỗi:', error.message);
        }

        // 3. Test server có chạy không
        console.log('\n3️⃣ Test server status...');
        try {
            const response = await fetch(`${API_BASE}/`);
            console.log('Server status:', response.status);
        } catch (error) {
            console.log('❌ Server không chạy hoặc không kết nối được');
        }

    } catch (error) {
        console.error('💥 Test failed:', error.message);
    }
}

// Chạy test
testApiFlow();
