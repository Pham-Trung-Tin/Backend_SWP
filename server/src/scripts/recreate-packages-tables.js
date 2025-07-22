import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function recreatePackagesTables() {
    try {
        console.log('🔄 Starting packages tables recreation...');

        // Read SQL file
        const sqlPath = path.join(__dirname, 'create-packages-tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split SQL statements
        const statements = sql
            .split(';')
            .filter(statement => statement.trim())
            .map(statement => statement.trim());

        // Drop existing tables if they exist
        console.log('🗑️ Dropping existing tables...');
        await pool.query('DROP TABLE IF EXISTS package_features');
        await pool.query('DROP TABLE IF EXISTS packages');
        console.log('✅ Existing tables dropped');

        // Execute each statement
        console.log('📝 Creating new tables and inserting data...');
        for (const statement of statements) {
            try {
                await pool.query(statement);
                console.log('✓ Successfully executed SQL statement');
            } catch (err) {
                console.error('❌ Error executing SQL statement:', err);
                console.error('Statement was:', statement);
                throw err;
            }
        }

        console.log('✅ Packages tables recreated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error recreating packages tables:', error);
        process.exit(1);
    }
}

// Run the function
recreatePackagesTables(); 