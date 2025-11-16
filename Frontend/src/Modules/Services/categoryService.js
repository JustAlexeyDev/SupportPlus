import api from './api';

export const categoryService = {
  // Get all beneficiary categories
  async getAllCategories() {
    try {
      const response = await api.get('/beneficiary-categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get category by ID
  async getCategoryById(id) {
    try {
      const response = await api.get(`/beneficiary-categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};








