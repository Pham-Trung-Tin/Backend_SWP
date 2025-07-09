/**
 * Script to check if the payments table exists and show its structure
 * 
 * To run this script, execute:
 * node server/src/scripts/check-payments-table.js
 */

import { pool } from '../config/database.js';

const checkPaymentsTable = async () => {
  try {
    console.log('🔍 Checking payments table...');

    // Check if table exists
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'payments'
    `);

    if (tables.length === 0) {
      console.log('❌ Payments table does not exist');
      return;
    }

    console.log('✅ Payments table exists');

    // Get table columns
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'payments'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n📋 Payments table structure:');
    console.table(columns);

    // Count records
    const [countResult] = await pool.execute('SELECT COUNT(*) as count FROM payments');
    console.log(`\n📊 Total payment records: ${countResult[0].count}`);

    if (countResult[0].count > 0) {
      // Show sample records
      const [records] = await pool.execute('SELECT * FROM payments LIMIT 5');
      console.log('\n📄 Sample payment records:');
      console.log(JSON.stringify(records, null, 2));
    }

  } catch (error) {
    console.error('❌ Error checking payments table:', error);
  } finally {
    // Close the database connection
    pool.end();
  }
};

// Run the check
checkPaymentsTable();
