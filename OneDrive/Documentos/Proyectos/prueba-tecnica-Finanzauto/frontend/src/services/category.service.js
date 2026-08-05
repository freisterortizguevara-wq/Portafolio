import api from './api';

export const categoryService = {
  async getAllCategories() {
    const response = await api.get('/categories');
    return response.data;
  },

  async getCategoryById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async getProductsByCategory(id) {
    const response = await api.get(`/categories/${id}/products`);
    return response.data;
  },

  async createCategory(data) {
    const response = await api.post('/categories', data);
    return response.data;
  },

  async updateCategory(id, data) {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id) {
    await api.delete(`/categories/${id}`);
  },
};