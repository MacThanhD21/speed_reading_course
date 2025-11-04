/**
 * API Service - Centralized service for all backend API calls
 * 
 * API URL is configured via environment variable VITE_API_URL
 * For production: Set VITE_API_URL in your environment
 * For development: Uses relative path /api which is proxied by Vite
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    // Log API base URL in development for debugging
    if (import.meta.env.DEV) {
      console.log('🔗 API Base URL:', this.baseURL);
    }
  }

  // Helper để thực hiện request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Thêm token nếu có
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        // For 401 errors, preserve the full error message
        const errorMessage = data.message || data.error || `HTTP ${response.status}`;
        const apiError = new Error(errorMessage);
        apiError.status = response.status;
        apiError.response = data;
        throw apiError;
      }

      return data;
    } catch (error) {
      // Check if it's a network error (fetch failed, no response)
      if (!error.status && (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError'))) {
        // Network error - no response received
        const networkError = new Error('Network error: ' + error.message);
        networkError.status = 0; // Use 0 to indicate network error
        networkError.isNetworkError = true;
        throw networkError;
      }

      // Enhanced error logging for debugging
      if (error.message && !error.message.includes('Failed to fetch')) {
        console.error('API Error:', {
          url,
          message: error.message,
          status: error.status,
          baseURL: this.baseURL,
        });
      }
      
      // Re-throw with original error properties
      throw error;
    }
  }

  // Auth APIs
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async googleLogin(credential) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getRecentRegistrations(limit = 10) {
    return this.request(`/auth/recent-registrations?limit=${limit}`);
  }

  async getRecentContacts(limit = 10) {
    return this.request(`/contacts/recent?limit=${limit}`);
  }

  // Contact APIs
  async createContact(contactData) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  // Admin APIs
  async getDashboardStats() {
    return this.request('/admin/dashboard');
  }

  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/users${queryString ? `?${queryString}` : ''}`);
  }

  async createUser(userData) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getContacts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/contacts${queryString ? `?${queryString}` : ''}`);
  }

  async updateContact(contactId, contactData) {
    return this.request(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  async deleteContact(contactId) {
    return this.request(`/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  // SmartRead APIs
  async createReadingSession(sessionData) {
    return this.request('/smartread/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async saveQuizResult(quizData) {
    return this.request('/smartread/quiz-results', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  async getReadingHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/smartread/sessions${queryString ? `?${queryString}` : ''}`);
  }

  async getReadingSession(sessionId) {
    return this.request(`/smartread/sessions/${sessionId}`);
  }

  async getUserStats() {
    return this.request('/smartread/stats');
  }

  // SmartRead - AI Quiz
  async generateQuiz(payload) {
    return this.request('/smartread/generate-quiz', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // SmartRead - 5W1H
  async generateFiveWOneH(payload) {
    return this.request('/smartread/fivewoneh', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // SmartRead - Reading Tips
  async generateReadingTips(payload) {
    return this.request('/smartread/reading-tips', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // SmartRead - Comprehensive Learning (Concepts, Statistics, Preview Questions)
  async generateComprehensiveLearning(payload) {
    return this.request('/smartread/comprehensive-learning', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // SmartRead - Evaluate Essay Answers (5W1H)
  async evaluateEssayAnswers(payload) {
    return this.request('/smartread/evaluate-essay', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Admin SmartRead APIs
  async getUsersWithSmartReadStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/smartread/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUserReadingSessions(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/smartread/users/${userId}/sessions${queryString ? `?${queryString}` : ''}`);
  }

  // API Keys management APIs
  async getApiKeys() {
    return this.request('/admin/api-keys');
  }

  async getApiKey(apiKeyId) {
    return this.request(`/admin/api-keys/${apiKeyId}`);
  }

  async createApiKey(apiKeyData) {
    return this.request('/admin/api-keys', {
      method: 'POST',
      body: JSON.stringify(apiKeyData),
    });
  }

  async updateApiKey(apiKeyId, apiKeyData) {
    return this.request(`/admin/api-keys/${apiKeyId}`, {
      method: 'PUT',
      body: JSON.stringify(apiKeyData),
    });
  }

  async deleteApiKey(apiKeyId) {
    return this.request(`/admin/api-keys/${apiKeyId}`, {
      method: 'DELETE',
    });
  }

  async testApiKey(apiKeyId) {
    return this.request(`/admin/api-keys/${apiKeyId}/test`, {
      method: 'POST',
    });
  }

  async testAllApiKeys() {
    return this.request('/admin/api-keys/test-all', {
      method: 'POST',
    });
  }

  // Testimonials APIs (Public)
  async getTestimonials() {
    return this.request('/testimonials');
  }

  // Testimonials User APIs (Authenticated)
  async createTestimonial(testimonialData) {
    return this.request('/testimonials', {
      method: 'POST',
      body: JSON.stringify(testimonialData),
    });
  }

  async getMyTestimonial() {
    return this.request('/testimonials/my-testimonial');
  }

  async updateMyTestimonial(testimonialData) {
    return this.request('/testimonials/my-testimonial', {
      method: 'PUT',
      body: JSON.stringify(testimonialData),
    });
  }

  // Testimonials Admin APIs
  async getAdminTestimonials(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/testimonials${queryString ? `?${queryString}` : ''}`);
  }

  async getTestimonial(testimonialId) {
    return this.request(`/admin/testimonials/${testimonialId}`);
  }

  async createAdminTestimonial(testimonialData) {
    return this.request('/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify(testimonialData),
    });
  }

  async updateAdminTestimonial(testimonialId, testimonialData) {
    return this.request(`/admin/testimonials/${testimonialId}`, {
      method: 'PUT',
      body: JSON.stringify(testimonialData),
    });
  }

  async deleteTestimonial(testimonialId) {
    return this.request(`/admin/testimonials/${testimonialId}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();

