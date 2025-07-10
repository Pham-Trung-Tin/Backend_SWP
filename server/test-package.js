// Test script
import { ensurePackageTable } from './src/models/Package.js';

// Test function
async function testPackageModel() {
  try {
    console.log('Testing Package model...');
    
    // Test ensuring tables
    await ensurePackageTable();
    console.log('✅ ensurePackageTable passed');
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testPackageModel();
