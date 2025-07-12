import { api } from './api';

export const userService = {
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/users${query ? `?${query}` : ''}`);
  },
  
  getDoctors: () => {
    return api.get('/doctors');
  },
  
  getPatients: () => {
    return api.get('/users?role=Patient');
  },
  
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  
  deactivateUser: (id) => api.put(`/users/${id}`, { status: 'Inactive' }),
}; 