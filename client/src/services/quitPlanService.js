// API calls for quit plan management
const API_URL = import.meta.env.VITE_API_URL;

export const getQuitPlanTemplates = async (cigarettesPerDay) => {
    try {
        const response = await fetch(`${API_URL}/api/quit-plans/templates?cigarettesPerDay=${cigarettesPerDay}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.data;
    } catch (error) {
        console.error('Error fetching quit plan templates:', error);
        throw error;
    }
};

export const createQuitPlan = async (planData, token) => {
    try {
        const response = await fetch(`${API_URL}/api/quit-plans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(planData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.data;
    } catch (error) {
        console.error('Error creating quit plan:', error);
        throw error;
    }
};

export const getUserPlans = async (token) => {
    try {
        const response = await fetch(`${API_URL}/api/quit-plans/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.data;
    } catch (error) {
        console.error('Error fetching user plans:', error);
        throw error;
    }
};

export const updateQuitPlan = async (planId, updateData, token) => {
    try {
        const response = await fetch(`${API_URL}/api/quit-plans/${planId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.data;
    } catch (error) {
        console.error('Error updating quit plan:', error);
        throw error;
    }
};

export const deleteQuitPlan = async (planId, token) => {
    try {
        const response = await fetch(`${API_URL}/api/quit-plans/${planId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.data;
    } catch (error) {
        console.error('Error deleting quit plan:', error);
        throw error;
    }
};
