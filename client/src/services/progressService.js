// Progress API service for frontend
const API_URL = 'http://localhost:5000';

// POST /api/progress/checkin - Create daily checkin
export const createProgressCheckin = async (checkinData, token) => {
    try {
        console.log('📊 Creating progress checkin:', checkinData);

        // Validation
        if (!checkinData.date) {
            throw new Error('Date is required');
        }
        if (checkinData.targetCigarettes === undefined || checkinData.targetCigarettes < 0) {
            throw new Error('Target cigarettes must be a non-negative number');
        }
        if (checkinData.actualCigarettes === undefined || checkinData.actualCigarettes < 0) {
            throw new Error('Actual cigarettes must be a non-negative number');
        }

        const response = await fetch(`${API_URL}/api/progress/checkin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                date: checkinData.date,
                targetCigarettes: parseInt(checkinData.targetCigarettes),
                actualCigarettes: parseInt(checkinData.actualCigarettes),
                notes: checkinData.notes || '',
                moodRating: checkinData.moodRating || null,
                energyLevel: checkinData.energyLevel || null,
                stressLevel: checkinData.stressLevel || null
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create checkin');
        }

        console.log('✅ Checkin created successfully:', data.data);
        return data.data;
    } catch (error) {
        console.error('❌ Error creating checkin:', error);
        throw error;
    }
};

// GET /api/progress/user - Get all user progress
export const getUserProgress = async (token, filters = {}) => {
    try {
        const params = new URLSearchParams();

        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.limit) params.append('limit', filters.limit);

        const url = `${API_URL}/api/progress/user${params.toString() ? '?' + params.toString() : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to get user progress');
        }

        console.log(`✅ Retrieved ${data.data.length} progress entries`);
        return data.data;
    } catch (error) {
        console.error('❌ Error getting user progress:', error);
        throw error;
    }
};

// GET /api/progress/user/:date - Get checkin for specific date
export const getCheckinByDate = async (date, token) => {
    try {
        const response = await fetch(`${API_URL}/api/progress/user/${date}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 404) {
                return null; // No checkin for this date
            }
            throw new Error(data.message || 'Failed to get checkin');
        }

        console.log(`✅ Retrieved checkin for ${date}`);
        return data.data;
    } catch (error) {
        console.error('❌ Error getting checkin by date:', error);
        throw error;
    }
};

// PUT /api/progress/checkin/:date - Update checkin
export const updateProgressCheckin = async (date, updateData, token) => {
    try {
        console.log(`📝 Updating checkin for ${date}:`, updateData);

        const response = await fetch(`${API_URL}/api/progress/checkin/${date}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update checkin');
        }

        console.log('✅ Checkin updated successfully:', data.data);
        return data.data;
    } catch (error) {
        console.error('❌ Error updating checkin:', error);
        throw error;
    }
};

// DELETE /api/progress/checkin/:date - Delete checkin
export const deleteProgressCheckin = async (date, token) => {
    try {
        console.log(`🗑️ Deleting checkin for ${date}`);

        const response = await fetch(`${API_URL}/api/progress/checkin/${date}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete checkin');
        }

        console.log('✅ Checkin deleted successfully');
        return data.data;
    } catch (error) {
        console.error('❌ Error deleting checkin:', error);
        throw error;
    }
};

// GET /api/progress/stats - Get progress statistics
export const getProgressStats = async (token, days = 30) => {
    try {
        const response = await fetch(`${API_URL}/api/progress/stats?days=${days}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to get progress stats');
        }

        console.log(`✅ Retrieved progress stats for ${days} days`);
        return data.data;
    } catch (error) {
        console.error('❌ Error getting progress stats:', error);
        throw error;
    }
};

// GET /api/progress/chart-data - Get chart data
export const getProgressChartData = async (token, days = 30, type = 'cigarettes') => {
    try {
        const response = await fetch(`${API_URL}/api/progress/chart-data?days=${days}&type=${type}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to get chart data');
        }

        console.log(`✅ Retrieved chart data for ${days} days (${type})`);
        return data.data;
    } catch (error) {
        console.error('❌ Error getting chart data:', error);
        throw error;
    }
};

// Helper function to create or update checkin (smart upsert)
export const saveCheckin = async (checkinData, token) => {
    try {
        // First try to get existing checkin
        const existing = await getCheckinByDate(checkinData.date, token);

        if (existing) {
            // Update existing checkin
            return await updateProgressCheckin(checkinData.date, checkinData, token);
        } else {
            // Create new checkin
            return await createProgressCheckin(checkinData, token);
        }
    } catch (error) {
        console.error('❌ Error saving checkin:', error);
        throw error;
    }
};
