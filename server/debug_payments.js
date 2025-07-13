import { pool } from './src/config/database.js';

try {
  const [tables] = await pool.execute("SHOW TABLES LIKE '%payment%'");
  console.log('=== Payment related tables ===');
  console.table(tables);
  
  try {
    const [rows] = await pool.execute('DESCRIBE payments');
    console.log('=== payments table schema ===');
    console.table(rows);
    
    const [data] = await pool.execute('SELECT id, user_id, transaction_id, payment_status, amount FROM payments ORDER BY created_at DESC LIMIT 5');
    console.log('=== Recent 5 payments ===');
    console.table(data);
  } catch (e) {
    console.log('payments table does not exist');
  }
  
  process.exit(0);
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
