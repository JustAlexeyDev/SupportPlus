import api from './api';

export const userService = {
  async getProfile() {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async updateProfile(updateData) {
    try {
      const response = await api.patch('/users/profile', updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getPreferences() {
    try {
      const response = await api.get('/users/preferences/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async updatePreferences(preferencesData) {
    try {
      const response = await api.patch('/users/preferences/me', preferencesData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async exportToPdf() {
    try {
      const response = await api.get('/users/export/pdf');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};


