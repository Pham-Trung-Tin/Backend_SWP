/**
 * Health check route for API testing
 */

import express from 'express';

const router = express.Router();

// Simple health check endpoint
router.get('/health-check', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

export default router;
