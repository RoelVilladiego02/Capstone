import { api } from './api';

export const inventoryService = {
  // Get all inventory items
  getAllItems: () => api.get('/inventory'),
  
  // Get single inventory item
  getItem: (id) => api.get(`/inventory/${id}`),
  
  // Create new inventory item
  createItem: (itemData) => api.post('/inventory', itemData),
  
  // Update inventory item
  updateItem: (id, itemData) => api.put(`/inventory/${id}`, itemData),
  
  // Delete inventory item
  deleteItem: (id) => api.delete(`/inventory/${id}`),
  
  // Get low stock items (items below threshold)
  getLowStockItems: () => api.get('/inventory/low-stock'),
  
  // Get inventory analytics
  getAnalytics: () => api.get('/inventory/analytics'),
  
  // Get usage trends
  getUsageTrends: (period = 'monthly') => api.get(`/inventory/usage-trends?period=${period}`)
}; 