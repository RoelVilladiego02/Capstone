import { api } from './api';

export const appointmentService = {
  // Get all appointments or filter by params (e.g., patient_id, doctor_id, type, date)
  getAppointments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/appointments${query ? `?${query}` : ''}`);
  },

  // Get a single appointment by ID
  getAppointment: (id) => api.get(`/appointments/${id}`),

  // Create a new appointment
  createAppointment: (data) => api.post('/appointments', data),

  // Update an appointment by ID
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),

  // Delete an appointment by ID
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),

  // Check-in for an appointment
  checkIn: (id, data) => api.post(`/appointments/${id}/check-in`, data),

  // Check if a time slot is available
  checkAvailability: (date, time, doctorId = null) => {
    const params = { date, time };
    if (doctorId) params.doctor_id = doctorId;
    const query = new URLSearchParams(params).toString();
    const endpoint = `/appointments/check-availability?${query}`;
    console.log('Calling availability endpoint:', endpoint);
    return api.get(endpoint);
  },

  // Get doctor's appointments (optionally filter by date/type)
  getDoctorAppointments: (doctorId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/doctors/${doctorId}/appointments${query ? `?${query}` : ''}`);
  },

  // Get today's appointments for a doctor
  getTodaysDoctorAppointments: (doctorId) => api.get(`/doctors/${doctorId}/todays-appointments`),

  // Get upcoming teleconsultations for a doctor
  getUpcomingTeleconsultations: (doctorId) => api.get(`/doctors/${doctorId}/teleconsultations`),

  // Get appointments for a specific patient
  getPatientAppointments: (patientId, params = {}) => {
    const query = new URLSearchParams({ patient_id: patientId, ...params }).toString();
    return api.get(`/appointments?${query}`);
  },

  // Get appointments for a specific doctor
  getDoctorAppointmentsByDoctorId: (doctorId, params = {}) => {
    const query = new URLSearchParams({ doctor_id: doctorId, ...params }).toString();
    return api.get(`/appointments?${query}`);
  },

  // Get appointments by type
  getAppointmentsByType: (type, params = {}) => {
    const query = new URLSearchParams({ type, ...params }).toString();
    return api.get(`/appointments?${query}`);
  },

  // Get appointments by date
  getAppointmentsByDate: (date, params = {}) => {
    const query = new URLSearchParams({ date, ...params }).toString();
    return api.get(`/appointments?${query}`);
  }
};
