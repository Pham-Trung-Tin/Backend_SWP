import zaloPayService from '../services/zaloPayService.js';
import * as Payment from '../models/Payment.js';
import * as PaymentTransaction from '../models/PaymentTransaction.js';
import * as Package from '../models/Package.js';
import * as Membership from '../models/Membership.js';

/**
 * Create a ZaloPay payment request
 * @route POST /api/payments/zalopay/create
 * @access Private
 */
export const createZaloPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { packageId, amount, redirectUrl } = req.body;

        // Validate required fields
        if (!packageId) {
            return res.status(400).json({
                success: false,
                message: 'Package ID is required',
                data: null
            });
        }

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Amount is required',
                data: null
            });
        }

        // Validate package exists
        const packageData = await Package.getPackageById(packageId);
        if (!packageData) {
            return res.status(404).json({
                success: false,
                message: `Package with ID ${packageId} not found`,
                data: null
            });
        }

        // Create ZaloPay payment
        const zaloPayResult = await zaloPayService.createPayment({
            amount,
            packageName: packageData.name,
            userId: String(userId),
            redirectUrl: redirectUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success`
        });

        if (!zaloPayResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create ZaloPay payment',
                error: zaloPayResult.error,
                data: null
            });
        }

        // Create payment record in database
        const paymentData = {
            userId: userId,
            packageId: packageId,
            amount,
            paymentMethod: 'zalopay', // Now using 'zalopay' as the payment method
            paymentStatus: 'pending',
            transactionId: zaloPayResult.transactionId,
            paymentDetails: {
                packageName: packageData.name,
                price: amount,
                zp_trans_token: zaloPayResult.data.zp_trans_token,
                order_url: zaloPayResult.data.order_url,
                qr_code: zaloPayResult.data.qr_code,
                order_token: zaloPayResult.data.order_token
            }
        };

        // Create payment record
        const paymentResult = await Payment.createPayment(paymentData);
        
        // Create transaction record
        const transactionData = {
            paymentId: paymentResult.id,
            userId: userId,
            packageId: packageId,
            amount,
            paymentMethod: 'zalopay',
            transactionId: zaloPayResult.transactionId,
            status: 'pending',
            paymentDetails: {
                packageName: packageData.name,
                price: amount,
                zp_trans_token: zaloPayResult.data.zp_trans_token,
                order_url: zaloPayResult.data.order_url
            }
        };
        
        await PaymentTransaction.createPaymentTransaction(transactionData);

        // Đảm bảo order_url được trả về đúng cách
        const responseData = {
            success: true,
            message: 'ZaloPay payment created successfully',
            data: {
                ...zaloPayResult.data,
                id: paymentResult.id
            },
            // Trả về order_url ở cả hai vị trí để đảm bảo client có thể truy cập
            order_url: zaloPayResult.data.order_url
        };
        
        console.log('Trả về dữ liệu cho client:', responseData);
        
        return res.status(200).json(responseData);
    } catch (error) {
        console.error('Error creating ZaloPay payment:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
            data: null
        });
    }
};

/**
 * Process ZaloPay callback
 * @route POST /api/payments/zalopay/callback
 * @access Public
 */
export const zaloPayCallback = async (req, res) => {
    try {
        // Process callback data from ZaloPay
        const callbackResult = zaloPayService.processCallback(req.body);
        
        // Log the callback
        console.log('ZaloPay callback received:', callbackResult);
        
        // If the callback is valid and payment is successful
        if (callbackResult.return_code === 1 && callbackResult.data) {
            const appTransId = callbackResult.data.app_trans_id;
            
            // Find the payment by transaction_id
            const payment = await Payment.getPaymentByTransactionId(appTransId);
            
            if (payment) {
                // Update payment status to completed
                await Payment.updatePaymentStatus(payment.id, 'completed');
                
                // Update transaction status and save callback data
                await PaymentTransaction.updateTransactionStatus(
                    appTransId, 
                    'completed',
                    callbackResult.data
                );
                
                // Update user membership if not already done
                try {
                    // Use the existing purchasePackage function to update membership
                    await Membership.purchasePackage(
                        payment.user_id,
                        payment.package_id,
                        payment.payment_method
                    );
                    console.log(`User membership updated for user ${payment.user_id} with package ${payment.package_id}`);
                } catch (membershipError) {
                    console.error('Error updating user membership:', membershipError);
                }
            }
        }
        
        // Return the response required by ZaloPay
        return res.json({
            return_code: callbackResult.return_code,
            return_message: callbackResult.return_message
        });
    } catch (error) {
        console.error('Error processing ZaloPay callback:', error);
        return res.status(500).json({
            return_code: 0, // Tell ZaloPay to retry
            return_message: error.message
        });
    }
};

/**
 * Query ZaloPay payment status
 * @route GET /api/payments/zalopay/status/:transactionId
 * @access Private
 */
export const getZaloPayStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID is required',
                data: null
            });
        }
        
        // Query payment status from ZaloPay
        const statusResult = await zaloPayService.queryPaymentStatus(transactionId);
        
        if (!statusResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to query payment status',
                error: statusResult.error,
                data: null
            });
        }
        
        // If payment is successful, update our database
        if (statusResult.data.return_code === 1) {
            // Find payment in our system
            const payment = await Payment.getPaymentByTransactionId(transactionId);
            
            if (payment && payment.payment_status !== 'completed') {
                // Update payment status
                await Payment.updatePaymentStatus(payment.id, 'completed');
                
                // Get transaction and update if exists
                const transaction = await PaymentTransaction.getTransactionById(transactionId);
                if (transaction) {
                    await PaymentTransaction.updateTransactionStatus(
                        transactionId,
                        'completed',
                        statusResult.data
                    );
                }
                
                // Update user membership if not already done
                try {
                    // Use the existing purchasePackage function to update membership
                    await Membership.purchasePackage(
                        payment.user_id,
                        payment.package_id,
                        payment.payment_method
                    );
                    console.log(`User membership updated for user ${payment.user_id} with package ${payment.package_id}`);
                } catch (membershipError) {
                    console.error('Error updating user membership:', membershipError);
                }
            }
        }
        
        return res.status(200).json({
            success: true,
            message: 'Payment status retrieved',
            data: statusResult.data
        });
    } catch (error) {
        console.error('Error querying ZaloPay payment status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
            data: null
        });
    }
};
