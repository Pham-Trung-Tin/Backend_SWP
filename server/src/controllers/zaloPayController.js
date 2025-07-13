import zaloPayService from '../services/zaloPayService.js';
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
        const paymentResult = await PaymentTransaction.createPayment(paymentData);
        
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
        console.log('=== ZaloPay Callback Received ===');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Request IP:', req.ip || req.connection.remoteAddress);
        console.log('Request body:', req.body);
        console.log('Request headers:', req.headers);
        console.log('========================================');
        
        // Process callback data from ZaloPay
        const callbackResult = zaloPayService.processCallback(req.body);
        
        // Log the callback
        console.log('ZaloPay callback processed:', callbackResult);
        
        // If the callback is valid and payment is successful
        if (callbackResult.return_code === 1 && callbackResult.data) {
            const appTransId = callbackResult.data.app_trans_id;
            console.log(`Processing successful payment for transaction: ${appTransId}`);
            
            // Find the payment by transaction_id
            const payment = await PaymentTransaction.getPaymentByTransactionId(appTransId);
            
            if (payment) {
                console.log(`Found payment record:`, payment);
                
                // Only update if not already completed
                if (PaymentTransaction.payment_status !== 'completed') {
                    console.log(`Updating payment status to completed for payment ID: ${PaymentTransaction.id}`);
                    
                    // Update payment status to completed
                    await PaymentTransaction.updatePaymentStatus(PaymentTransaction.id, 'completed');
                    console.log(`✅ Payment status updated to completed`);
                    
                    // Update transaction status and save callback data
                    await PaymentTransaction.updateTransactionStatus(
                        appTransId, 
                        'completed',
                        callbackResult.data
                    );
                    console.log(`✅ Transaction status updated to completed`);
                    
                    // Update user membership if not already done
                    try {
                        console.log(`🔄 Updating membership for user ${PaymentTransaction.user_id} with package ${PaymentTransaction.package_id}`);
                        // Use the existing purchasePackage function to update membership
                        const membershipResult = await Membership.purchasePackage(
                            PaymentTransaction.user_id,
                            PaymentTransaction.package_id,
                            PaymentTransaction.payment_method
                        );
                        console.log(`✅ User membership updated successfully:`, membershipResult);
                    } catch (membershipError) {
                        console.error('❌ Error updating user membership:', membershipError);
                        // Don't fail the callback even if membership update fails
                        // This can be retried later
                    }
                } else {
                    console.log(`Payment already completed for transaction: ${appTransId}`);
                }
            } else {
                console.error(`❌ No payment found for transaction: ${appTransId}`);
                // Log all pending payments to help debug
                console.log('Searching for similar transactions...');
                try {
                    const allPendingPayments = await PaymentTransaction.getUserPayments();
                    console.log('Recent payments in system:', allPendingPayments.slice(0, 5));
                } catch (e) {
                    console.log('Could not fetch payments for debugging');
                }
            }
        } else {
            console.log(`Callback not successful. Return code: ${callbackResult.return_code}, Message: ${callbackResult.return_message}`);
        }
        
        // Return the response required by ZaloPay
        const response = {
            return_code: callbackResult.return_code,
            return_message: callbackResult.return_message
        };
        console.log('Returning response to ZaloPay:', response);
        
        return res.json(response);
    } catch (error) {
        console.error('❌ Error processing ZaloPay callback:', error);
        console.error('Error stack:', error.stack);
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
            const payment = await PaymentTransaction.getPaymentByTransactionId(transactionId);
            
            if (payment && PaymentTransaction.payment_status !== 'completed') {
                // Update payment status
                await PaymentTransaction.updatePaymentStatus(PaymentTransaction.id, 'completed');
                
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
                        PaymentTransaction.user_id,
                        PaymentTransaction.package_id,
                        PaymentTransaction.payment_method
                    );
                    console.log(`User membership updated for user ${PaymentTransaction.user_id} with package ${PaymentTransaction.package_id}`);
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

/**
 * Manual update of ZaloPay payment status - useful when callback fails
 * @route POST /api/payments/zalopay/manual-update/:transactionId
 * @access Private - Requires authentication
 */
export const manualUpdateZaloPayStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID is required',
                data: null
            });
        }

        console.log(`=== Manual Update Requested ===`);
        console.log(`Transaction ID: ${transactionId}`);
        console.log(`Requested by user: ${req.user?.id || 'Unknown'}`);
        
        // Step 1: Find payment in our system
        const payment = await PaymentTransaction.getPaymentByTransactionId(transactionId);
        
        if (!payment) {
            console.log(`❌ No payment found with transaction ID: ${transactionId}`);
            return res.status(404).json({
                success: false,
                message: `No payment found with transaction ID: ${transactionId}`,
                data: null
            });
        }

        console.log(`✅ Found payment record:`, {
            id: PaymentTransaction.id,
            user_id: PaymentTransaction.user_id,
            package_id: PaymentTransaction.package_id,
            amount: PaymentTransaction.amount,
            payment_status: PaymentTransaction.payment_status
        });
        
        // Step 2: Verify with ZaloPay first
        console.log(`📡 Querying ZaloPay API for transaction status...`);
        const statusResult = await zaloPayService.queryPaymentStatus(transactionId);
        
        if (!statusResult.success) {
            console.log(`❌ Failed to query ZaloPay status: ${statusResult.error}`);
            return res.status(500).json({
                success: false,
                message: 'Failed to query payment status from ZaloPay',
                error: statusResult.error,
                data: null
            });
        }
        
        console.log(`✅ ZaloPay status response:`, statusResult.data);
        
        // Step 3: Check if payment is actually successful on ZaloPay
        if (statusResult.data.return_code === 1) {
            console.log(`✅ ZaloPay confirms payment is successful`);
            
            // Only proceed if payment is still pending in our system
            if (PaymentTransaction.payment_status !== 'completed') {
                console.log(`🔄 Updating payment status from ${PaymentTransaction.payment_status} to completed...`);
                
                // Manually update payment status
                const updatedPayment = await PaymentTransaction.updatePaymentStatus(PaymentTransaction.id, 'completed');
                
                // Update transaction status if exists
                const transaction = await PaymentTransaction.getTransactionById(transactionId);
                if (transaction) {
                    console.log(`🔄 Updating transaction status...`);
                    await PaymentTransaction.updateTransactionStatus(
                        transactionId,
                        'completed',
                        { 
                            manual_update: true, 
                            timestamp: new Date().toISOString(),
                            zalopay_data: statusResult.data
                        }
                    );
                }
                
                // Step 4: Update user membership
                try {
                    console.log(`🔄 Updating user membership for user ${PaymentTransaction.user_id} with package ${PaymentTransaction.package_id}...`);
                    // Use the existing purchasePackage function to update membership
                    const membershipResult = await Membership.purchasePackage(
                        PaymentTransaction.user_id,
                        PaymentTransaction.package_id,
                        PaymentTransaction.payment_method
                    );
                    console.log(`✅ User membership manually updated successfully:`, membershipResult);
                    
                    return res.status(200).json({
                        success: true,
                        message: 'Payment status manually updated to completed',
                        data: {
                            payment: updatedPayment,
                            membership: membershipResult,
                            zalopay_status: statusResult.data
                        }
                    });
                } catch (membershipError) {
                    console.error('❌ Error updating user membership:', membershipError);
                    return res.status(500).json({
                        success: false,
                        message: 'Payment status updated but membership update failed',
                        error: membershipError.message,
                        data: { 
                            payment: updatedPayment,
                            zalopay_status: statusResult.data
                        }
                    });
                }
            } else {
                console.log(`ℹ️ Payment already completed`);
                return res.status(200).json({
                    success: true,
                    message: 'Payment already completed',
                    data: { 
                        payment,
                        zalopay_status: statusResult.data
                    }
                });
            }
        } else {
            console.log(`❌ ZaloPay reports payment not successful. Return code: ${statusResult.data.return_code}`);
            return res.status(400).json({
                success: false,
                message: `Payment not successful on ZaloPay. Status: ${statusResult.data.return_message || 'Unknown'}`,
                data: {
                    payment,
                    zalopay_status: statusResult.data
                }
            });
        }
    } catch (error) {
        console.error('❌ Error manually updating ZaloPay payment status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
            data: null
        });
    }
};
