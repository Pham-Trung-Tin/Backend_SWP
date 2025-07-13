/**
 * Direct database update script - không cần authentication
 */
import { pool } from './server/src/config/database.js';

async function updatePendingPayments() {
  console.log('🔄 Đang cập nhật trực tiếp database...');
  
  try {
    // Lấy tất cả pending payments
    const [pendingPayments] = await pool.execute(`
      SELECT * FROM payment_transactions 
      WHERE status = 'pending' 
      ORDER BY created_at DESC
    `);
    
    console.log(`📋 Tìm thấy ${pendingPayments.length} payments đang pending`);
    
    if (pendingPayments.length === 0) {
      console.log('ℹ️ Không có payments pending nào');
      return;
    }
    
    // In danh sách pending payments
    console.log('\n📋 Danh sách pending payments:');
    pendingPayments.forEach((payment, index) => {
      console.log(`${index + 1}. ID: ${payment.id}, Transaction: ${payment.transaction_id}, User: ${payment.user_id}, Amount: ${payment.amount}`);
    });
    
    // Cập nhật tất cả thành completed
    const [updateResult] = await pool.execute(`
      UPDATE payment_transactions 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
      WHERE status = 'pending'
    `);
    
    console.log(`✅ Đã cập nhật ${updateResult.affectedRows} payments từ pending thành completed`);
    
    // Cập nhật payments table cũng
    const [updatePaymentsResult] = await pool.execute(`
      UPDATE payments 
      SET payment_status = 'completed' 
      WHERE payment_status = 'pending'
    `);
    
    console.log(`✅ Đã cập nhật ${updatePaymentsResult.affectedRows} records trong bảng payments`);
    
    console.log('🎉 Hoàn thành cập nhật!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    process.exit(0);
  }
}

updatePendingPayments();
