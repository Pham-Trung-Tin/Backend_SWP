import axios from 'axios';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import qs from 'qs';

/**
 * ZaloPay API Service
 * Handles interactions with ZaloPay sandbox API
 */
class ZaloPayService {
    constructor() {
        this.config = {
            app_id: "2553",
            key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
            key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
            endpoint: "https://sb-openapi.zalopay.vn/v2/create"
        };
    }

    /**
     * Create a ZaloPay payment request
     * 
     * @param {Object} paymentData - Payment data
     * @param {number} paymentData.amount - Payment amount (VND)
     * @param {string} paymentData.packageName - Name of the package being purchased
     * @param {string} paymentData.userId - User ID making the payment
     * @param {string} paymentData.redirectUrl - Redirect URL after payment
     * @returns {Promise<Object>} - ZaloPay payment response
     */
    async createPayment(paymentData) {
        const { 
            amount = 99000,
            packageName = "Premium",
            userId = "user123",
            redirectUrl = "http://localhost:5173/payment/success"
        } = paymentData;

        // Create embed data with redirect URL
        const embed_data = { redirecturl: redirectUrl, packageName };
        
        // Create items array
        const items = [{ name: packageName, quantity: 1, price: amount }];
        
        // Generate transaction ID
        const transID = Math.floor(Math.random() * 1000000);
        const app_trans_id = `${moment().format('YYMMDD')}_${transID}`;
        
        // Build order data
        const order = {
            app_id: this.config.app_id,
            app_trans_id,
            app_user: userId,
            app_time: Date.now(),
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount,
            description: `NoSmoke - Gói ${packageName} [${app_trans_id}]`,
            bank_code: "",
            // Use ngrok URL for callback in development
            callback_url: process.env.ZALOPAY_CALLBACK_URL || 
                         'https://c07ed66e8d82.ngrok-free.app/api/payments/zalopay/callback'
        };
        
        // Create MAC signature
        const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
        order.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();
        
        try {
            console.log('=== ZaloPay Payment Creation ===');
            console.log('Callback URL được sử dụng:', order.callback_url);
            console.log('Gửi request tới ZaloPay API:', this.config.endpoint);
            console.log('Dữ liệu gửi đi:', order);
            
            // Option 1: Call ZaloPay Sandbox API directly (PRODUCTION)
            const result = await axios.post(this.config.endpoint, null, { params: order });
            
            // Option 2: Call local ZaloPay server running on port 5001 (DEVELOPMENT ONLY)
            // console.log('Gọi ZaloPay local server trên port 5001');
            // const result = await axios.post('http://localhost:5001/payment', order, {
            //     headers: { 'Content-Type': 'application/json' }
            // });
            
            console.log('ZaloPay API Response:', result.data);
            
            return { 
                success: true, 
                data: result.data,
                order_url: result.data.order_url, // Thêm order_url trực tiếp vào response
                transactionId: app_trans_id 
            };
        } catch (error) {
            console.error('ZaloPay API error:', error.message);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }
    
    /**
     * Process ZaloPay callback
     * 
     * @param {Object} callbackData - Callback data from ZaloPay
     * @returns {Object} - Response to send back to ZaloPay
     */
    processCallback(callbackData) {
        let result = {};

        try {
            const { data: dataStr, mac: reqMac } = callbackData;
            
            // Verify MAC signature
            const mac = CryptoJS.HmacSHA256(dataStr, this.config.key2).toString();
            
            if (reqMac !== mac) {
                result.return_code = -1;
                result.return_message = "mac not equal";
            } else {
                const dataJson = JSON.parse(dataStr);
                console.log("ZaloPay payment success for app_trans_id:", dataJson["app_trans_id"]);
                
                result.return_code = 1;
                result.return_message = "success";
                
                // Return parsed data for further processing
                result.data = dataJson;
            }
        } catch (ex) {
            result.return_code = 0; // ZaloPay will retry callback (up to 3 times)
            result.return_message = ex.message;
        }

        return result;
    }
    
    /**
     * Query payment status from ZaloPay
     * 
     * @param {string} app_trans_id - ZaloPay transaction ID 
     * @returns {Promise<Object>} - Payment status
     */
    async queryPaymentStatus(app_trans_id) {
        let postData = { app_id: this.config.app_id, app_trans_id };
        let data = `${postData.app_id}|${postData.app_trans_id}|${this.config.key1}`;
        postData.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();

        try {
            const result = await axios.post(
                "https://sb-openapi.zalopay.vn/v2/query", 
                qs.stringify(postData), 
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
            return { success: true, data: result.data };
        } catch (error) {
            console.error('ZaloPay query error:', error.message);
            return { success: false, error: error.message };
        }
    }
}

export default new ZaloPayService();
