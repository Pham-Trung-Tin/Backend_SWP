/**
 * Test API endpoint để bypass authentication cho testing
 */

import express from 'express';
import * as appointmentController from '../controllers/appointmentController.js';

const router = express.Router();

// Test endpoint - bypass auth for testing
router.get('/test-coach-appointments/:coachId', async (req, res) => {
  try {
    const coachId = req.params.coachId;
    
    // Mock authenticated user
    req.user = {
      id: parseInt(coachId),
      role: 'coach'
    };
    
    // Call the original controller
    return appointmentController.getCoachAppointments(req, res);
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test endpoint error',
      error: error.message
    });
  }
});

export default router;
