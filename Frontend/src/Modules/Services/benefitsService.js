import api from './api';

export const benefitsService = {
  async searchBenefits(searchParams) {
    try {
      const response = await api.get('/benefits/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async getMyBenefits() {
    try {
      const response = await api.get('/benefits/my-benefits');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async createBenefit(benefitData) {
    try {
      const response = await api.post('/benefits', benefitData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async createCommercialOffer(offerData) {
    try {
      const response = await api.post('/benefits/commercial-offers', offerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async seedBenefits() {
    try {
      const response = await api.post('/benefits/seed');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

