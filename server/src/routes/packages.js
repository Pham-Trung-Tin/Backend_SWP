import express from 'express';
import packageController from '../controllers/packageController.js';
import membershipController from '../controllers/membershipController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route GET /api/packages
 * @desc Lấy tất cả các gói dịch vụ
 * @access Public
 */
router.get('/', packageController.getAllPackages);

/**
 * @route GET /api/packages/:id
 * @desc Lấy chi tiết một gói dịch vụ theo ID
 * @access Public
 */
router.get('/:id', packageController.getPackageById);

/**
 * @route POST /api/packages/purchase
 * @desc Mua hoặc nâng cấp gói thành viên
 * @access Private - Yêu cầu đăng nhập
 */
router.post('/purchase', requireAuth, membershipController.purchasePackage);

/**
 * @route GET /api/packages/user/current
 * @desc Lấy thông tin gói hiện tại của người dùng
 * @access Private - Yêu cầu đăng nhập
 */
router.get('/user/current', requireAuth, membershipController.getCurrentMembership);

/**
 * @route GET /api/packages/user/history
 * @desc Lấy lịch sử mua gói của người dùng
 * @access Private - Yêu cầu đăng nhập
 */
router.get('/user/history', requireAuth, membershipController.getMembershipHistory);

export default router;
