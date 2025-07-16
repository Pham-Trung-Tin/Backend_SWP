/**
 * Coach Service - API calls for coach functionality
 */
import api from '../utils/api';

/**
 * Get all coaches
 * @returns {Promise<Array>} List of coaches
 */
export const getAllCoaches = async () => {
  try {
    const response = await api.fetch('/api/coaches', api.addAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching coaches:', error);
    throw error;
  }
};

/**
 * Get coach by ID
 * @param {string|number} coachId - The ID of the coach
 * @returns {Promise<Object>} Coach data
 */
export const getCoachById = async (coachId) => {
  try {
    const response = await api.fetch(`/api/coaches/${coachId}`, api.addAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error fetching coach with ID ${coachId}:`, error);
    throw error;
  }
};

/**
 * Get coach availability
 * @param {string|number} coachId - The ID of the coach
 * @returns {Promise<Array>} Availability slots
 */
export const getCoachAvailability = async (coachId) => {
  try {
    const response = await api.fetch(`/api/coaches/${coachId}/availability`, api.addAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error fetching availability for coach ${coachId}:`, error);
    throw error;
  }
};

/**
 * Get coach reviews
 * @param {string|number} coachId - The ID of the coach
 * @returns {Promise<Array>} Reviews for the coach
 */
export const getCoachReviews = async (coachId) => {
  try {
    const response = await api.fetch(`/api/coaches/${coachId}/reviews`, api.addAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for coach ${coachId}:`, error);
    throw error;
  }
};

/**
 * Add feedback for a coach
 * @param {string|number} coachId - The ID of the coach
 * @param {Object} feedbackData - The feedback data (rating, comment, etc.)
 * @returns {Promise<Object>} Result of the operation
 */
export const addCoachFeedback = async (coachId, feedbackData) => {
  try {
    const options = api.addAuthHeader({
      method: 'POST',
      body: JSON.stringify(feedbackData)
    });
    
    const response = await api.fetch(`/api/coaches/${coachId}/feedback`, options);
    return response.data;
  } catch (error) {
    console.error(`Error adding feedback for coach ${coachId}:`, error);
    throw error;
  }
};

/**
 * Get coach messages for an appointment
 * @param {string|number} appointmentId - The ID of the appointment
 * @returns {Promise<Array>} Messages for the appointment
 */
export const getCoachMessages = async (appointmentId) => {
  try {
    const response = await api.fetch(`/api/appointments/${appointmentId}/messages`, api.addAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error fetching messages for appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Send a message to a coach for an appointment
 * @param {string|number} appointmentId - The ID of the appointment
 * @param {Object} messageData - The message data (text, etc.)
 * @returns {Promise<Object>} Result of the operation
 */
export const sendCoachMessage = async (appointmentId, messageData) => {
  try {
    const options = api.addAuthHeader({
      method: 'POST',
      body: JSON.stringify(messageData)
    });
    
    const response = await api.fetch(`/api/appointments/${appointmentId}/messages`, options);
    return response.data;
  } catch (error) {
    console.error(`Error sending message for appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Get unread message counts for a coach
 * @returns {Promise<Object>} Unread message counts per appointment
 */
export const getUnreadMessageCounts = async () => {
  try {
    const response = await api.fetch('/api/messages/unread-counts', api.addAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching unread message counts:', error);
    throw error;
  }
};

/**
 * Mark messages as read for an appointment
 * @param {string|number} appointmentId - The ID of the appointment
 * @returns {Promise<Object>} Result of the operation
 */
export const markMessagesAsRead = async (appointmentId) => {
  try {
    const options = api.addAuthHeader({
      method: 'POST'
    });
    
    const response = await api.fetch(`/api/appointments/${appointmentId}/messages/read`, options);
    return response.data;
  } catch (error) {
    console.error(`Error marking messages as read for appointment ${appointmentId}:`, error);
    throw error;
  }
};
