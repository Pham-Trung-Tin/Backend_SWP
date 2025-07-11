import Package from '../models/Package.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Lấy tất cả các gói dịch vụ
 * @route GET /api/packages
 */
export const getAllPackages = async (req, res) => {
  try {
    console.log('📦 Getting all packages...');
    
    const packages = await Package.getAllPackages();
    
    if (!packages || !Array.isArray(packages)) {
      console.error('No valid packages returned from database');
      return sendError(res, 'Failed to retrieve packages - database returned invalid data', 500);
    }
    
    console.log(`✅ Found ${packages.length} packages`);
    
    // Format response để phù hợp với frontend
    const formattedPackages = packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name || '',
      description: pkg.description || '',
      price: pkg.price,
      period: pkg.period || 'tháng',
      membershipType: pkg.id === 1 ? 'free' : pkg.id === 2 ? 'premium' : pkg.id === 3 ? 'pro' : `package-${pkg.id}`,
      features: pkg.features || [],
      disabledFeatures: pkg.disabledFeatures || [],
      popular: pkg.popular === 1 || pkg.popular === true
    }));
    
    sendSuccess(res, 'Packages retrieved successfully', formattedPackages);
  } catch (error) {
    console.error('❌ Error getting packages:', error);
    sendError(res, 'Failed to retrieve packages: ' + error.message, 500);
  }
};

/**
 * Lấy chi tiết một gói dịch vụ theo ID
 * @route GET /api/packages/:id
 */
export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📦 Fetching package with id: ${id}`);
    
    if (!id || isNaN(parseInt(id))) {
      return sendError(res, 'Invalid package ID', 400);
    }
    
    const package_data = await Package.getPackageById(id);
    
    if (!package_data) {
      return sendError(res, 'Package not found', 404);
    }
    
    console.log('✅ Package found:', package_data.name);
    
    // Format response để phù hợp với frontend
    const formattedPackage = {
      id: package_data.id,
      name: package_data.name || '',
      description: package_data.description || '',
      price: package_data.price,
      period: package_data.period || 'tháng',
      membershipType: package_data.id === 1 ? 'free' : package_data.id === 2 ? 'premium' : package_data.id === 3 ? 'pro' : `package-${package_data.id}`,
      features: package_data.features || [],
      disabledFeatures: package_data.disabledFeatures || [],
      popular: package_data.popular === 1 || package_data.popular === true
    };
    
    sendSuccess(res, 'Package retrieved successfully', formattedPackage);
  } catch (error) {
    console.error(`❌ Error getting package:`, error);
    sendError(res, 'Failed to retrieve package: ' + error.message, 500);
  }
};

/**
 * Lấy tính năng cho một gói cụ thể
 * @route GET /api/packages/features
 * @route GET /api/packages/:id/features
 */
export const getPackageFeatures = async (req, res) => {
  try {
    // Ưu tiên lấy packageId từ params (nếu route là /api/packages/:id/features)
    // Nếu không có, lấy từ query (package_id hoặc packageId)
    let packageId = req.params.id;
    if (!packageId) {
      packageId = req.query.package_id || req.query.packageId;
    }
    
    console.log(`🔍 Fetching features for package ID: ${packageId}`);
    
    if (!packageId || isNaN(parseInt(packageId))) {
      return sendError(res, 'Invalid package ID', 400);
    }
    
    const package_data = await Package.getPackageById(packageId);
    
    if (!package_data) {
      return sendError(res, 'Package not found', 404);
    }
    
    // Tạo response phù hợp với cấu trúc mà frontend đang mong đợi
    const features = [];
    
    // Thêm các tính năng được bật
    if (Array.isArray(package_data.features)) {
      package_data.features.forEach(feature => {
        features.push({
          feature_name: feature,
          enabled: 1
        });
      });
    }
    
    // Thêm các tính năng bị tắt
    if (Array.isArray(package_data.disabledFeatures)) {
      package_data.disabledFeatures.forEach(feature => {
        features.push({
          feature_name: feature,
          enabled: 0
        });
      });
    }
    
    console.log(`✅ Found ${features.length} features for package ${package_data.name}`);
    sendSuccess(res, 'Package features retrieved successfully', features);
  } catch (error) {
    console.error(`❌ Error getting package features:`, error);
    sendError(res, 'Failed to retrieve package features: ' + error.message, 500);
  }
};

export default {
  getAllPackages,
  getPackageById,
  getPackageFeatures
};
