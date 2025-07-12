import { api } from './api';

export const patientService = {
  // Get all patients
  getPatients: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/patients${query ? `?${query}` : ''}`);
  },

  // Get a single patient by ID
  getPatient: (id) => api.get(`/patients/${id}`),

  // Get current user's patient profile
  getMyProfile: async () => {
    console.log('Calling getMyProfile API');
    const response = await api.get('/patients/me');
    console.log('getMyProfile API response:', response);
    return response;
  },

  // Create a new patient
  createPatient: (data) => api.post('/patients', data),

  // Update a patient by ID
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),

  // Delete a patient by ID
  deletePatient: (id) => api.delete(`/patients/${id}`)
}; 