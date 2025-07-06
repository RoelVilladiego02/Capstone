import { api } from './api';

export const orderService = {
  // Get all orders
  getAllOrders: () => api.get('/orders'),
  
  // Get single order
  getOrder: (id) => api.get(`/orders/${id}`),
  
  // Create new order
  createOrder: (orderData) => api.post('/orders', orderData),
  
  // Update order
  updateOrder: (id, orderData) => api.put(`/orders/${id}`, orderData),
  
  // Delete order
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  
  // Get pending orders
  getPendingOrders: () => api.get('/orders?status=pending'),
  
  // Get orders by status
  getOrdersByStatus: (status) => api.get(`/orders?status=${status}`),
  
  // Approve order
  approveOrder: (id) => api.put(`/orders/${id}/approve`),
  
  // Get order analytics
  getOrderAnalytics: () => api.get('/orders/analytics')
}; 