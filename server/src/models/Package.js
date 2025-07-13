import { pool } from '../config/database.js';

class Package {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.price = data.price;
    this.period = data.period;
    this.membershipType = data.membershipType;
    this.description = data.description;
    this.features = data.features;
    this.disabledFeatures = data.disabledFeatures;
    this.popular = data.popular;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Lấy tất cả các gói
  static async getAllPackages() {
    try {
      console.log('📦 Fetching all packages from database...');
      
      // Lấy dữ liệu từ database thực
      const [packages] = await pool.execute(`
        SELECT 
          id, name, description, price, created_at
        FROM packages 
        ORDER BY id ASC
      `);
      
      if (!packages || packages.length === 0) {
        console.log('⚠️ No packages found in database, returning default packages');
        return this.getDefaultPackages();
      }
      
      // Lấy features cho từng package
      const packagesWithFeatures = await Promise.all(
        packages.map(async (pkg) => {
          const [features] = await pool.execute(`
            SELECT feature_name, enabled 
            FROM package_features 
            WHERE package_id = ?
            ORDER BY id ASC
          `, [pkg.id]);
          
          const enabledFeatures = features.filter(f => f.enabled).map(f => f.feature_name);
          const disabledFeatures = features.filter(f => !f.enabled).map(f => f.feature_name);
          
          return {
            id: pkg.id,
            name: pkg.name,
            price: parseFloat(pkg.price),
            period: pkg.id === 3 ? 'năm' : 'tháng', // Pro package = năm, others = tháng
            membershipType: this.getMembershipType(pkg.id),
            description: pkg.description,
            features: enabledFeatures,
            disabledFeatures: disabledFeatures,
            popular: pkg.id === 2, // Premium is popular
            created_at: pkg.created_at,
            updated_at: pkg.created_at // Fallback
          };
        })
      );
      
      console.log(`✅ Retrieved ${packagesWithFeatures.length} packages from database`);
      return packagesWithFeatures.map(pkg => new Package(pkg));
      
    } catch (error) {
      console.error('❌ Error fetching packages from database:', error);
      console.log('⚠️ Falling back to default packages');
      return this.getDefaultPackages();
    }
  }

  // Helper method để xác định membershipType từ package ID
  static getMembershipType(packageId) {
    switch (packageId) {
      case 1: return 'free';
      case 2: return 'premium';
      case 3: return 'pro';
      default: return 'free';
    }
  }

