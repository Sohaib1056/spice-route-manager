import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "https://spice-route-manager-production.up.railway.app/api";
const BASE_URL = API_URL.replace('/api', '');

const api = axios.create({
  baseURL: API_URL,
});

export { BASE_URL };

export const productStats = {
  getAll: async (force = false) => {
    try {
      const response = await api.get('/products', {
        params: { _t: Date.now() } // Cache busting for real-time updates
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`, {
        params: { _t: Date.now() } // Cache busting for real-time updates
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }
};

export const settingsApi = {
  get: async () => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }
};

export default api;
