import { api } from './api';

export const patientService = {
  // Get all patients
  getPatients: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/patients${query ? `?${query}` : ''}`);
  },

  // Get a single patient by ID
  getPatient: (id) => {
    if (!id) {
      throw new Error('Patient ID is required');
    }
    return api.get(`/patients/${id}`);
  },

  // Get current user's patient profile
  getMyProfile: async () => {
    try {
      console.log('Calling getMyProfile API');
      const response = await api.get('/patients/me');
      console.log('getMyProfile API response:', response);
      
      // Validate the response structure
      if (!response) {
        throw new Error('No response received from /patients/me');
      }
      
      // Check if we have a patient_id
      if (!response.patient_id && !response.patient?.id) {
        throw new Error('Patient ID not found in response');
      }
      
      return response;
    } catch (error) {
      console.error('Error in getMyProfile:', error);
      throw error;
    }
  },

  // Create a new patient
  createPatient: (data) => api.post('/patients', data),

  // Update a patient by ID
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),

  // Delete a patient by ID
  deletePatient: (id) => api.delete(`/patients/${id}`)
}; 