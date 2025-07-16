import Message from '../models/Message.js';
import { sendResponse } from '../utils/response.js';

/**
 * Get messages for a specific appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAppointmentMessages = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        
        // Validate input
        if (!appointmentId) {
            return sendResponse(res, 400, false, 'Appointment ID is required', null);
        }
        
        const messages = await Message.getAppointmentMessages(appointmentId);
        
        if (messages === null) {
            return sendResponse(res, 404, false, 'Appointment not found', null);
        }
        
        return sendResponse(res, 200, true, 'Messages fetched successfully', messages);
    } catch (error) {
        console.error('Error fetching appointment messages:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};

/**
 * Create a new message for an appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createMessage = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { text } = req.body;
        
        // Validate input
        if (!appointmentId) {
            return sendResponse(res, 400, false, 'Appointment ID is required', null);
        }
        
        if (!text) {
            return sendResponse(res, 400, false, 'Message text is required', null);
        }
        
        // Determine sender based on user role
        const sender = req.user.role === 'coach' ? 'coach' : 'user';
        
        const message = await Message.createMessage(appointmentId, { text, sender });
        
        if (!message) {
            return sendResponse(res, 404, false, 'Appointment not found or message creation failed', null);
        }
        
        return sendResponse(res, 201, true, 'Message created successfully', message);
    } catch (error) {
        console.error('Error creating message:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};

/**
 * Mark messages as read for an appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const markMessagesAsRead = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userRole = req.user.role;
        
        // Validate input
        if (!appointmentId) {
            return sendResponse(res, 400, false, 'Appointment ID is required', null);
        }
        
        // Determine reader type
        const reader = userRole === 'coach' ? 'coach' : 'user';
        
        const result = await Message.markAsRead(appointmentId, reader);
        
        return sendResponse(res, 200, true, `Marked ${result.count} messages as read`, result);
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};

/**
 * Get unread message counts for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUnreadMessageCounts = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Determine user type
        const userType = userRole === 'coach' ? 'coach' : 'user';
        
        const counts = await Message.getUnreadCounts(userId, userType);
        
        return sendResponse(res, 200, true, 'Unread counts fetched successfully', counts);
    } catch (error) {
        console.error('Error getting unread message counts:', error);
        return sendResponse(res, 500, false, 'Internal server error', null);
    }
};
