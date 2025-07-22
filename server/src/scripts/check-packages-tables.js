import { pool } from '../config/database.js';

async function checkPackagesTables() {
    try {
        console.log('🔍 Checking packages tables...');

        // Check packages table
        const [packages] = await pool.query('SELECT * FROM packages');
        console.log(`✅ Found ${packages.length} packages:`);
        packages.forEach(pkg => {
            console.log(`  - ${pkg.name} (${pkg.membership_type}): ${pkg.price} VND/${pkg.period}`);
        });

        // Check package_features table
        const [features] = await pool.query(`
            SELECT p.name as package_name, pf.feature_name, pf.enabled 
            FROM package_features pf
            JOIN packages p ON p.id = pf.package_id
            ORDER BY p.id, pf.id
        `);
        
        console.log('\n📋 Package Features:');
        let currentPackage = '';
        features.forEach(feature => {
            if (currentPackage !== feature.package_name) {
                currentPackage = feature.package_name;
                console.log(`\n  ${currentPackage}:`);
            }
            console.log(`    ${feature.enabled ? '✓' : '✗'} ${feature.feature_name}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking packages tables:', error);
        process.exit(1);
    }
}

// Run the function
checkPackagesTables(); 