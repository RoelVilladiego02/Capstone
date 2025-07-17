import { api } from './api';

export const doctorService = {
  // Get all doctors with user and branch relationships
  getDoctors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/doctors${query ? `?${query}` : ''}`);
  },

  // Get a single doctor by ID
  getDoctor: (id) => api.get(`/doctors/${id}`),

  // Get available doctors for a specific date and time
  getAvailableDoctors: async (date, time = null) => {
    const params = { date };
    if (time) params.time = time;
    const query = new URLSearchParams(params).toString();
    return api.get(`/doctors/available?${query}`);
  },

  // Get doctor's availability for a specific date
  getDoctorAvailability: async (doctorId, date) => {
    const params = { date };
    const query = new URLSearchParams(params).toString();
    return api.get(`/doctors/${doctorId}/availability?${query}`);
  },

  // Get doctors by branch
  getDoctorsByBranch: (branchId) => api.get(`/doctors?branch_id=${branchId}`),

  // Get doctors by specialization
  getDoctorsBySpecialization: (specialization) => api.get(`/doctors?specialization=${specialization}`),

  // Get currently consulting doctors
  getCurrentlyConsultingDoctors: () => api.get('/doctors?currently_consulting=true'),

  // Get available time slots for a doctor on a specific date
  getDoctorTimeSlots: async (doctorId, date) => {
    try {
      const doctor = await api.get(`/doctors/${doctorId}`);
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if doctor is available on this day
      if (!doctor.available_days || !doctor.available_days.includes(dayOfWeek)) {
        return [];
      }
      
      // Return available time slots
      return doctor.time_availability || [];
    } catch (error) {
      console.error('Error getting doctor time slots:', error);
      return [];
    }
  },

  // Check if doctor is available on a specific date and time
  isDoctorAvailable: async (doctorId, date, time) => {
    try {
      const doctor = await api.get(`/doctors/${doctorId}`);
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if doctor is available on this day
      if (!doctor.available_days || !doctor.available_days.includes(dayOfWeek)) {
        return false;
      }
      
      // Check if doctor is currently consulting
      if (doctor.currently_consulting) {
        return false;
      }
      
      // Check if time is within available hours
      if (doctor.time_availability && doctor.time_availability.length > 0) {
        return doctor.time_availability.some(slot => {
          if (typeof slot === 'string') {
            return slot === time;
          } else if (slot.start && slot.end) {
            return time >= slot.start && time <= slot.end;
          }
          return false;
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error checking doctor availability:', error);
      return false;
    }
  },

  // Get doctors filtered by weekday
  getDoctorsByWeekday: async (weekday) => {
    const doctors = await api.get('/doctors');
    return doctors.filter(doctor => 
      doctor.available_days && doctor.available_days.includes(weekday)
    );
  },

  // Create a new doctor
  createDoctor: (doctorData) => api.post('/doctors', doctorData),

  // Update doctor information
  updateDoctor: (id, data) => api.put(`/doctors/${id}`, data),

  // Delete a doctor
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),

  // Update doctor consultation status
  updateConsultationStatus: (id, isConsulting) => 
    api.put(`/doctors/${id}`, { currently_consulting: isConsulting }),
}; 