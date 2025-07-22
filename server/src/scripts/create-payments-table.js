import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createPaymentsTable() {
    try {
        console.log('🔄 Starting payments table creation...');

        // Read SQL file
        const sqlPath = path.join(__dirname, 'create-payments-table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split SQL statements
        const statements = sql
            .split(';')
            .filter(statement => statement.trim())
            .map(statement => statement.trim());

        // Execute each statement
        console.log('📝 Creating payments table...');
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

        console.log('✅ Payments table created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating payments table:', error);
        process.exit(1);
    }
}

// Run the function
createPaymentsTable(); 