import { api } from './api';

export const medicalRecordService = {
  // Get all medical records
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/medical-records${queryString ? `?${queryString}` : ''}`);
    
    // Transform the response to include proper patient name
    if (Array.isArray(response)) {
      return response.map(record => ({
        ...record,
        patient_name: record.patient?.user?.name || 
                     `${record.patient?.first_name || ''} ${record.patient?.last_name || ''}`.trim() ||
                     'Unknown'
      }));
    }
    return response;
  },

  // Get medical record by ID
  getById: async (id) => {
    return await api.get(`/medical-records/${id}`);
  },

  // Get medical records by patient ID
  getByPatientId: async (patientId) => {
    return await api.get(`/medical-records?patient_id=${patientId}`);
  },

  // Get medical records by doctor ID
  getByDoctorId: async (doctorId) => {
    return await api.get(`/medical-records?doctor_id=${doctorId}`);
  },

  // Create new medical record
  create: async (data) => {
    return await api.post('/medical-records', data);
  },

  // Create medical record from session
  createFromSession: async (data) => {
    return await api.post('/medical-records/session', data);
  },

  // Update medical record
  update: async (id, data) => {
    return await api.put(`/medical-records/${id}`, data);
  },

  // Update medical record from session
  updateFromSession: async (id, data) => {
    return await api.put(`/medical-records/${id}/session`, data);
  },

  // Delete medical record
  delete: async (id) => {
    return await api.delete(`/medical-records/${id}`);
  }
}; 