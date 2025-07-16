import Appointment from '../models/Appointment.js';
import { sendResponse } from '../utils/response.js';

/**
 * Create a new appointment
 * @route POST /api/appointments
 */
export const createAppointment = async (req, res) => {
    try {
        // Get user ID from authenticated user
        const userId = req.user.id;
        
        // Combine user ID with request body
        const appointmentData = {
            ...req.body,
            user_id: userId
        };
        
        // Required fields validation
        const requiredFields = ['coach_id', 'appointment_time', 'duration_minutes'];
        for (const field of requiredFields) {
            if (!appointmentData[field]) {
                return sendResponse(res, 400, false, `Missing required field: ${field}`, null);
            }
        }
        
        // Validate data types
        if (typeof appointmentData.coach_id !== 'number') {
            try {
                appointmentData.coach_id = parseInt(appointmentData.coach_id, 10);
                if (isNaN(appointmentData.coach_id)) {
                    return sendResponse(res, 400, false, 'coach_id must be a number', null);
                }
            } catch (error) {
                return sendResponse(res, 400, false, 'coach_id must be a number', null);
            }
        }
        
        if (typeof appointmentData.duration_minutes !== 'number') {
            try {
                appointmentData.duration_minutes = parseInt(appointmentData.duration_minutes, 10);
                if (isNaN(appointmentData.duration_minutes)) {
                    return sendResponse(res, 400, false, 'duration_minutes must be a number', null);
                }
            } catch (error) {
                return sendResponse(res, 400, false, 'duration_minutes must be a number', null);
            }
        }
        
        // Validate appointment time format
        try {
            const appointmentDate = new Date(appointmentData.appointment_time);
            if (isNaN(appointmentDate.getTime())) {
                return sendResponse(res, 400, false, 'Invalid appointment_time format. Use ISO format (YYYY-MM-DDTHH:MM:SSZ)', null);
            }
            
            // Add date and time fields for the appointments table
            appointmentData.date = appointmentDate.toISOString().split('T')[0];
            appointmentData.time = appointmentDate.toTimeString().slice(0, 8);
        } catch (error) {
            return sendResponse(res, 400, false, 'Invalid appointment_time format. Use ISO format (YYYY-MM-DDTHH:MM:SSZ)', null);
        }
        
        // Create appointment
        const appointment = await Appointment.create(appointmentData);
        
        if (appointment.error) {
            return sendResponse(res, 400, false, appointment.error, null);
        }
        
        return sendResponse(res, 201, true, 'Appointment created successfully', appointment);
    } catch (error) {
        console.error('Error creating appointment:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};

/**
 * Get all appointments for the authenticated user
 * @route GET /api/appointments/user
 */
export const getUserAppointments = async (req, res) => {
    try {
        // Get user ID and role from authenticated user
        const userId = req.user.id;
        const userRole = req.user.role;
        
        console.log(`🔍 Getting appointments for user ID: ${userId}, role: ${userRole}`);
        
        let appointments;
        
        if (userRole === 'coach') {
            // If user is a coach, get appointments where they are the coach
            appointments = await Appointment.getByCoachId(userId);
        } else {
            // If user is a regular user, get appointments where they are the client
            appointments = await Appointment.getByUserId(userId);
        }
        
        console.log(`✅ Found ${appointments.length} appointments for ${userRole} ID: ${userId}`);
        
        return sendResponse(res, 200, true, 'Appointments fetched successfully', appointments);
    } catch (error) {
        console.error('Error getting user appointments:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};

/**
 * Get a specific appointment by ID
 * @route GET /api/appointments/:id
 */
export const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get appointment
        const appointment = await Appointment.getById(id);
        
        if (!appointment) {
            return sendResponse(res, 404, false, 'Appointment not found', null);
        }
        
        // Check if the user is authorized to access this appointment (owner or coach)
        if (appointment.user_id !== req.user.id && appointment.coach_id !== req.user.id) {
            return sendResponse(res, 403, false, 'You are not authorized to access this appointment', null);
        }
        
        return sendResponse(res, 200, true, 'Appointment fetched successfully', appointment);
    } catch (error) {
        console.error('Error getting appointment by ID:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};

/**
 * Update an appointment
 * @route PUT /api/appointments/:id
 */
export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get the current appointment to check permissions
        const currentAppointment = await Appointment.getById(id);
        
        if (!currentAppointment) {
            return sendResponse(res, 404, false, 'Appointment not found', null);
        }
        
        // Only the user who made the appointment or the coach can update it
        if (currentAppointment.user_id !== req.user.id && currentAppointment.coach_id !== req.user.id) {
            return sendResponse(res, 403, false, 'You are not authorized to update this appointment', null);
        }
        
        // If the user is not the coach, they can't change the status
        if (currentAppointment.coach_id !== req.user.id && req.body.status) {
            return sendResponse(res, 403, false, 'Only coaches can update appointment status', null);
        }
        
        // Update appointment
        const updatedAppointment = await Appointment.update(id, req.body);
        
        if (updatedAppointment.error) {
            return sendResponse(res, 400, false, updatedAppointment.error, null);
        }
        
        return sendResponse(res, 200, true, 'Appointment updated successfully', updatedAppointment);
    } catch (error) {
        console.error('Error updating appointment:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};

/**
 * Delete an appointment
 * @route DELETE /api/appointments/:id
 */
export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get the current appointment to check permissions
        const currentAppointment = await Appointment.getById(id);
        
        if (!currentAppointment) {
            return sendResponse(res, 404, false, 'Appointment not found', null);
        }
        
        // Only the user who made the appointment can delete it
        if (currentAppointment.user_id !== req.user.id) {
            return sendResponse(res, 403, false, 'You are not authorized to delete this appointment', null);
        }
        
        // Delete appointment
        const success = await Appointment.delete(id);
        
        if (!success) {
            return sendResponse(res, 400, false, 'Failed to delete appointment', null);
        }
        
        return sendResponse(res, 200, true, 'Appointment deleted successfully', null);
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};

/**
 * Cancel an appointment
 * @route PUT /api/appointments/:id/cancel
 */
export const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get the current appointment to check permissions
        const currentAppointment = await Appointment.getById(id);
        
        if (!currentAppointment) {
            return sendResponse(res, 404, false, 'Appointment not found', null);
        }
        
        // Both the user and coach can cancel an appointment
        if (currentAppointment.user_id !== req.user.id && currentAppointment.coach_id !== req.user.id) {
            return sendResponse(res, 403, false, 'You are not authorized to cancel this appointment', null);
        }
        
        // Cancel appointment
        const cancelledAppointment = await Appointment.cancel(id);
        
        if (cancelledAppointment.error) {
            return sendResponse(res, 400, false, cancelledAppointment.error, null);
        }
        
        return sendResponse(res, 200, true, 'Appointment cancelled successfully', cancelledAppointment);
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};

/**
 * Rate and give feedback for an appointment
 * @route POST /api/appointments/:id/rating
 */
export const rateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, content } = req.body;
        
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return sendResponse(res, 400, false, 'Rating must be between 1 and 5', null);
        }
        
        // Get the current appointment to check permissions
        const currentAppointment = await Appointment.getById(id);
        
        if (!currentAppointment) {
            return sendResponse(res, 404, false, 'Appointment not found', null);
        }
        
        // Only the user who made the appointment can rate it
        if (currentAppointment.user_id !== req.user.id) {
            return sendResponse(res, 403, false, 'You are not authorized to rate this appointment', null);
        }
        
        // Add rating
        const result = await Appointment.addRating(id, { rating, content });
        
        if (result.error) {
            return sendResponse(res, 400, false, result.error, null);
        }
        
        return sendResponse(res, 200, true, 'Rating added successfully', result);
    } catch (error) {
        console.error('Error rating appointment:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};

/**
 * Update appointment status
 * @route PATCH /api/appointments/:id/status
 */
export const updateAppointmentStatus = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { status } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`🔄 Updating appointment ${appointmentId} status to "${status}" by ${userRole} (${userId})`);
        
        // Validate status
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return sendResponse(res, 400, false, 'Invalid status. Must be one of: pending, confirmed, completed, cancelled', null);
        }

        // Get appointment first to check permissions
        const appointment = await Appointment.getById(appointmentId);
        if (!appointment) {
            return sendResponse(res, 404, false, 'Appointment not found', null);
        }

        console.log('📋 Found appointment:', appointment);

        // Check if user has permission to update this appointment
        const canUpdate = userRole === 'coach' && appointment.coach_id === userId;
        if (!canUpdate) {
            return sendResponse(res, 403, false, 'Only coaches can update appointment status', null);
        }

        // Update appointment status
        const updatedAppointment = await Appointment.updateStatus(appointmentId, status);
        
        if (!updatedAppointment) {
            return sendResponse(res, 404, false, 'Appointment not found or could not be updated', null);
        }

        console.log('✅ Successfully updated appointment status');
        
        return sendResponse(res, 200, true, 'Appointment status updated successfully', updatedAppointment);
    } catch (error) {
        console.error('Error updating appointment status:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};
