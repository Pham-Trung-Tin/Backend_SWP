// API calls for quit plan management
const API_URL = 'http://localhost:5000';

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
        console.log('=== DEBUG: Creating quit plan ===');
        console.log('1. API URL:', `${API_URL}/api/quit-plans`);
        console.log('2. Original plan data:', JSON.stringify(planData, null, 2));

        // Enhanced validation
        if (!planData.planName || planData.planName.trim() === '') {
            throw new Error('Plan name is required and cannot be empty');
        }
        if (!planData.startDate) {
            throw new Error('Start date is required');
        }
        if (!planData.initialCigarettes || isNaN(planData.initialCigarettes) || planData.initialCigarettes <= 0) {
            throw new Error('Initial cigarettes must be a positive number');
        }
        if (!planData.totalWeeks || isNaN(planData.totalWeeks) || planData.totalWeeks <= 0) {
            throw new Error('Total weeks must be a positive number');
        }

        // Ensure weeks is an array and validate structure
        let weeksArray = Array.isArray(planData.weeks) ? planData.weeks : [];

        // If weeks is empty, create a default structure
        if (weeksArray.length === 0) {
            console.log('3. Generating default weeks array');
            weeksArray = Array.from({ length: planData.totalWeeks }, (_, i) => ({
                week: i + 1,
                target: Math.max(0, Math.round(planData.initialCigarettes * (1 - ((i + 1) / planData.totalWeeks))))
            }));
        } else {
            // Validate existing weeks structure
            for (let i = 0; i < weeksArray.length; i++) {
                const week = weeksArray[i];
                if (!week.week || isNaN(week.week)) {
                    throw new Error(`Invalid week number at position ${i + 1}`);
                }
                if (week.target === undefined || isNaN(week.target)) {
                    throw new Error(`Invalid target value at week ${week.week}`);
                }
            }
        }

        // Create the request payload with proper field mapping
        const requestPayload = {
            planName: planData.planName.trim(),
            startDate: planData.startDate,
            initialCigarettes: parseInt(planData.initialCigarettes),
            strategy: planData.strategy || planData.planType || 'gradual',
            goal: planData.goal || planData.motivation || 'health',
            weeks: weeksArray,
            totalWeeks: parseInt(planData.totalWeeks)
        };

        console.log('3. Final request payload:', JSON.stringify(requestPayload, null, 2));

        // Log token info without exposing the full token
        console.log('4. Using token (first 10 chars):', token ? token.substring(0, 10) + '...' : 'No token provided');

        if (!token || token.trim() === '') {
            throw new Error('No authentication token provided');
        }

        console.log('5. Making request...');
        const response = await fetch(`${API_URL}/api/quit-plans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.trim()}`
            },
            body: JSON.stringify(requestPayload)
        });

        console.log('6. Response status:', response.status);
        console.log('7. Response ok:', response.ok);

        const data = await response.json();
        console.log('8. Response data:', data);

        if (!response.ok) {
            console.error('9. Request failed with status:', response.status);
            console.error('10. Error details:', data);

            // Provide more specific error messages based on status code
            let errorMessage = data.message || 'Failed to create quit plan';

            if (response.status === 400) {
                errorMessage = `Dữ liệu không hợp lệ: ${data.message || 'Vui lòng kiểm tra lại thông tin'}`;
            } else if (response.status === 401) {
                errorMessage = 'Bạn cần đăng nhập để thực hiện thao tác này';
            } else if (response.status === 409) {
                errorMessage = 'Bạn đã có kế hoạch cai thuốc. Vui lòng xóa kế hoạch hiện tại trước khi tạo mới';
            } else if (response.status === 500) {
                errorMessage = 'Lỗi server. Vui lòng thử lại sau';
            }

            throw new Error(errorMessage);
        }

        console.log('11. SUCCESS - Plan created:', data.data);
        return data.data;

    } catch (error) {
        console.error('Error creating quit plan:', error);

        // Re-throw with enhanced error message
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
        }

        throw error;
    }
};

export const getUserPlans = async (token) => {
    try {
        console.log('=== DEBUG: Getting user plans ===');
        console.log('1. API URL:', `${API_URL}/api/quit-plans/user`);
        console.log('2. Using token (first 10 chars):', token ? token.substring(0, 10) + '...' : 'No token provided');

        if (!token || token.trim() === '') {
            throw new Error('No authentication token provided');
        }

        const response = await fetch(`${API_URL}/api/quit-plans/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.trim()}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('3. Response status:', response.status);
        console.log('4. Response ok:', response.ok);

        const data = await response.json();
        console.log('5. Response data:', data);

        if (!response.ok) {
            let errorMessage = data.message || 'Failed to fetch user plans';

            if (response.status === 401) {
                errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
            } else if (response.status === 404) {
                errorMessage = 'Không tìm thấy kế hoạch cai thuốc';
            } else if (response.status === 500) {
                errorMessage = 'Lỗi server. Vui lòng thử lại sau';
            }

            throw new Error(errorMessage);
        }

        console.log('6. SUCCESS - Plans fetched:', data.data);
        return data.data;
    } catch (error) {
        console.error('Error fetching user plans:', error);

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
        }

        throw error;
    }
};

export const updateQuitPlan = async (planId, planData, token) => {
    try {
        console.log('=== DEBUG: Updating quit plan ===');
        console.log('1. Plan ID:', planId);
        console.log('2. Original plan data:', JSON.stringify(planData, null, 2));

        // Enhanced validation
        if (!planData.planName || planData.planName.trim() === '') {
            throw new Error('Plan name is required and cannot be empty');
        }
        if (!planData.initialCigarettes || isNaN(planData.initialCigarettes) || planData.initialCigarettes <= 0) {
            throw new Error('Initial cigarettes must be a positive number');
        }
        if (!planData.totalWeeks || isNaN(planData.totalWeeks) || planData.totalWeeks <= 0) {
            throw new Error('Total weeks must be a positive number');
        }

        // Ensure weeks array is properly formatted
        const formattedWeeks = planData.weeks.map((week, index) => ({
            week: index + 1,
            target: week.target || week.amount || 0,
            reduction: week.reduction || 0,
            phase: week.phase || 'unknown'
        }));

        // Convert frontend field names to match backend expectations exactly
        const backendPlanData = {
            planName: planData.planName.trim(),
            initialCigarettes: parseInt(planData.initialCigarettes),
            strategy: planData.strategy || 'gradual',
            goal: planData.goal || 'health',
            weeks: formattedWeeks,
            totalWeeks: parseInt(planData.totalWeeks)
        };

        console.log('Transformed plan data for backend:', backendPlanData);

        const response = await fetch(`${API_URL}/api/quit-plans/${planId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(backendPlanData)
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
        console.log('Deleting plan with ID:', planId, 'using token:', token);
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

// Using the same function for both deleteQuitPlan and deletePlan
export const deletePlan = async (planId, token) => {
    return deleteQuitPlan(planId, token);
};

// Get a specific quit plan by ID
export const getQuitPlan = async (planId, token) => {
    try {
        console.log('Getting plan with ID:', planId);
        const response = await fetch(`${API_URL}/api/quit-plans/${planId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data.data;
    } catch (error) {
        console.error('Error fetching quit plan:', error);
        throw error;
    }
};

// Get plan templates - alias for getQuitPlanTemplates
export const getPlanTemplates = async (cigarettesPerDay) => {
    return getQuitPlanTemplates(cigarettesPerDay);
};