const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Utility function to get auth headers
const getAuthHeaders = () => {
    // Tìm token từ cả localStorage và sessionStorage
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Create a new quit plan
export const createQuitPlan = async (planData) => {
    try {
        console.log('🚀 Creating quit plan:', planData);

        const response = await fetch(`${API_BASE_URL}/api/quit-plans`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(planData)
        });

        const data = await response.json();

        if (!response.ok) {
            // Nếu lỗi 401 (Unauthorized), có thể token hết hạn
            if (response.status === 401) {
                console.warn('⚠️ Token không hợp lệ hoặc đã hết hạn. Lưu kế hoạch locally.');
                throw new Error('Token không hợp lệ. Vui lòng đăng nhập lại.');
            }
            throw new Error(data.message || 'Failed to create quit plan');
        }

        console.log('✅ Quit plan created successfully:', data);
        return data.data || data;
    } catch (error) {
        console.error('❌ Error creating quit plan:', error);
        throw error;
    }
};

// Get all quit plans for the current user
export const getUserPlans = async () => {
    try {
        console.log('🚀 Fetching user quit plans...');

        const response = await fetch(`${API_BASE_URL}/api/quit-plans/user`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch quit plans');
        }

        console.log('✅ User quit plans fetched:', data);
        // Backend trả về { success: true, message: "...", data: [...] }
        // Cần trả về data.data thay vì data
        return data.data || data;
    } catch (error) {
        console.error('❌ Error fetching user plans:', error);
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
    updateQuitPlan,
    deletePlan
};
