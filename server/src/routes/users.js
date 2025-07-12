import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
    validateProfileUpdate,
    validateSmokingStatus,
    handleValidationErrors 
} from '../middleware/validation.js';
import { upload } from '../middleware/fileUpload.js';

const router = express.Router();

// All routes in this file require authentication
router.use(authenticateToken);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', validateProfileUpdate, handleValidationErrors, userController.updateProfile);

// Avatar routes
router.post('/upload-avatar', upload.single('avatar'), userController.uploadAvatar);

// Smoking status routes
router.get('/smoking-status', userController.getSmokingStatus);
router.put('/smoking-status', validateSmokingStatus, handleValidationErrors, userController.updateSmokingStatus);

// Account deletion route
router.delete('/account', userController.deleteAccount);

export default router;
