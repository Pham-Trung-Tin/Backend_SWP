/**
 * API integration functions for User Appointments
 * This file contains all API calls related to user appointments
 */

import api from './api.js';

/**
 * Get the auth token from multiple possible locations
 * @returns {string|null} The auth token or null
 */
const getAuthToken = () => {
  // Check multiple possible token storage locations
  return localStorage.getItem('nosmoke_token') || 
         sessionStorage.getItem('nosmoke_token') ||
         localStorage.getItem('token') ||
         sessionStorage.getItem('token') ||
         localStorage.getItem('authToken') ||
         null;
};

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Created appointment
 */
export const createAppointment = async (appointmentData) => {
  try {
    console.log('📅 Creating appointment:', appointmentData);
    
    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      console.error('❌ No authentication token found. Please login first.');
      throw new Error('Not authenticated. Please login first.');
    }
    
    console.log('🔑 Found token for authentication:', token.substring(0, 20) + '...');
    
    const options = api.addAuthHeader({
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
    
    console.log('📤 Sending request to /api/appointments');
    const response = await api.fetch('/api/appointments', options);
    console.log('✅ Appointment created successfully');
    return response;
  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    throw error;
  }
};

/**
 * Get all appointments for the authenticated user
 * @returns {Promise<Array>} User appointments
 */
export const getUserAppointments = async () => {
  try {
    console.log('📋 Fetching user appointments...');
    
    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      console.error('❌ No authentication token found. Please login first.');
      throw new Error('Not authenticated. Please login first.');
    }
    
    console.log('🔑 Found token for authentication:', token.substring(0, 20) + '...');
    
    const response = await api.fetch('/api/appointments/user', api.addAuthHeader());
    console.log(`✅ Found ${response?.data?.length || 0} appointments`);
    return response;
  } catch (error) {
    console.error('❌ Error fetching user appointments:', error);
    throw error;
  }
};

/**
 * Get a specific appointment by ID
 * @param {string|number} appointmentId - The ID of the appointment
 * @returns {Promise<Object>} Appointment details
 */
