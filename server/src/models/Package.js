import { pool } from '../config/database.js';

/**
 * Tạo bảng package nếu chưa tồn tại
 */
export const ensurePackageTable = async () => {
  try {
    // Tạo bảng package nếu chưa tồn tại
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS package (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        price INT NOT NULL,
        period ENUM('tháng', 'năm') NOT NULL,
        popular BOOLEAN DEFAULT FALSE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Kiểm tra xem cột period đã tồn tại chưa và thêm nếu chưa có
    try {
      // Kiểm tra xem cột period có tồn tại không
      const [periodColumns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'package' 
        AND COLUMN_NAME = 'period'
      `);
      
      // Nếu cột period không tồn tại, thêm vào
      if (periodColumns.length === 0) {
        console.log('Adding missing period column to package table...');
        await pool.execute(`
          ALTER TABLE package 
          ADD COLUMN period ENUM('tháng', 'năm') NOT NULL DEFAULT 'tháng'
        `);
        console.log('✅ period column added successfully');
      }

      // Kiểm tra xem cột popular có tồn tại không
      const [popularColumns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'package' 
        AND COLUMN_NAME = 'popular'
      `);
      
      // Nếu cột popular không tồn tại, thêm vào
      if (popularColumns.length === 0) {
        console.log('Adding missing popular column to package table...');
        await pool.execute(`
          ALTER TABLE package 
          ADD COLUMN popular BOOLEAN DEFAULT FALSE
        `);
        console.log('✅ popular column added successfully');
      }

      // Kiểm tra xem cột active có tồn tại không
      const [activeColumns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'package' 
        AND COLUMN_NAME = 'active'
      `);
      
      // Nếu cột active không tồn tại, thêm vào
      if (activeColumns.length === 0) {
        console.log('Adding missing active column to package table...');
        await pool.execute(`
          ALTER TABLE package 
          ADD COLUMN active BOOLEAN DEFAULT TRUE
        `);
        console.log('✅ active column added successfully');
      }

      // Kiểm tra xem cột duration_months có tồn tại không
      const [durationColumns] = await pool.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'package' 
        AND COLUMN_NAME = 'duration_months'
      `);
      
      // Nếu cột duration_months tồn tại và chưa có default value
      if (durationColumns.length > 0) {
        // Kiểm tra xem column đã có default value chưa
        const [defaultCheck] = await pool.execute(`
          SELECT COLUMN_DEFAULT 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'package' 
          AND COLUMN_NAME = 'duration_months'
        `);
        
        if (defaultCheck[0].COLUMN_DEFAULT === null) {
          console.log('Setting default value for duration_months column...');
          await pool.execute(`
            ALTER TABLE package 
            MODIFY COLUMN duration_months INT NOT NULL DEFAULT 1
          `);
          console.log('✅ duration_months default value set successfully');
        }
      }
    } catch (columnError) {
      console.error('❌ Error checking or adding columns:', columnError);
    }
    
    // Tạo bảng package_features để lưu trữ tính năng của từng gói
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS package_features (
        id INT AUTO_INCREMENT PRIMARY KEY,
        package_id INT NOT NULL,
        feature_name VARCHAR(255) NOT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (package_id) REFERENCES package(id),
        UNIQUE KEY unique_package_feature (package_id, feature_name)
      )
    `);
    
    console.log('✅ Packages tables created or already exist');
    
    // Kiểm tra xem đã có dữ liệu trong bảng package chưa
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM package');
    
    // Nếu chưa có dữ liệu, thêm dữ liệu mặc định
    if (rows[0].count === 0) {
      await insertDefaultPackages();
    }
  } catch (error) {
    console.error('❌ Error creating packages tables:', error);
    throw error;
  }
};

/**
 * Thêm các gói membership mặc định
 */
const insertDefaultPackages = async () => {
  try {
    // Thêm 3 gói mặc định: free, premium, pro
    await pool.execute(`
      INSERT INTO package (name, description, price, period, popular, duration_months) VALUES
      ('Free', 'Bắt đầu miễn phí', 0, 'tháng', FALSE, 1),
      ('Premium', 'Hỗ trợ toàn diện', 99000, 'tháng', TRUE, 1),
      ('Pro', 'Hỗ trợ toàn diện', 999000, 'năm', FALSE, 12)
    `);
    
    // Lấy ID của các gói vừa thêm
    const [freePackage] = await pool.execute('SELECT id FROM package WHERE name = ? LIMIT 1', ['Free']);
    const [premiumPackage] = await pool.execute('SELECT id FROM package WHERE name = ? LIMIT 1', ['Premium']);
    const [proPackage] = await pool.execute('SELECT id FROM package WHERE name = ? LIMIT 1', ['Pro']);
    
    const freeId = freePackage[0].id;
    const premiumId = premiumPackage[0].id;
    const proId = proPackage[0].id;
    
    // Thêm tính năng cho gói free
    await pool.execute(`
      INSERT INTO package_features (package_id, feature_name, enabled) VALUES
      (?, 'Theo dõi cai thuốc', TRUE),
      (?, 'Lập kế hoạch cá nhân', TRUE),
      (?, 'Huy hiệu & cộng đồng', FALSE),
      (?, 'Chat huấn luyện viên', FALSE),
      (?, 'Video call tư vấn', FALSE)
    `, [freeId, freeId, freeId, freeId, freeId]);
    
    // Thêm tính năng cho gói premium
    await pool.execute(`
      INSERT INTO package_features (package_id, feature_name, enabled) VALUES
      (?, 'Theo dõi cai thuốc', TRUE),
      (?, 'Lập kế hoạch cá nhân', TRUE),
      (?, 'Huy hiệu & cộng đồng', TRUE),
      (?, 'Chat huấn luyện viên', TRUE),
      (?, 'Video call tư vấn', TRUE)
    `, [premiumId, premiumId, premiumId, premiumId, premiumId]);
    
    // Thêm tính năng cho gói pro
    await pool.execute(`
      INSERT INTO package_features (package_id, feature_name, enabled) VALUES
      (?, 'Theo dõi cai thuốc', TRUE),
      (?, 'Lập kế hoạch cá nhân', TRUE),
      (?, 'Huy hiệu & cộng đồng', TRUE),
      (?, 'Chat huấn luyện viên', TRUE),
      (?, 'Video call tư vấn', TRUE)
    `, [proId, proId, proId, proId, proId]);
    
    console.log('✅ Default packages inserted successfully');
  } catch (error) {
    console.error('❌ Error inserting default packages:', error);
    throw error;
  }
};

/**
 * Lấy tất cả các gói
 */
export const getAllPackages = async () => {
  try {
    // Sử dụng điều kiện phù hợp với cách lưu trữ boolean trong MySQL
    const [packages] = await pool.execute(`
      SELECT * FROM package WHERE active = 1 OR active IS NULL ORDER BY price ASC
    `);
    
    console.log('Found packages:', packages.map(p => p.name));
    
    // Lấy tính năng cho từng gói
    for (const pkg of packages) {
      try {
        const [features] = await pool.execute(`
          SELECT feature_name, enabled FROM package_features WHERE package_id = ? ORDER BY id ASC
        `, [pkg.id]);
        
        console.log(`Package ${pkg.name} (ID: ${pkg.id}) - Raw features:`, features);
        
        // Chuyển đổi Boolean để đảm bảo hoạt động đúng
        pkg.features = features.filter(f => f.enabled == 1).map(f => f.feature_name);
        pkg.disabledFeatures = features.filter(f => f.enabled == 0).map(f => f.feature_name);
        
        console.log(`Package ${pkg.name} - Features:`, pkg.features);
        console.log(`Package ${pkg.name} - Disabled features:`, pkg.disabledFeatures);
      } catch (featureError) {
        console.error(`Error getting features for package ${pkg.id}:`, featureError);
        pkg.features = [];
        pkg.disabledFeatures = [];
      }
    }
    
    return packages;
  } catch (error) {
    console.error('❌ Error getting all packages:', error);
    throw new Error('Failed to retrieve packages: ' + error.message);
  }
};

/**
 * Lấy chi tiết một gói cụ thể theo ID
 */
export const getPackageById = async (packageId) => {
  try {
    const [packages] = await pool.execute(`
      SELECT * FROM package WHERE id = ? AND (active = 1 OR active IS NULL)
    `, [packageId]);
    
    if (packages.length === 0) {
      return null;
    }
    
    const package_data = packages[0];
    
    // Lấy tính năng cho gói
    const [features] = await pool.execute(`
      SELECT feature_name, enabled FROM package_features WHERE package_id = ? ORDER BY id ASC
    `, [packageId]);
    
    // Chuyển đổi Boolean để đảm bảo hoạt động đúng
    package_data.features = features.filter(f => f.enabled == 1).map(f => f.feature_name);
    package_data.disabledFeatures = features.filter(f => f.enabled == 0).map(f => f.feature_name);
    
    return package_data;
  } catch (error) {
    console.error(`❌ Error getting package ${packageId}:`, error);
    throw new Error(`Failed to retrieve package ${packageId}: ${error.message}`);
  }
};

export default {
  ensurePackageTable,
  getAllPackages,
  getPackageById
};
