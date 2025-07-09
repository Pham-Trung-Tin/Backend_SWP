/**
 * Script to clean up duplicate package features data
 */
import { pool } from '../config/database.js';

/**
 * Clean up duplicate features in the package_features table
 * This function will:
 * 1. Identify duplicates (same package_id and feature_name with different enabled values)
 * 2. Delete all duplicates
 * 3. Re-insert correct data with the UNIQUE constraint
 */
const cleanupPackageFeatures = async () => {
  const connection = await pool.getConnection();
  
  try {
    // Start transaction
    await connection.beginTransaction();
    
    console.log('Starting package_features cleanup...');
    
    // 1. Find duplicates
    const [duplicates] = await connection.execute(`
      SELECT package_id, feature_name, COUNT(*) as count
      FROM package_features
      GROUP BY package_id, feature_name
      HAVING count > 1
    `);
    
    if (duplicates.length === 0) {
      console.log('No duplicates found in package_features table.');
    } else {
      console.log(`Found ${duplicates.length} duplicate feature entries:`, duplicates);
      
      // 2. For each duplicate set, keep only the most recent entry (highest id)
      for (const duplicate of duplicates) {
        const { package_id, feature_name } = duplicate;
        
        // Find the highest ID (most recent) entry for this feature
        const [latest] = await connection.execute(`
          SELECT id, enabled FROM package_features 
          WHERE package_id = ? AND feature_name = ? 
          ORDER BY id DESC LIMIT 1
        `, [package_id, feature_name]);
        
        if (latest.length > 0) {
          const latestId = latest[0].id;
          const enabled = latest[0].enabled;
          
          // Delete all but the latest entry
          await connection.execute(`
            DELETE FROM package_features 
            WHERE package_id = ? AND feature_name = ? AND id != ?
          `, [package_id, feature_name, latestId]);
          
          console.log(`Kept feature "${feature_name}" for package_id ${package_id} with enabled=${enabled} (ID: ${latestId})`);
        }
      }
      
      console.log('Duplicate cleanup completed.');
    }
    
    // 3. Add UNIQUE constraint if it doesn't exist
    try {
      await connection.execute(`
        ALTER TABLE package_features 
        ADD CONSTRAINT unique_package_feature 
        UNIQUE (package_id, feature_name)
      `);
      console.log('Added UNIQUE constraint to package_features table.');
    } catch (error) {
      // If constraint already exists, this is fine
      if (error.code === 'ER_MULTIPLE_PRI_KEY') {
        console.log('UNIQUE constraint already exists on package_features table.');
      } else {
        console.error('Error adding UNIQUE constraint:', error.message);
      }
    }
    
    // Commit changes
    await connection.commit();
    console.log('✅ Package features cleanup completed successfully.');
    
    // Optional: Verify the results
    const [packageCount] = await connection.execute('SELECT COUNT(DISTINCT id) as count FROM package');
    const [featureCount] = await connection.execute('SELECT COUNT(*) as count FROM package_features');
    console.log(`Database now has ${packageCount[0].count} packages and ${featureCount[0].count} features.`);
    
    return true;
    
  } catch (error) {
    // Rollback on error
    await connection.rollback();
    console.error('❌ Error cleaning up package features:', error);
    throw error;
  } finally {
    // Always release the connection
    connection.release();
  }
};

export default cleanupPackageFeatures;
