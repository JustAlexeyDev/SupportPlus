import api from './api';
import Cookies from 'js-cookie';

export const authService = {
  async login(email, pinCode) {
    try {
      const response = await api.post('/auth/login', {
        email,
        pinCode,
      });
      
      if (response.data.access_token) {
        Cookies.set('access_token', response.data.access_token, { expires: 7 });
        return response.data;
      }
      throw new Error('No access token received');
    } catch (error) {
      throw error.response?.data || error;
    }
  },

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

  logout() {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  },

  isAuthenticated() {
    return !!Cookies.get('access_token');
  },

  getToken() {
    return Cookies.get('access_token');
  },

  initiateGoogleLogin() {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/auth/google`;
  },
};