export const getAppointmentById = async (appointmentId) => {
  try {
    console.log(`📋 Fetching appointment ${appointmentId}...`);
    
    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      console.error('❌ No authentication token found. Please login first.');
      throw new Error('Not authenticated. Please login first.');
    }
    
    console.log('🔑 Found token for authentication:', token.substring(0, 20) + '...');
    
    const response = await api.fetch(`/api/appointments/${appointmentId}`, api.addAuthHeader());
    return response;
  } catch (error) {
    console.error(`❌ Error fetching appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Update an appointment
 * @param {string|number} appointmentId - The ID of the appointment
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated appointment
 */
export const updateAppointment = async (appointmentId, updateData) => {
  try {
    console.log(`📝 Updating appointment ${appointmentId}:`, updateData);
    
    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      console.error('❌ No authentication token found. Please login first.');
      throw new Error('Not authenticated. Please login first.');
    }
    
    console.log('🔑 Found token for authentication:', token.substring(0, 20) + '...');
    
    const options = api.addAuthHeader({
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    
    const response = await api.fetch(`/api/appointments/${appointmentId}`, options);
    console.log('✅ Appointment updated successfully');
    return response;
  } catch (error) {
    console.error(`❌ Error updating appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Cancel an appointment
 * @param {string|number} appointmentId - The ID of the appointment
 * @param {string} cancelReason - Reason for cancellation
 * @returns {Promise<Object>} Cancelled appointment
 */
export const cancelAppointment = async (appointmentId, cancelReason = 'User cancelled') => {
  try {
    console.log(`❌ Cancelling appointment ${appointmentId}:`, cancelReason);
    
    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      console.error('❌ No authentication token found. Please login first.');
      throw new Error('Not authenticated. Please login first.');
    }
    
    console.log('🔑 Found token for authentication:', token.substring(0, 20) + '...');
    
    const options = api.addAuthHeader({
      method: 'PUT',
      body: JSON.stringify({ cancel_reason: cancelReason })
    });
    
    const response = await api.fetch(`/api/appointments/${appointmentId}/cancel`, options);
    console.log('✅ Appointment cancelled successfully');
    return response;
  } catch (error) {
    console.error(`❌ Error cancelling appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Delete an appointment
 * @param {string|number} appointmentId - The ID of the appointment
 * @returns {Promise<Object>} Deletion result
 */
export const deleteAppointment = async (appointmentId) => {
  try {
    console.log(`🗑️ Deleting appointment ${appointmentId}...`);
    
    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      console.error('❌ No authentication token found. Please login first.');
      throw new Error('Not authenticated. Please login first.');
    }
    
    console.log('🔑 Found token for authentication:', token.substring(0, 20) + '...');
    
    const options = api.addAuthHeader({
      method: 'DELETE'
    });
    
    const response = await api.fetch(`/api/appointments/${appointmentId}`, options);
    console.log('✅ Appointment deleted successfully');
    return response;
  } catch (error) {
    console.error(`❌ Error deleting appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Rate an appointment
 * @param {string|number} appointmentId - The ID of the appointment
 * @param {Object} ratingData - Rating and feedback data
 * @returns {Promise<Object>} Rating result
 */
export const rateAppointment = async (appointmentId, ratingData) => {
  try {
    console.log(`⭐ Rating appointment ${appointmentId}:`, ratingData);
    
    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      console.error('❌ No authentication token found. Please login first.');
      throw new Error('Not authenticated. Please login first.');
    }
    
    console.log('🔑 Found token for authentication:', token.substring(0, 20) + '...');
    
    const options = api.addAuthHeader({
      method: 'POST',
      body: JSON.stringify(ratingData)
    });
    
    const response = await api.fetch(`/api/appointments/${appointmentId}/rate`, options);
    console.log('✅ Appointment rated successfully');
    return response;
  } catch (error) {
    console.error(`❌ Error rating appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Get messages for a specific appointment
 * @param {string|number} appointmentId - The ID of the appointment
 * @returns {Promise<Array>} Messages for the appointment
 */
export const getAppointmentMessages = async (appointmentId) => {
  try {
    const response = await api.fetch(`/api/appointments/${appointmentId}/messages`, api.addAuthHeader());
    return response;
  } catch (error) {
    console.error(`Error fetching messages for appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Send a message for a specific appointment
 * @param {string|number} appointmentId - The ID of the appointment
 * @param {Object} messageData - The message data
 * @returns {Promise<Object>} The created message
 */
export const sendAppointmentMessage = async (appointmentId, messageData) => {
  try {
    const options = api.addAuthHeader({
      method: 'POST',
      body: JSON.stringify(messageData)
    });
    
    const response = await api.fetch(`/api/appointments/${appointmentId}/messages`, options);
    return response;
  } catch (error) {
    console.error(`Error sending message for appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Mark messages as read for a specific appointment
 * @param {string|number} appointmentId - The ID of the appointment
 * @returns {Promise<Object>} Result of the operation
 */
export const markMessagesAsRead = async (appointmentId) => {
  try {
    const options = api.addAuthHeader({
      method: 'POST'
    });
    
    const response = await api.fetch(`/api/appointments/${appointmentId}/messages/read`, options);
    return response;
  } catch (error) {
    console.error(`Error marking messages as read for appointment ${appointmentId}:`, error);
    throw error;
  }
};

/**
 * Get unread message counts for all appointments
 * @returns {Promise<Object>} Unread message counts per appointment
 */
export const getUnreadMessageCounts = async () => {
  try {
    const response = await api.fetch('/api/messages/unread-counts', api.addAuthHeader());
    return response;
  } catch (error) {
    console.error('Error fetching unread message counts:', error);
    throw error;
  }
};

/**
 * Update appointment status
 * @param {string|number} appointmentId - The ID of the appointment
 * @param {string} status - The new status
 * @returns {Promise<Object>} Updated appointment
 */
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const options = api.addAuthHeader({
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    
    const response = await api.fetch(`/api/appointments/${appointmentId}/status`, options);
    return response;
  } catch (error) {
    console.error(`Error updating status for appointment ${appointmentId}:`, error);
    throw error;
  }
};
