import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Lấy thông tin kết nối từ biến môi trường
const DB_NAME = process.env.DB_NAME || 'SmokingCessationSupportPlatform';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 3306;

console.log('Database connection info:');
console.log(`Host: ${DB_HOST}:${DB_PORT}`);
console.log(`Database: ${DB_NAME}`);
console.log(`User: ${DB_USER}`);

// Tạo instance Sequelize với thông tin kết nối MySQL
const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: console.log, // In ra logs để debug
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
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

// Hàm kết nối đến MySQL
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connected: Connection has been established successfully.');
    
    // Sync all defined models to the database
    if (process.env.NODE_ENV !== 'production') {
      console.log('Syncing database models...');
      await sequelize.sync({ alter: false }); // alter: true sẽ cập nhật cấu trúc bảng nếu có thay đổi
      console.log('Database synchronized successfully!');
    }
    
    // Xử lý graceful shutdown
    process.on('SIGINT', async () => {
      console.log('MySQL connection closed through app termination');
      process.exit(0);
    });
    
    return sequelize; // Return the connection for chaining
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    
    // Nếu lỗi là "Unknown database", thử tạo database
    if (error.original && error.original.code === 'ER_BAD_DB_ERROR') {
      console.log(`Database "${DB_NAME}" không tồn tại. Đang thử tạo database mới...`);
      
      try {
        // Tạo connection mới không có database name
        const rootSequelize = new Sequelize('', DB_USER, DB_PASSWORD, {
          host: DB_HOST,
          port: DB_PORT,
          dialect: 'mysql',
          logging: console.log
        });
        
        // Tạo database mới
        await rootSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        console.log(`Database "${DB_NAME}" đã được tạo thành công!`);
        
        // Đóng kết nối tạm thời
        await rootSequelize.close();
        
        // Thử kết nối lại với database mới
        await sequelize.authenticate();
        console.log('Kết nối thành công với database mới!');
        
        // Sync models
        await sequelize.sync({ force: true }); // force: true sẽ xóa và tạo lại các bảng
        console.log('Các bảng đã được tạo thành công!');
        
        return sequelize;
      } catch (createError) {
        console.error('Lỗi khi tạo database:', createError);
        throw createError;
      }
    }
    
    throw error; // Re-throw to allow catching in the server
  }
};

export { sequelize };
export default connectDB;
