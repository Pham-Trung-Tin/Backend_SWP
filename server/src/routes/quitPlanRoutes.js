import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    createQuitPlan,
    getUserPlans,
    getPlanById,
    updatePlan,
    deletePlan,
    getPlanTemplates
} from '../controllers/quitPlanController.js';

const router = express.Router();

// Create a new quit plan
router.post('/', authenticateToken, createQuitPlan);

// Get all quit plans for a user
router.get('/user', authenticateToken, getUserPlans);

// Get quit plan templates
router.get('/templates', getPlanTemplates);

// Get a specific quit plan
router.get('/:id', authenticateToken, getPlanById);

// Update a quit plan
router.put('/:id', authenticateToken, updatePlan);

// Delete a quit plan
router.delete('/:id', authenticateToken, deletePlan);

export default router;
