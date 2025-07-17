// Utility function to get current user ID consistently across the app
export const getCurrentUserId = () => {
    // Priority order: auth system keys -> legacy keys -> user object fields -> null
    let userId = localStorage.getItem('user_id') || localStorage.getItem('userId');
    
    if (!userId) {
        // Check nosmoke_user first (main auth system)
        const userStr = localStorage.getItem('nosmoke_user') || localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                userId = user.id || user.smoker_id || user.user_id;
            } catch (e) {
                console.warn('Error parsing user data from localStorage:', e);
            }
        }
    }
    
    // Try sessionStorage as backup
    if (!userId) {
        userId = sessionStorage.getItem('user_id') || sessionStorage.getItem('userId');
        
        if (!userId) {
            const userStr = sessionStorage.getItem('nosmoke_user') || sessionStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    userId = user.id || user.smoker_id || user.user_id;
                } catch (e) {
                    console.warn('Error parsing user data from sessionStorage:', e);
                }
            }
        }
    }
    
    return userId || null;
};

// Check if user is logged in
export const isUserLoggedIn = () => {
    const userId = getCurrentUserId();
    const token = getAuthToken();
    
    return !!(userId && token);
};

// Get user info object
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user') || 
                   localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.warn('Error parsing user data:', e);
        }
    }
    
    return null;
};

// Get current auth token consistently across the app
export const getAuthToken = () => {
    return localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token') ||
           localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
};

// Fallback for development/testing - should not be used in production
export const getDevelopmentUserId = () => {
    console.warn('🚨 Using development fallback user ID. This should not happen in production!');
    console.warn('🚨 Please ensure user is properly logged in.');
    return '13';
};

export default {
    getCurrentUserId,
    isUserLoggedIn,
    getCurrentUser,
    getAuthToken,
    getDevelopmentUserId
};
