const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testPaymentFlow() {
    console.log('🧪 Testing complete payment flow...');
    
    try {
        // Step 1: Login
        console.log('\n1. Đăng nhập...');
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'testuser@example.com',
            password: 'password123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login thành công');
        console.log('🔑 Token:', token.substring(0, 30) + '...');
        
        // Step 2: Create payment
        console.log('\n2. Tạo payment...');
        const paymentResponse = await axios.post(`${API_BASE}/api/payments/zalopay/create`, {
            packageId: 1,
            amount: 99000
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Payment created successfully');
        console.log('📝 Transaction ID:', paymentResponse.data.data.transaction_id);
        console.log('🔗 Order URL:', paymentResponse.data.data.order_url);
        console.log('💰 Amount:', paymentResponse.data.data.amount);
        
        // Step 3: Show instructions
        console.log('\n📋 HƯỚNG DẪN TEST:');
        console.log('1. Copy Order URL ở trên');
        console.log('2. Mở trong browser');
        console.log('3. Thực hiện thanh toán test');
        console.log('4. Xem callback có được gọi không');
        
        // Return transaction info for further testing
        return {
            transactionId: paymentResponse.data.data.transaction_id,
            orderUrl: paymentResponse.data.data.order_url,
            token: token
        };
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data?.message || error.message);
        console.error('Status:', error.response?.status);
        return null;
    }
}

// Run test
testPaymentFlow().then(result => {
    if (result) {
        console.log('\n✅ Test completed successfully!');
        console.log('\n🔗 Order URL to test:');
        console.log(result.orderUrl);
    }
});
