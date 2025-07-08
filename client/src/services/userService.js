const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Helper function to make authenticated requests
const authFetch = async (url, options = {}) => {
    const token = getAuthToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const defaultHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    return fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });
};

// User Profile APIs
export const userAPI = {
    // Get user profile
    getProfile: async () => {
        try {
            const response = await authFetch(`${API_BASE_URL}/users/profile`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await authFetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },

    // Upload avatar
    uploadAvatar: async (file) => {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const token = getAuthToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/users/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to upload avatar');
            }

            return await response.json();
        } catch (error) {
            console.error('Upload avatar error:', error);
            throw error;
        }
    },

    // Get smoking status
    getSmokingStatus: async () => {
        try {
            const response = await authFetch(`${API_BASE_URL}/users/smoking-status`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch smoking status');
            }

            return await response.json();
        } catch (error) {
            console.error('Get smoking status error:', error);
            throw error;
        }
    },

    // Update smoking status
    updateSmokingStatus: async (statusData) => {
        try {
            const response = await authFetch(`${API_BASE_URL}/users/smoking-status`, {
                method: 'PUT',
                body: JSON.stringify(statusData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update smoking status');
            }

            return await response.json();
        } catch (error) {
            console.error('Update smoking status error:', error);
            throw error;
        }
    },

    // Delete user account
    deleteAccount: async (password) => {
        try {
            if (!password) {
                throw new Error('Password is required to delete account');
            }

            const response = await authFetch(`${API_BASE_URL}/users/account`, {
                method: 'DELETE',
                body: JSON.stringify({ password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete account');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete account error:', error);
            throw error;
        }
    }
};

export default userAPI;
