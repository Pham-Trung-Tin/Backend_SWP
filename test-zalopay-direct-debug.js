// Test ZaloPay direct API call để debug
import axios from 'axios';
import crypto from 'crypto';

const config = {
    app_id: "2553",
    key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
    key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};

async function testZaloPayDirect() {
    console.log('🧪 Testing ZaloPay API directly...');
    
    try {
        // Generate transaction ID
        const transID = Math.floor(Math.random() * 1000000);
        const today = new Date();
        const dateStr = today.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD format
        const app_trans_id = `${dateStr}_${transID}`;
        
        // Create order data  
        const embed_data = { 
            redirecturl: "http://localhost:5173/payment/success",
            packageName: "Premium Test"
        };
        
        const items = [{ 
            name: "Premium Test Package", 
            quantity: 1, 
            price: 99000 
        }];
        
        const order = {
            app_id: config.app_id,
            app_trans_id: app_trans_id,
            app_user: "testuser_001",
            app_time: Date.now(),
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: 99000,
            description: `Test Payment - ${app_trans_id}`,
            bank_code: "",
            callback_url: "https://webhook.site/#!/view/test123" // Test webhook
        };
        
        // Create MAC
        const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
        order.mac = crypto.createHmac('sha256', config.key1).update(data).digest('hex');
        
        console.log('📤 Sending order to ZaloPay:', {
            app_trans_id: order.app_trans_id,
            amount: order.amount,
            app_user: order.app_user
        });
        
        // Call ZaloPay API
        const response = await axios.post(config.endpoint, order, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        console.log('📥 ZaloPay Response:', response.data);
        
        if (response.data.return_code === 1) {
            console.log('✅ ZaloPay API working correctly!');
            console.log('🔗 Order URL:', response.data.order_url);
            console.log('💡 Try opening this URL in browser to test payment flow');
        } else {
            console.log('❌ ZaloPay API returned error:', response.data.return_message);
        }
        
    } catch (error) {
        console.error('❌ Error calling ZaloPay API:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testZaloPayDirect();
