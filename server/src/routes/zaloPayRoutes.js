import express from 'express';
import { createZaloPayment, zaloPayCallback, getZaloPayStatus, manualUpdateZaloPayStatus } from '../controllers/zaloPayController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route POST /api/payments/zalopay/create
 * @desc Create a new ZaloPay payment
 * @access Private - Requires authentication
 */
router.post('/zalopay/create', requireAuth, createZaloPayment);

/**
 * @route POST /api/payments/zalopay/callback
 * @desc Handle ZaloPay callback notifications
 * @access Public - No authentication required (ZaloPay server needs to access)
 */
router.post('/zalopay/callback', zaloPayCallback);

/**
 * @route GET /api/payments/zalopay/status/:transactionId
 * @desc Get ZaloPay payment status
 * @access Private - Requires authentication
 */
router.get('/zalopay/status/:transactionId', requireAuth, getZaloPayStatus);

/**
 * @route POST /api/payments/zalopay/manual-update/:transactionId
 * @desc Manually update ZaloPay payment status (when callback fails)
 * @access Private - Requires authentication
 */
router.post('/zalopay/manual-update/:transactionId', requireAuth, manualUpdateZaloPayStatus);

export default router;
