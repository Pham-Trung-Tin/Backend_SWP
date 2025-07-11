// Test end-to-end ZaloPay integration
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testFullZaloPayFlow() {
    console.log('=== Testing Full ZaloPay Integration ===\n');
    
    // You need to get a real JWT token by logging into the app first
    const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token
    
    if (token === 'YOUR_JWT_TOKEN_HERE') {
        console.log('⚠️  CÁCH LẤY JWT TOKEN:');
        console.log('1. Mở browser, đăng nhập vào ứng dụng');
        console.log('2. Mở Developer Tools (F12)');
        console.log('3. Vào tab Application/Storage -> Local Storage');
        console.log('4. Tìm key "nosmoke_token" và copy value');
        console.log('5. Thay thế YOUR_JWT_TOKEN_HERE trong file này');
        console.log('6. Chạy lại: node test-full-zalopay.js\n');
        return;
    }
    
    try {
        // Step 1: Create a ZaloPay payment
        console.log('1. Creating ZaloPay payment...');
        const createResponse = await axios.post(`${BASE_URL}/api/payments/zalopay/create`, {
            packageId: 2, // Premium package
            amount: 99000,
            redirectUrl: 'http://localhost:5173/payment/success'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Payment created:', createResponse.data);
        
        if (createResponse.data.success) {
            const transactionId = createResponse.data.data.app_trans_id;
            const orderUrl = createResponse.data.order_url;
            
            console.log(`🔗 Payment URL: ${orderUrl}`);
            console.log(`📋 Transaction ID: ${transactionId}`);
            console.log('');
            
            // Step 2: Simulate user completing payment (manual step)
            console.log('2. Manual step - User needs to:');
            console.log(`   - Open: ${orderUrl}`);
            console.log('   - Complete payment on ZaloPay');
            console.log('   - Come back to test status\n');
            
            // Step 3: Query payment status after user completes payment
            console.log('3. To check status after payment, run:');
            console.log(`   node test-status.js ${transactionId}`);
            
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testFullZaloPayFlow();
