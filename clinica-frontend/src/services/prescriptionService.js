import { api } from './api';

export const prescriptionService = {
  // Get all prescriptions (for doctors)
  getAll: async () => {
    return await api.get('/prescriptions');
  },

  // Get prescriptions for a specific patient
  getByPatient: async (patientId) => {
    return await api.get(`/prescriptions?patient_id=${patientId}`);
  },

  // Get prescriptions by a specific doctor
  getByDoctor: async (doctorId) => {
    return await api.get(`/prescriptions?doctor_id=${doctorId}`);
  },

  // Get a single prescription by ID
  getById: async (id) => {
    return await api.get(`/prescriptions/${id}`);
  },

  // Create a new prescription
  create: async (prescriptionData) => {
    return await api.post('/prescriptions', prescriptionData);
  },

  // Update an existing prescription
  update: async (id, prescriptionData) => {
    return await api.put(`/prescriptions/${id}`, prescriptionData);
  },

  // Delete a prescription
  delete: async (id) => {
    return await api.delete(`/prescriptions/${id}`);
  },

  // Request a prescription refill
  requestRefill: async (id) => {
    return await api.post(`/prescriptions/${id}/refill`);
  }
}; 