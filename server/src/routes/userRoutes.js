import express from 'express';
import {
    getUserProfile,
    updateUserProfile,
    uploadAvatar,
    getSmokingStatus,
    updateSmokingStatus,
    deleteUserAccount,
    upload
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Avatar upload
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// Smoking status routes
router.get('/smoking-status', getSmokingStatus);
router.put('/smoking-status', updateSmokingStatus);

// Account deletion
router.delete('/account', deleteUserAccount);

export default router;
