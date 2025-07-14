import { logDebug } from '../utils/debugHelpers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Utility function to get auth headers
const getAuthHeaders = () => {
    // Tìm token từ cả localStorage và sessionStorage với đúng key
    const token = localStorage.getItem('nosmoke_token') || 
                 sessionStorage.getItem('nosmoke_token') ||
                 localStorage.getItem('auth_token') || 
                 sessionStorage.getItem('auth_token');
    
    if (!token) {
        throw new Error('Access token is required');
    }
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Create a new quit plan
export const createQuitPlan = async (planData) => {
    try {
        logDebug('QuitPlan', '🚀 Creating quit plan in database', planData);

        const response = await fetch(`${API_BASE_URL}/api/quit-plans`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(planData)
        });

        const data = await response.json();

        if (!response.ok) {
            // Nếu lỗi 401 (Unauthorized), có thể token hết hạn
            if (response.status === 401) {
                logDebug('QuitPlan', '⚠️ Token không hợp lệ hoặc đã hết hạn. Yêu cầu đăng nhập lại.', null, true);
                throw new Error('Token không hợp lệ. Vui lòng đăng nhập lại để lưu kế hoạch.');
            }
            throw new Error(data.message || 'Failed to create quit plan');
        }

        logDebug('QuitPlan', '✅ Quit plan created successfully in database', data);
        return data.data || data;
    } catch (error) {
        logDebug('QuitPlan', '❌ Error creating quit plan in database', error, true);
        throw error;
    }
};

// Get all quit plans for the current user
export const getUserPlans = async () => {
    try {
        logDebug('QuitPlan', '🚀 Fetching user quit plans from database...');

        const response = await fetch(`${API_BASE_URL}/api/quit-plans/user`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch quit plans');
        }

        logDebug('QuitPlan', '✅ User quit plans fetched from database', data);
        // Backend trả về { success: true, message: "...", data: [...] }
        const plansData = data.data || data;
        
        if (plansData.length > 0) {
            logDebug('QuitPlan', `✅ Tìm thấy ${plansData.length} kế hoạch trong database`);
        } else {
            logDebug('QuitPlan', 'ℹ️ Không tìm thấy kế hoạch nào trong database', null, true); // Force print này
        }
        
        return plansData;
    } catch (error) {
        console.error('❌ Error fetching user plans from database:', error);
        throw error;
    }
};

// Get a specific quit plan by ID
export const getQuitPlan = async (planId) => {
    try {
        console.log('🚀 Fetching quit plan by ID:', planId);

        const response = await fetch(`${API_BASE_URL}/api/quit-plans/${planId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch quit plan');
        }

        console.log('✅ Quit plan fetched:', data);
        return data.data || data;
    } catch (error) {
        console.error('❌ Error fetching quit plan:', error);
        throw error;
    }
};

// Get user's active quit plan
export const getUserActivePlan = async () => {
    try {
        console.log('🚀 Fetching user active quit plan from database...');

        const response = await fetch(`${API_BASE_URL}/api/quit-plans/active`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 404) {
                // Không có kế hoạch active là một tình huống bình thường
                console.log('ℹ️ User has no active quit plan');
                return { success: false, message: 'No active plan found' };
            }
            throw new Error(data.message || 'Failed to fetch active quit plan');
        }

        console.log('✅ User active quit plan fetched:', data);
        
        // Process data to ensure proper structure
        const planData = data.data || data;
        
        // Ensure weeks data is properly parsed if it's a string
        if (planData.weeks && typeof planData.weeks === 'string') {
            try {
                planData.weeks = JSON.parse(planData.weeks);
            } catch (e) {
                console.error('Error parsing weeks data:', e);
            }
        }
        
        return { 
            success: true,
            plan: planData,
            message: 'Active plan retrieved successfully'
        };
    } catch (error) {
        console.error('❌ Error fetching active quit plan:', error);
        return { success: false, message: error.message };
    }
};

// Update a quit plan
export const updateQuitPlan = async (planId, updateData) => {
    try {
        console.log('🚀 Updating quit plan:', planId, updateData);

        const response = await fetch(`${API_BASE_URL}/api/quit-plans/${planId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update quit plan');
        }

        console.log('✅ Quit plan updated successfully:', data);
        return data.data || data;
    } catch (error) {
        console.error('❌ Error updating quit plan:', error);
        throw error;
    }
};

// Delete a quit plan
export const deletePlan = async (planId) => {
    try {
        console.log('🚀 Deleting quit plan:', planId);

        const response = await fetch(`${API_BASE_URL}/api/quit-plans/${planId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete quit plan');
        }

        console.log('✅ Quit plan deleted successfully:', data);
        return data.data || data;
    } catch (error) {
        console.error('❌ Error deleting quit plan:', error);
        throw error;
    }
};

export default {
    createQuitPlan,
    getUserPlans,
    getQuitPlan,
    getUserActivePlan,
    updateQuitPlan,
    deletePlan
};
