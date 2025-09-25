// API Client for ECOBIN Smart Bin Monitoring System

class ECOBINAPI {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('ecobin_token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('ecobin_token', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('ecobin_token');
    }

    // Make HTTP request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(username, password) {
        const response = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (response.token) {
            this.setToken(response.token);
        }
        
        return response;
    }

    async register(userData) {
        return await this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getCurrentUser() {
        return await this.request('/api/auth/me');
    }

    async changePassword(currentPassword, newPassword) {
        return await this.request('/api/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    // Activity methods
    async getActivities(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/api/activities${queryString ? `?${queryString}` : ''}`;
        return await this.request(endpoint);
    }

    async getActivity(id) {
        return await this.request(`/api/activities/${id}`);
    }

    async createActivity(activityData) {
        return await this.request('/api/activities', {
            method: 'POST',
            body: JSON.stringify(activityData)
        });
    }

    async updateActivity(id, activityData) {
        return await this.request(`/api/activities/${id}`, {
            method: 'PUT',
            body: JSON.stringify(activityData)
        });
    }

    async deleteActivity(id) {
        return await this.request(`/api/activities/${id}`, {
            method: 'DELETE'
        });
    }

    async getActivityStats() {
        return await this.request('/api/activities/stats/overview');
    }

    // Notification methods
    async getNotifications(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/api/notifications${queryString ? `?${queryString}` : ''}`;
        return await this.request(endpoint);
    }

    async getNotification(id) {
        return await this.request(`/api/notifications/${id}`);
    }

    async createNotification(notificationData) {
        return await this.request('/api/notifications', {
            method: 'POST',
            body: JSON.stringify(notificationData)
        });
    }

    async markNotificationAsRead(id) {
        return await this.request(`/api/notifications/${id}/read`, {
            method: 'PUT'
        });
    }

    async markAllNotificationsAsRead() {
        return await this.request('/api/notifications/mark-all-read', {
            method: 'PUT'
        });
    }

    async deleteNotification(id) {
        return await this.request(`/api/notifications/${id}`, {
            method: 'DELETE'
        });
    }

    async getUnreadNotificationCount() {
        const response = await this.request('/api/notifications/count/unread');
        return response.count;
    }

    // User methods
    async getUsers() {
        return await this.request('/api/users');
    }

    async getUser(id) {
        return await this.request(`/api/users/${id}`);
    }
}

// Create global API instance
window.ecobinAPI = new ECOBINAPI();
