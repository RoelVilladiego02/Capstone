import { api } from './api';

export const supplierService = {
  // Get all suppliers
  getAllSuppliers: () => api.get('/suppliers'),
  
  // Get single supplier
  getSupplier: (id) => api.get(`/suppliers/${id}`),
  
  // Create new supplier
  createSupplier: (supplierData) => api.post('/suppliers', supplierData),
  
  // Update supplier
  updateSupplier: (id, supplierData) => api.put(`/suppliers/${id}`, supplierData),
  
  // Delete supplier
  deleteSupplier: (id) => api.delete(`/suppliers/${id}`),
  
  // Get active suppliers
  getActiveSuppliers: () => api.get('/suppliers?status=active'),
  
  // Get suppliers by category
  getSuppliersByCategory: (category) => api.get(`/suppliers?category=${category}`)
}; 