/**
 * Authentication API service
 */
import api from './api';

/**
 * Register a new user
 * @param {Object} userData - User data for registration
 * @returns {Promise<Object>} API response
 */
export const register = async (userData) => {
  try {
    const response = await api.fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    // Save token to localStorage if registration is successful
    if (response.success && response.data?.token) {
      localStorage.setItem('nosmoke_token', response.data.token);
      
      // Format user data for frontend use
      const formattedUser = formatUserData(response.data.user);
      
      // Save user data to localStorage
      localStorage.setItem('nosmoke_user', JSON.stringify({
        ...formattedUser,
        token: response.data.token
      }));
    }
    
    return response;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Registration failed' 
    };
  }
};

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} API response
 */
export const login = async (email, password) => {
  try {
    console.log('authApi.login - Starting login request for:', email);
    
    // Construct the full API URL for debugging
    const baseUrl = window.location.origin;
    const apiUrl = '/api/auth/login';
    console.log(`authApi.login - API URL: ${baseUrl}${apiUrl}`);
    
    // Make the login request
    const response = await api.fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    console.log('authApi.login - Response received:', response);
    
    // Save token to localStorage if login is successful
    if (response.success && response.data?.token) {
      console.log('authApi.login - Login successful, saving token and user data');
      localStorage.setItem('nosmoke_token', response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem('nosmoke_refresh_token', response.data.refreshToken);
      }
      
      // Format user data for frontend use
      const formattedUser = formatUserData(response.data.user);
      console.log('authApi.login - Formatted user data:', formattedUser);
      
      // Save user data to localStorage
      localStorage.setItem('nosmoke_user', JSON.stringify({
        ...formattedUser,
        token: response.data.token
      }));
    } else {
      console.log('authApi.login - Login unsuccessful or missing token:', response);
    }
    
    return response;
  } catch (error) {
    console.error('authApi.login - Error during login:', error);
    return { 
      success: false, 
      message: error.message || 'Login failed' 
    };
  }
};

/**
 * Get current user profile
 * @returns {Promise<Object>} API response with user data
 */
export const getProfile = async () => {
  try {
    const options = api.addAuthHeader({
      method: 'GET'
    });
    
    const response = await api.fetch('/api/auth/profile', options);
    
    // Update user data in localStorage if successful
    if (response.success && response.data) {
      // Format and update user in localStorage
      const currentUser = JSON.parse(localStorage.getItem('nosmoke_user') || '{}');
      const formattedUser = formatUserData(response.data);
      
      localStorage.setItem('nosmoke_user', JSON.stringify({
        ...formattedUser,
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
 * Logout the current user
 * @returns {Promise<Object>} API response
 */
export const logout = async () => {
  try {
    const options = api.addAuthHeader({
      method: 'POST'
    });
    
    // Call logout API
    await api.fetch('/api/auth/logout', options).catch(err => {
      // Ignore errors on logout endpoint
      console.log('Logout API Error:', err);
    });
    
    // Always clear local storage regardless of API response
    localStorage.removeItem('nosmoke_token');
    localStorage.removeItem('nosmoke_refresh_token');
    localStorage.removeItem('nosmoke_user');
    
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    // Always clear local storage even on errors
    localStorage.removeItem('nosmoke_token');
    localStorage.removeItem('nosmoke_refresh_token');
    localStorage.removeItem('nosmoke_user');
    
    return { success: true, message: 'Logged out successfully' };
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} API response
 */
export const forgotPassword = async (email) => {
  try {
    const response = await api.fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    return response;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to request password reset' 
    };
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} API response
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    
    return response;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to reset password' 
    };
  }
};

/**
 * Change password when logged in
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} API response
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const options = api.addAuthHeader({
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    const response = await api.fetch('/api/auth/change-password', options);
    return response;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to change password' 
    };
  }
};

/**
 * Verify email with verification code
 * @param {string} email - Email to verify
 * @param {string} verificationCode - Verification code
 * @returns {Promise<Object>} API response
 */
export const verifyEmail = async (email, verificationCode) => {
  try {
    const response = await api.fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, verificationCode })
    });
    
    return response;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to verify email' 
    };
  }
};

/**
 * Resend verification email
 * @param {string} email - Email to resend verification to
 * @returns {Promise<Object>} API response
 */
export const resendVerification = async (email) => {
  try {
    const response = await api.fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    return response;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to resend verification' 
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
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerification
};
