import api from './api';

export const productService = {
  async getProducts(params = {}) {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      throw error;
    }
  },

  async createProduct(data) {
    try {
      const response = await api.post('/products', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  async updateProduct(id, data) {
    try {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar producto ${id}:`, error);
      throw error;
    }
  },

  async deleteProduct(id) {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      console.error(`Error al eliminar producto ${id}:`, error);
      throw error;
    }
  },

  // ✅ CARGA MASIVA - FUNCIONANDO
  async bulkCreateProducts(quantity, categoryId) {
    try {
      console.log('📦 Enviando carga masiva...', { quantity, categoryId });
      const payload = {
        quantity: Number(quantity),
        categoryId: categoryId ? Number(categoryId) : undefined
      };
      const response = await api.post('/products/bulk', payload);
      console.log('✅ Respuesta bulk:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en bulk:', error);
      console.error('Detalles:', error.response?.data);
      throw error;
    }
  },

  async updateStock(id, quantity) {
    try {
      const response = await api.patch(`/products/${id}/stock`, quantity);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar stock ${id}:`, error);
      throw error;
    }
  },

  async searchProducts(term) {
    try {
      const response = await api.get('/products/search', { params: { term } });
      return response.data;
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw error;
    }
  },
};