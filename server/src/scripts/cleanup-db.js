/**
 * Script to clean up database issues
 */
import cleanupPackageFeatures from '../utils/cleanupPackageFeatures.js';

const runCleanup = async () => {
  try {
    console.log('Starting database cleanup...');
    
    // Clean up package features
    await cleanupPackageFeatures();
    
    console.log('✅ Database cleanup completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    process.exit(1);
  }
};

runCleanup();
