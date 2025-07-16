/**
 * This file contains integration points for the Coach Dashboard 
 * to interact with the backend API
 * 
 * Replace localStorage calls with API calls gradually
 */

import api from '../utils/api';

/**
 * Get dashboard statistics for a coach/user
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getCoachDashboardStats = async () => {
  try {
    const options = api.addAuthHeader({
      method: 'GET'
    });
    // Use appointments/user endpoint which now handles coach role automatically
    const response = await api.fetch('/api/appointments/user', options);
    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Get appointments for the authenticated user (works for both users and coaches)
 * @returns {Promise<Array>} User/Coach appointments
 */
export const getCoachAppointments = async () => {
  try {
    const options = api.addAuthHeader({
      method: 'GET'
    });
    const response = await api.fetch('/api/appointments/user', options);
    return response;
  } catch (error) {
    console.error('Error fetching appointments:', error);
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
    const options = api.addAuthHeader({
      method: 'GET'
    });
    const response = await api.fetch(`/api/appointments/${appointmentId}/messages`, options);
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
    const options = api.addAuthHeader({
      method: 'GET'
    });
    const response = await api.fetch('/api/messages/unread-counts', options);
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
    console.log(`🔄 Sending status update for appointment ${appointmentId} to: ${status}`);
    
    // Use the new endpoint that uses POST instead of PATCH to avoid CORS issues
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    
    // Try first with the new endpoint (chuẩn hóa về dạng số nhiều)
    const fullUrl = `${apiBaseUrl}/api/appointments-update/${appointmentId}/status`;
    
    console.log('🔗 Using new POST endpoint (plural):', fullUrl);
    
    // Get auth token
    const token = api.getAuthToken();
    
    // Use fetch directly for better control
    const response = await fetch(fullUrl, {
      method: 'POST',  // Use POST instead of PATCH
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ status }),
      mode: 'cors',
      credentials: 'include'
    });
    
    console.log('📡 Response status:', response.status, response.statusText);
    
    // If the new endpoint fails, try alternative endpoints
    if (response.status === 404) {
      console.log('⚠️ New plural endpoint not found, trying singular endpoint');
      const fallbackUrl1 = `${apiBaseUrl}/api/appointment-update/${appointmentId}/status`;
      
      try {
        console.log('🔄 Trying fallback #1:', fallbackUrl1);
        const fallback1Response = await fetch(fallbackUrl1, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ status }),
          mode: 'cors',
          credentials: 'include'
        });
        
        if (fallback1Response.ok) {
          const fallback1Data = await fallback1Response.json();
          console.log('✅ Status update successful (fallback #1):', fallback1Data);
          return fallback1Data;
        }
      } catch (fallback1Error) {
        console.log('❌ Fallback #1 failed:', fallback1Error.message);
      }
      
      console.log('⚠️ Trying original PATCH endpoint as last resort');
      const fallbackUrl = `${apiBaseUrl}/api/appointments/${appointmentId}/status`;
      
      const fallbackResponse = await fetch(fallbackUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ status }),
        mode: 'cors',
        credentials: 'include'
      });
      
      if (!fallbackResponse.ok) {
        let errorText;
        try {
          const errorData = await fallbackResponse.json();
          errorText = errorData.message || errorData.error || `HTTP error ${fallbackResponse.status}`;
        } catch (e) {
          errorText = `HTTP error ${fallbackResponse.status}: ${fallbackResponse.statusText}`;
        }
        throw new Error(errorText);
      }
      
      const fallbackData = await fallbackResponse.json();
      console.log('✅ Status update successful (fallback):', fallbackData);
      return fallbackData;
    }
    
    if (!response.ok) {
      // Handle HTTP errors
      let errorText;
      try {
        const errorData = await response.json();
        errorText = errorData.message || errorData.error || `HTTP error ${response.status}`;
      } catch (e) {
        errorText = `HTTP error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorText);
    }
    
    // Parse JSON response
    const data = await response.json();
    console.log('✅ Status update successful:', data);
    return data;
  } catch (error) {
    console.error(`❌ Error updating status for appointment ${appointmentId}:`, error);
    // Log detailed error info
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      appointmentId,
      status
    });
    throw error;
  }
};
