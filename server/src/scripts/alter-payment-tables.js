const { db } = require('../config/database');

/**
 * Script to alter payment tables for ZaloPay integration
 * Adds missing columns needed for proper payment tracking
 */
async function alterPaymentTables() {
  console.log('Starting payment tables alteration...');
  
  try {
    // Add payment_details column to payment_transactions table
    console.log('Adding payment_details column to payment_transactions...');
    await db.query(`
      ALTER TABLE payment_transactions
      ADD COLUMN IF NOT EXISTS payment_details JSON 
      COMMENT 'JSON data with transaction details specific to payment provider'
    `);
    
    // Add payment_id column to payment_transactions table
    console.log('Adding payment_id column to payment_transactions...');
    await db.query(`
      ALTER TABLE payment_transactions
      ADD COLUMN IF NOT EXISTS payment_id INT 
      COMMENT 'Foreign key to payments table'
    `);
    
    // Add foreign key constraint
    console.log('Adding foreign key constraint...');
    try {
      await db.query(`
        ALTER TABLE payment_transactions
        ADD CONSTRAINT fk_payment_transactions_payments
        FOREIGN KEY (payment_id) REFERENCES payments(id)
      `);
    } catch (fkError) {
      // Foreign key may already exist or there might be existing data issues
      console.warn('Warning with foreign key constraint:', fkError.message);
    }
    
    // Add index on transaction_id for both tables
    console.log('Adding transaction_id indexes...');
    try {
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_payments_transaction_id 
        ON payments(transaction_id)
      `);
      
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id 
        ON payment_transactions(transaction_id)
      `);
    } catch (indexError) {
      console.warn('Warning with index creation:', indexError.message);
    }
    
    console.log('Payment tables alteration completed successfully!');
  } catch (error) {
    console.error('Error altering payment tables:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  alterPaymentTables()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Failed to alter payment tables:', err);
      process.exit(1);
    });
} else {
  // Export for use in other files
  module.exports = { alterPaymentTables };
}