  // Fallback packages nếu database fail
  static getDefaultPackages() {
    const packages = [
      {
        id: 1,
        name: "Free",
        price: 0,
        period: "tháng",
        membershipType: "free",
        description: "Bắt đầu miễn phí",
        features: ["Theo dõi cai thuốc", "Lập kế hoạch cá nhân"],
        disabledFeatures: ["Huy hiệu & cộng đồng", "Chat huấn luyện viên", "Video call tư vấn"],
        popular: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: "Premium",
        price: 99000,
        period: "tháng",
        membershipType: "premium",
        description: "Hỗ trợ toàn diện",
        features: ["Theo dõi cai thuốc", "Lập kế hoạch cá nhân", "Huy hiệu & cộng đồng", "Chat huấn luyện viên", "Video call tư vấn"],
        disabledFeatures: [],
        popular: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: "Pro",
        price: 999000,
        period: "năm",
        membershipType: "pro",
        description: "Hỗ trợ toàn diện",
        features: ["Theo dõi cai thuốc", "Lập kế hoạch cá nhân", "Huy hiệu & cộng đồng", "Chat huấn luyện viên", "Video call tư vấn"],
        disabledFeatures: [],
        popular: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    return packages.map(pkg => new Package(pkg));
  }

  // Lấy gói theo ID
  static async getPackageById(id) {
    try {
      console.log(`📦 Fetching package with ID: ${id} from database`);
      
      // Lấy package từ database
      const [packages] = await pool.execute(`
        SELECT 
          id, name, description, price, created_at
        FROM packages 
        WHERE id = ?
      `, [id]);
      
      if (!packages || packages.length === 0) {
        throw new Error(`Package with ID ${id} not found in database`);
      }
      
      const pkg = packages[0];
      
      // Lấy features cho package này
      const [features] = await pool.execute(`
        SELECT feature_name, enabled 
        FROM package_features 
        WHERE package_id = ?
        ORDER BY id ASC
      `, [id]);
      
      const enabledFeatures = features.filter(f => f.enabled).map(f => f.feature_name);
      const disabledFeatures = features.filter(f => !f.enabled).map(f => f.feature_name);
      
      const packageData = {
        id: pkg.id,
        name: pkg.name,
        price: parseFloat(pkg.price),
        period: pkg.id === 3 ? 'năm' : 'tháng', // Pro package = năm, others = tháng
        membershipType: this.getMembershipType(pkg.id),
        description: pkg.description,
        features: enabledFeatures,
        disabledFeatures: disabledFeatures,
        popular: pkg.id === 2, // Premium is popular
        created_at: pkg.created_at,
        updated_at: pkg.created_at // Fallback
      };
      
      console.log(`✅ Found package: ${packageData.name} with ${enabledFeatures.length} features`);
      return new Package(packageData);
      
    } catch (error) {
      console.error(`❌ Error fetching package ${id} from database:`, error);
      throw error;
    }
  }

  // Lấy features của gói
  static async getPackageFeatures(packageId = null) {
    try {
      console.log(`📦 Fetching features for package: ${packageId || 'all'} from database`);
      
      if (packageId) {
        // Lấy features cho một package cụ thể
        const [features] = await pool.execute(`
          SELECT feature_name, enabled 
          FROM package_features 
          WHERE package_id = ?
          ORDER BY id ASC
        `, [packageId]);
        
        const enabledFeatures = features.filter(f => f.enabled).map(f => f.feature_name);
        const disabledFeatures = features.filter(f => !f.enabled).map(f => f.feature_name);
        
        console.log(`✅ Found ${enabledFeatures.length} enabled and ${disabledFeatures.length} disabled features for package ${packageId}`);
        
        return {
          features: enabledFeatures,
          disabledFeatures: disabledFeatures
        };
      } else {
        // Lấy features cho tất cả packages
        const [allFeatures] = await pool.execute(`
          SELECT package_id, feature_name, enabled 
          FROM package_features 
          ORDER BY package_id ASC, id ASC
        `);
        
        const featuresMap = {};
        
        allFeatures.forEach(feature => {
          if (!featuresMap[feature.package_id]) {
            featuresMap[feature.package_id] = {
              features: [],
              disabledFeatures: []
            };
          }
          
          if (feature.enabled) {
            featuresMap[feature.package_id].features.push(feature.feature_name);
          } else {
            featuresMap[feature.package_id].disabledFeatures.push(feature.feature_name);
          }
        });
        
        console.log(`✅ Retrieved features for ${Object.keys(featuresMap).length} packages from database`);
        return featuresMap;
      }
      
    } catch (error) {
      console.error(`❌ Error fetching features from database:`, error);
      throw error;
    }
  }

  // Validate package data
  static validatePackageData(data) {
    const required = ['name', 'price', 'membershipType'];
    const missing = required.filter(field => !(field in data));
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    if (typeof data.price !== 'number' || data.price < 0) {
      throw new Error('Price must be a non-negative number');
    }
    
    if (!['free', 'premium', 'pro'].includes(data.membershipType)) {
      throw new Error('Invalid membership type');
    }
    
    return true;
  }

  // Kiểm tra và đồng bộ dữ liệu mặc định vào database
  static async ensureDefaultPackages() {
    try {
      console.log('🔄 Checking if packages exist in database...');
      
      const [existingPackages] = await pool.execute(
        'SELECT COUNT(*) as count FROM packages'
      );
      
      if (existingPackages[0].count === 0) {
        console.log('📦 No packages found, inserting default packages...');
        const defaultPackages = this.getDefaultPackages();
        
        for (const pkg of defaultPackages) {
          // Insert package
          const [packageResult] = await pool.execute(`
            INSERT INTO packages (id, name, price, membership_type, description) 
            VALUES (?, ?, ?, ?, ?)
          `, [pkg.id, pkg.name, pkg.price, pkg.membershipType, pkg.description]);
          
          // Insert features
          if (pkg.features && pkg.features.length > 0) {
            for (const feature of pkg.features) {
              await pool.execute(`
                INSERT INTO package_features (package_id, feature_name, enabled) 
                VALUES (?, ?, ?)
              `, [pkg.id, feature, true]);
            }
          }
          
          // Insert disabled features
          if (pkg.disabledFeatures && pkg.disabledFeatures.length > 0) {
            for (const feature of pkg.disabledFeatures) {
              await pool.execute(`
                INSERT INTO package_features (package_id, feature_name, enabled) 
                VALUES (?, ?, ?)
              `, [pkg.id, feature, false]);
            }
          }
          
          console.log(`✅ Inserted package: ${pkg.name} with ${pkg.features?.length || 0} features`);
        }
        
        console.log('🎉 Default packages successfully inserted into database');
        return true;
      } else {
        console.log(`📦 Found ${existingPackages[0].count} packages in database`);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error ensuring default packages:', error);
      return false;
    }
  }
}

export default Package;
