import api from './api';
import Cookies from 'js-cookie';

// Получение базового URL API (используем ту же логику, что и в api.js)
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  if (process.env.NODE_ENV === 'development') {
    const hostname = window.location.hostname;
    
    // 0.0.0.0 не валиден для браузера, используем localhost
    if (hostname === '0.0.0.0' || !hostname || hostname === '') {
      return 'http://localhost:8000';
    }
    
    // Проверяем, что это валидный IP адрес (не 0.0.0.0)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return `http://${hostname}:8000`;
      }
    }
    return 'http://localhost:8000';
  }
  
  return process.env.REACT_APP_API_URL || 'http://localhost:8000';
};

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
    const apiBaseUrl = getApiBaseUrl();
    window.location.href = `${apiBaseUrl}/auth/google`;
  },

  async requestSmsCode(phone) {
    try {
      const response = await api.post('/auth/phone/request-sms', {
        phone,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async verifySmsCode(phone, code) {
    try {
      const response = await api.post('/auth/phone/verify-sms', {
        phone,
        code,
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

  async loginWithUsername(username, password) {
    try {
      const response = await api.post('/auth/login/username', {
        username,
        password,
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
};




