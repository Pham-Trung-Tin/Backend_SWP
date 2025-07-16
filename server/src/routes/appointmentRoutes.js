import express from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { 
    getAppointmentMessages, 
    createMessage, 
    markMessagesAsRead 
} from '../controllers/messageController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route POST /api/appointments
 * @desc Create a new appointment
 * @access Private - Requires authentication
 */
router.post('/', requireAuth, appointmentController.createAppointment);

/**
 * @route GET /api/appointments/user
 * @desc Get all appointments for the authenticated user
 * @access Private - Requires authentication
 */
router.get('/user', requireAuth, appointmentController.getUserAppointments);

/**
 * @route GET /api/appointments/:id
 * @desc Get a specific appointment by ID
 * @access Private - Requires authentication and authorization
 */
router.get('/:id', requireAuth, appointmentController.getAppointmentById);

/**
 * @route PUT /api/appointments/:id
 * @desc Update an appointment
 * @access Private - Requires authentication and authorization
 */
router.put('/:id', requireAuth, appointmentController.updateAppointment);

/**
 * @route DELETE /api/appointments/:id
 * @desc Delete an appointment
 * @access Private - Requires authentication and authorization
 */
router.delete('/:id', requireAuth, appointmentController.deleteAppointment);

/**
 * @route PUT /api/appointments/:id/cancel
 * @desc Cancel an appointment
 * @access Private - Requires authentication and authorization
 */
router.put('/:id/cancel', requireAuth, appointmentController.cancelAppointment);

/**
 * @route POST /api/appointments/:id/rate
 * @desc Rate and give feedback for an appointment
 * @access Private - Requires authentication and authorization
 */
router.post('/:id/rate', requireAuth, appointmentController.rateAppointment);

/**
 * @route GET /api/appointments/:appointmentId/messages
 * @desc Get messages for a specific appointment
 * @access Private - Requires authentication
 */
router.get('/:appointmentId/messages', requireAuth, getAppointmentMessages);

/**
 * @route POST /api/appointments/:appointmentId/messages
 * @desc Create a new message for an appointment
 * @access Private - Requires authentication
 */
router.post('/:appointmentId/messages', requireAuth, createMessage);

/**
 * @route POST /api/appointments/:appointmentId/messages/read
 * @desc Mark messages as read for an appointment
 * @access Private - Requires authentication
 */
router.post('/:appointmentId/messages/read', requireAuth, markMessagesAsRead);

/**
 * @route PATCH /api/appointments/:id/status
 * @desc Update appointment status
 * @access Private - Requires authentication and authorization
 */
router.patch('/:id/status', requireAuth, appointmentController.updateAppointmentStatus);

export default router;
