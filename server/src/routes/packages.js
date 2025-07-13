import express from 'express';
import packageController from '../controllers/packageController.js';
import { authenticateToken as requireAuth } from '../middleware/auth.js';
import Package from '../models/Package.js';

const router = express.Router();

// Initialize packages data on first load
(async () => {
  try {
    console.log('🚀 Initializing packages routes...');
    await Package.ensureDefaultPackages();
    console.log('✅ Packages routes ready');
  } catch (error) {
    console.error('❌ Error initializing packages:', error);
  }
})();

/**
 * @route GET /api/packages
 * @desc Lấy tất cả các gói dịch vụ
 * @access Public
 */
router.get('/', packageController.getAllPackages);

/**
 * @route GET /api/packages/features
 * @desc Lấy tính năng của một gói theo ID
 * @access Public
 */
router.get('/features', packageController.getPackageFeatures);

/**
 * @route GET /api/packages/:id
 * @desc Lấy chi tiết một gói dịch vụ theo ID
 * @access Public
 */
router.get('/:id', packageController.getPackageById);

/**
 * @route GET /api/packages/:id/features
 * @desc Lấy tính năng của một gói theo ID
 * @access Public
 */
router.get('/:id/features', packageController.getPackageFeatures);

/**
 * @route POST /api/packages/purchase
 * @desc Mua hoặc nâng cấp gói thành viên
 * @access Private - Yêu cầu đăng nhập
 */
router.post('/purchase', requireAuth, packageController.purchasePackage);

/**
 * @route GET /api/packages/user/current
 * @desc Lấy thông tin gói hiện tại của người dùng
 * @access Private - Yêu cầu đăng nhập
 */
router.get('/user/current', requireAuth, packageController.getCurrentUserPackage);

/**
 * @route GET /api/packages/user/history
 * @desc Lấy lịch sử mua gói của người dùng
 * @access Private - Yêu cầu đăng nhập
 */
router.get('/user/history', requireAuth, packageController.getUserPackageHistory);

export default router;
