import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Hàm để tự động tạo database nếu không tồn tại
const createDatabaseIfNotExists = async () => {
  const DB_HOST = process.env.DB_HOST || 'localhost';
  const DB_PORT = process.env.DB_PORT || 3306;
  const DB_USER = process.env.DB_USER || 'root';
  const DB_PASSWORD = process.env.DB_PASSWORD || '';
  const DB_NAME = process.env.DB_NAME || 'quit_smoking_app';
  
  try {
    // Kết nối đến MySQL không chỉ định database
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });
    
    // Tạo database nếu không tồn tại
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME};`);
    console.log(`Database ${DB_NAME} created or already exists!`);
    
    // Đóng kết nối
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error.message);
    throw error;
  }
};

// Tạo instance Sequelize với thông tin kết nối MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'quit_smoking_app',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true, // Tự động thêm createdAt và updatedAt
      underscored: true, // Sử dụng snake_case cho tên cột DB
    },
    dialectOptions: {
      charset: 'utf8mb4'
    }
  }
);

// Hàm kết nối đến MySQL
const connectDB = async () => {
  try {
    // Đầu tiên, đảm bảo database tồn tại
    await createDatabaseIfNotExists();
    
    // Sau đó kết nối đến database
    await sequelize.authenticate();
    console.log('MySQL Connected: Connection has been established successfully.');
    
    // Xử lý graceful shutdown
    process.on('SIGINT', async () => {
      console.log('MySQL connection closed through app termination');
      process.exit(0);
    });
    
    return sequelize; // Return the connection for chaining
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
};

export { sequelize };
export default connectDB;
