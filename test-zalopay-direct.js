// Test direct ZaloPay API query for transaction "250711_50659"
import axios from 'axios';
import CryptoJS from 'crypto-js';

const config = {
    app_id: "2553",
    key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL"
};

async function testZaloPayDirectQuery() {
    const app_trans_id = "250711_50659";
    
    console.log('=== Testing Direct ZaloPay API Query ===');
    console.log(`Transaction ID: ${app_trans_id}`);
    
    try {
        // Prepare query data
        let postData = { 
            app_id: config.app_id, 
            app_trans_id: app_trans_id 
        };
        
        // Create MAC signature for query
        let data = `${postData.app_id}|${postData.app_trans_id}|${config.key1}`;
        postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
        
        console.log('Query data:', postData);
        
        // Query ZaloPay directly
        const response = await axios.post(
            "https://sb-openapi.zalopay.vn/v2/query",
            new URLSearchParams(postData),
            { 
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded' 
                } 
            }
        );
        
        console.log('✅ ZaloPay Response:', response.data);
        console.log('');
        
        // Interpret the response
        const result = response.data;
        if (result.return_code === 1) {
            console.log('🎉 Payment is SUCCESSFUL on ZaloPay side!');
            console.log('- Amount:', result.amount);
            console.log('- Status:', 'Completed');
            console.log('- This means the callback failed to update our database');
        } else if (result.return_code === 2) {
            console.log('❌ Payment FAILED on ZaloPay side');
        } else if (result.return_code === 3) {
            console.log('⏳ Payment is still PROCESSING on ZaloPay side');
        } else {
            console.log('❓ Unknown status:', result.return_code);
            console.log('Message:', result.return_message);
        }
        
    } catch (error) {
        console.error('❌ Error querying ZaloPay:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testZaloPayDirectQuery();
