import express from 'express';
import { auth } from '../middleware/auth.js';
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
router.post('/', auth, createQuitPlan);

// Get all quit plans for a user
router.get('/user', auth, getUserPlans);

// Get quit plan templates
router.get('/templates', getPlanTemplates);

// Get a specific quit plan
router.get('/:id', auth, getPlanById);

// Update a quit plan
router.put('/:id', auth, updatePlan);

// Delete a quit plan
router.delete('/:id', auth, deletePlan);

export default router;
