import api from './api';
import Cookies from 'js-cookie';

export const authService = {
  // Login with email and PIN code
  async login(email, pinCode) {
    try {
      const response = await api.post('/auth/login', {
        email,
        pinCode,
      });
      
      if (response.data.access_token) {
        // Store token in cookie
        Cookies.set('access_token', response.data.access_token, { expires: 7 });
        return response.data;
      }
      throw new Error('No access token received');
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/users', {
        email: userData.email,
        pinCode: userData.pinCode,
        snils: userData.snils,
        region: userData.region,
        beneficiaryCategoryIds: userData.beneficiaryCategoryIds,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout
  logout() {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!Cookies.get('access_token');
  },

  // Get current token
  getToken() {
    return Cookies.get('access_token');
  },

  // Google OAuth login
  initiateGoogleLogin() {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/auth/google`;
  },
};

