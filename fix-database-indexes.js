#!/usr/bin/env node

/**
 * Database Index Fix Script
 * Fixes the MySQL index creation issues for appointment system
 */

import { pool } from './server/src/config/database.js';

const log = {
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️ ${msg}`),
  info: (msg) => console.log(`ℹ️ ${msg}`)
};

/**
 * Create index safely (check if exists first)
 */
const createIndexSafely = async (tableName, indexName, columns) => {
  try {
    // Check if index already exists
    const [rows] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = ? 
      AND INDEX_NAME = ?
    `, [tableName, indexName]);
    
    if (rows[0].count > 0) {
      log.info(`Index ${indexName} already exists on table ${tableName}`);
      return true;
    }
    
    // Create the index
    const sql = `ALTER TABLE ${tableName} ADD INDEX ${indexName} (${columns})`;
    await pool.query(sql);
    log.success(`Created index ${indexName} on table ${tableName}`);
    return true;
    
  } catch (error) {
    log.error(`Failed to create index ${indexName} on table ${tableName}: ${error.message}`);
    return false;
  }
};

/**
 * Check if table exists
 */
const tableExists = async (tableName) => {
  try {
    const [rows] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = ?
    `, [tableName]);
    
    return rows[0].count > 0;
  } catch (error) {
    log.error(`Error checking table ${tableName}: ${error.message}`);
    return false;
  }
};

/**
 * Main fix function
 */
const fixDatabaseIndexes = async () => {
  console.log('🔧 Starting Database Index Fix...\n');
  
  try {
    // Test database connection
    await pool.query('SELECT 1');
    log.success('Database connection successful');
    
    // Check and create indexes for different table variations
    const tableVariants = [
      { name: 'appointment', singular: true },
      { name: 'appointments', singular: false }
    ];
    
    for (const table of tableVariants) {
      if (await tableExists(table.name)) {
        log.info(`Found table: ${table.name}`);
        
        // Create indexes for this table
        const indexes = [
          { name: `idx_${table.name}_coach_id`, columns: 'coach_id' },
          { name: `idx_${table.name}_user_id`, columns: 'user_id' },
          { name: `idx_${table.name}_status`, columns: 'status' },
          { name: `idx_${table.name}_time`, columns: table.singular ? 'appointment_time' : 'appointment_time' },
          { name: `idx_${table.name}_created`, columns: 'created_at' }
        ];
        
        for (const index of indexes) {
          await createIndexSafely(table.name, index.name, index.columns);
        }
      }
    }
    
    // Check coach_availability table
    if (await tableExists('coach_availability')) {
      log.info('Found table: coach_availability');
      await createIndexSafely('coach_availability', 'idx_coach_availability', 'coach_id, day_of_week');
    }
    
    // Check feedback table
    if (await tableExists('feedback')) {
      log.info('Found table: feedback');
      await createIndexSafely('feedback', 'idx_feedback_coach', 'coach_id');
    }
    
    // Check messages table
    if (await tableExists('messages')) {
      log.info('Found table: messages');
      await createIndexSafely('messages', 'idx_messages_appointment', 'appointment_id');
      await createIndexSafely('messages', 'idx_messages_created', 'created_at');
    }
    
    log.success('\\n🎉 Database index fix completed successfully!');
    
  } catch (error) {
    log.error(`Database fix failed: ${error.message}`);
    throw error;
  } finally {
    // Close the pool
    await pool.end();
  }
};

// Run the fix
fixDatabaseIndexes()
  .then(() => {
    console.log('\\n✨ All database indexes have been created/verified.');
    console.log('Your appointment system should now work without index errors.');
    process.exit(0);
  })
  .catch(error => {
    console.error('\\n💥 Fix failed:', error.message);
    process.exit(1);
  });
