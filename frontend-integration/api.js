// API Service cho Frontend - api.js
class QuitSmokingAPI {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.token = this.getToken();
  }

  // Utility methods
  getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  setToken(token, remember = false) {
    if (remember) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    this.token = token;
  }

  removeToken() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.token = null;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token, credentials.rememberMe);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.removeToken();
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }

  // User methods
  async getUserDashboard() {
    return this.request('/users/dashboard');
  }

  async getUserStatistics() {
    return this.request('/users/statistics');
  }

  async updateQuitPlan(quitPlanData) {
    return this.request('/users/quit-plan', {
      method: 'PUT',
      body: JSON.stringify(quitPlanData)
    });
  }

  async completeMilestone(milestoneIndex) {
    return this.request(`/users/quit-plan/milestone/${milestoneIndex}/complete`, {
      method: 'POST'
    });
  }

  async updateSettings(settingsData) {
    return this.request('/users/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
  }

  // Check-in methods
  async createCheckin(checkinData) {
    return this.request('/checkins', {
      method: 'POST',
      body: JSON.stringify(checkinData)
    });
  }

  async getTodayCheckin() {
    return this.request('/checkins/today');
  }

  async getCheckinHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/checkins/history${queryString ? '?' + queryString : ''}`);
  }

  async getCheckinStatistics(period = '30') {
    return this.request(`/checkins/statistics?period=${period}`);
  }

  async getCheckinTrends(period = '30') {
    return this.request(`/checkins/trends?period=${period}`);
  }

  async updateCheckin(checkinId, checkinData) {
    return this.request(`/checkins/${checkinId}`, {
      method: 'PUT',
      body: JSON.stringify(checkinData)
    });
  }

  // Appointment methods
  async getAppointments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/appointments${queryString ? '?' + queryString : ''}`);
  }

  async createAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  }

  async getAppointment(appointmentId) {
    return this.request(`/appointments/${appointmentId}`);
  }

  async updateAppointment(appointmentId, appointmentData) {
    return this.request(`/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData)
    });
  }

  async cancelAppointment(appointmentId, reason) {
    return this.request(`/appointments/${appointmentId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason })
    });
  }

  async rateAppointment(appointmentId, ratingData) {
    return this.request(`/appointments/${appointmentId}/rating`, {
      method: 'POST',
      body: JSON.stringify(ratingData)
    });
  }

  async getUpcomingAppointments() {
    return this.request('/appointments/upcoming');
  }

  async getAppointmentStatistics() {
    return this.request('/appointments/statistics');
  }

  // Membership methods
  async getMembershipInfo() {
    return this.request('/membership');
  }

  async upgradeMembership(membershipData) {
    return this.request('/membership/upgrade', {
      method: 'POST',
      body: JSON.stringify(membershipData)
    });
  }

  // Utility methods for frontend
  isAuthenticated() {
    return !!this.token;
  }

  // Format error messages for display
  formatError(error) {
    if (error.errors && Array.isArray(error.errors)) {
      return error.errors.map(err => err.message).join(', ');
    }
    return error.message || 'Đã xảy ra lỗi không xác định';
  }
}

// Export for use in frontend
const api = new QuitSmokingAPI();

// For ES6 modules
export default api;

// For CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}

// For browser global
if (typeof window !== 'undefined') {
  window.QuitSmokingAPI = api;
}
