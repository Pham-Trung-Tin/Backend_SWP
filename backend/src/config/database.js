import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Support both Railway connection string and individual parameters
const createDbConfig = () => {
    // If using Railway connection string (recommended)
    if (process.env.DATABASE_URL || process.env.DB_URL) {
        const url = process.env.DATABASE_URL || process.env.DB_URL;
        return {
            uri: url,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            charset: 'utf8mb4',
            timezone: '+00:00', // Railway uses UTC
            ssl: {
                rejectUnauthorized: false // Required for Railway
            }
        };
    }

    // Fallback to individual parameters
    return {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        charset: 'utf8mb4',
        timezone: '+00:00',
        ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: false
        } : false
    };
};

const dbConfig = createDbConfig();
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');

        // Log connection info based on config type
        if (process.env.DATABASE_URL || process.env.DB_URL) {
            console.log('📍 Connected to Railway MySQL via connection string');
            console.log('🌐 Database host:', process.env.DB_HOST || 'from connection string');
        } else {
            console.log('📍 Connected to MySQL:', {
                host: process.env.DB_HOST,
                database: process.env.DB_NAME,
                user: process.env.DB_USER,
                ssl: process.env.NODE_ENV === 'production'
            });
        }

        // Test a simple query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('🔍 Database test query successful');

        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('💡 Check your Railway database credentials and connection string');
        process.exit(1);
    }
};

export { pool, testConnection };
