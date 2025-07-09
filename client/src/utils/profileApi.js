/**
 * User Profile API service
 */
import api from './api';

/**
 * Get user profile
 * @returns {Promise<Object>} API response with user profile data
 */
export const getProfile = async () => {
  try {
    const options = api.addAuthHeader({
      method: 'GET'
    });
    
    const response = await api.fetch('/api/users/profile', options);
    
    // Update user data in localStorage if successful
    if (response.success && response.data) {
      // Format and update user in localStorage
      const currentUser = JSON.parse(localStorage.getItem('nosmoke_user') || '{}');
      const userData = formatUserData(response.data);
      
      localStorage.setItem('nosmoke_user', JSON.stringify({
        ...userData,
        token: currentUser.token
      }));
    }
    
    return response;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to get profile' 
    };
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} API response with updated user data
 */
export const updateProfile = async (profileData) => {
  try {
    const options = api.addAuthHeader({
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    
    const response = await api.fetch('/api/users/profile', options);
    
    // Update user data in localStorage if successful
    if (response.success && response.data) {
      // Format and update user in localStorage
      const currentUser = JSON.parse(localStorage.getItem('nosmoke_user') || '{}');
      const userData = formatUserData(response.data);
      
      localStorage.setItem('nosmoke_user', JSON.stringify({
        ...userData,
        token: currentUser.token
      }));
    }
    
    return response;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to update profile' 
    };
  }
};

/**
 * Upload user avatar
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} API response with avatar URL
 */
export const uploadAvatar = async (file) => {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('avatar', file);
    
    const token = api.getAuthToken();
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
      credentials: 'include'
    };
    
    const response = await api.fetch('/api/users/avatar', options);
    
    // Update avatar in localStorage if successful
    if (response.success && response.data?.avatarUrl) {
      const currentUser = JSON.parse(localStorage.getItem('nosmoke_user') || '{}');
      currentUser.avatar = response.data.avatarUrl;
      localStorage.setItem('nosmoke_user', JSON.stringify(currentUser));
    }
    
    return response;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to upload avatar' 
    };
  }
};

/**
 * Get user smoking status
 * @returns {Promise<Object>} API response with smoking status data
 */
export const getSmokingStatus = async () => {
  try {
    const options = api.addAuthHeader({
      method: 'GET'
    });
    
    const response = await api.fetch('/api/users/smoking-status', options);
    return response;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to get smoking status' 
    };
  }
};

/**
 * Update user smoking status
 * @param {Object} statusData - Smoking status data to update
 * @returns {Promise<Object>} API response with updated smoking status
 */
export const updateSmokingStatus = async (statusData) => {
  try {
    const options = api.addAuthHeader({
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
    
    const response = await api.fetch('/api/users/smoking-status', options);
    return response;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to update smoking status' 
    };
  }
};

/**
 * Delete user account
 * @returns {Promise<Object>} API response
 */
export const deleteAccount = async () => {
  try {
    const options = api.addAuthHeader({
      method: 'DELETE'
    });
    
    const response = await api.fetch('/api/users/account', options);
    
    // Clear localStorage on account deletion
    if (response.success) {
      localStorage.removeItem('nosmoke_token');
      localStorage.removeItem('nosmoke_refresh_token');
      localStorage.removeItem('nosmoke_user');
    }
    
    return response;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to delete account' 
    };
  }
};

/**
 * Format user data from API for frontend use
 * @param {Object} user - User data from API
 * @returns {Object} Formatted user data
 */
const formatUserData = (user) => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.full_name || user.username,
    username: user.username,
    avatar: user.profile_image,
    role: user.role || 'user',
    emailVerified: user.email_verified,
    membership: user.membership || 'free',
    membershipType: user.membership || 'free',
    phone: user.phone,
    dateOfBirth: user.date_of_birth,
    gender: user.gender,
    age: user.age,
    address: user.address,
    quitReason: user.quit_reason
  };
};

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  getSmokingStatus,
  updateSmokingStatus,
  deleteAccount
};
