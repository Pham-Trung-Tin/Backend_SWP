/**
 * API để kiểm tra và cập nhật tất cả payments pending
 */
import * as PaymentTransaction from '../models/PaymentTransaction.js';
import zaloPayService from '../services/zaloPayService.js';
import * as Membership from '../models/Membership.js';

/**
 * Check và update tất cả pending payments
 * @route POST /api/payments/zalopay/check-pending
 * @access Private
 */
export const checkAndUpdatePendingPayments = async (req, res) => {
    try {
        console.log('🔄 Bắt đầu kiểm tra pending payments...');
        
        // Lấy tất cả payments pending
        const pendingPayments = await PaymentTransaction.getUserPayments();
        const pendingOnly = pendingPayments.filter(p => p.status === 'pending');
        
        console.log(`📋 Tìm thấy ${pendingOnly.length} payments đang pending`);
        
        if (pendingOnly.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Không có payments pending nào',
                data: { checked: 0, updated: 0 }
            });
        }
        
        let updatedCount = 0;
        const results = [];
        
        // Kiểm tra từng payment
        for (const payment of pendingOnly) {
            try {
                console.log(`🔍 Kiểm tra payment ID ${payment.id}, transaction: ${payment.transaction_id}`);
                
                // Query ZaloPay status
                const statusResult = await zaloPayService.queryPaymentStatus(payment.transaction_id);
                
                if (statusResult.success && statusResult.data.return_code === 1) {
                    console.log(`✅ Payment ${payment.id} đã thành công trên ZaloPay, đang cập nhật...`);
                    
                    // Update payment status
                    await PaymentTransaction.updatePaymentStatus(payment.id, 'completed');
                    
                    // Update transaction status
                    await PaymentTransaction.updateTransactionStatus(
                        payment.transaction_id,
                        'completed',
                        {
                            auto_update: true,
                            timestamp: new Date().toISOString(),
                            zalopay_data: statusResult.data
                        }
                    );
                    
                    // Update membership
                    try {
                        const membershipResult = await Membership.purchasePackage(
                            payment.user_id,
                            payment.package_id,
                            payment.payment_method
                        );
                        console.log(`👤 Đã cập nhật membership cho user ${payment.user_id}`);
                        
                        results.push({
                            paymentId: payment.id,
                            transactionId: payment.transaction_id,
                            status: 'updated',
                            membership: membershipResult
                        });
                    } catch (membershipError) {
                        console.error(`❌ Lỗi cập nhật membership cho payment ${payment.id}:`, membershipError);
                        results.push({
                            paymentId: payment.id,
                            transactionId: payment.transaction_id,
                            status: 'payment_updated_membership_failed',
                            error: membershipError.message
                        });
                    }
                    
                    updatedCount++;
                } else {
                    console.log(`⏳ Payment ${payment.id} vẫn chưa thành công trên ZaloPay`);
                    results.push({
                        paymentId: payment.id,
                        transactionId: payment.transaction_id,
                        status: 'still_pending',
                        zalopayStatus: statusResult.data
                    });
                }
                
                // Delay ngắn giữa các request để tránh rate limit
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`❌ Lỗi kiểm tra payment ${payment.id}:`, error);
                results.push({
                    paymentId: payment.id,
                    transactionId: payment.transaction_id,
                    status: 'error',
                    error: error.message
                });
            }
        }
        
        console.log(`✅ Hoàn thành kiểm tra: ${updatedCount}/${pendingOnly.length} payments đã được cập nhật`);
        
        return res.status(200).json({
            success: true,
            message: `Đã kiểm tra ${pendingOnly.length} payments, cập nhật ${updatedCount} payments`,
            data: {
                checked: pendingOnly.length,
                updated: updatedCount,
                results
            }
        });
        
    } catch (error) {
        console.error('❌ Lỗi kiểm tra pending payments:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi kiểm tra pending payments',
            error: error.message
        });
    }
};

export default {
    checkAndUpdatePendingPayments
};
