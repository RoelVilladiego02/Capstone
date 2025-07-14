import { api } from './api';

export const billingService = {
  // Get all bills (admin/receptionist only)
  getAllBills: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/billing${query ? `?${query}` : ''}`);
  },

  // Get a single bill by ID
  getBill: (id) => api.get(`/billing/${id}`),

  // Create a new bill
  createBill: async (billData) => {
    // billData should include status and payment_method
    return api.post('/billing', billData);
  },

  // Update a bill by ID
  updateBill: async (billId, updateData) => {
    return api.put(`/billing/${billId}`, updateData);
  },

  // Delete a bill by ID
  deleteBill: (id) => api.delete(`/billing/${id}`),

  // Get bills for a specific patient (admin/receptionist use)
  getBillsByPatient: (patientId, params = {}) => {
    const query = new URLSearchParams({ patient_id: patientId, ...params }).toString();
    return api.get(`/billing?${query}`);
  },

  // Get bills for the currently logged-in patient (secure endpoint)
  getMyBills: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/billing/my-bills${query ? `?${query}` : ''}`);
  },
};