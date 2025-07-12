import { api } from './api';

const correctionRequestService = {
  getMyRequests: () => api.get('/correction-requests'),
  create: (data) => api.post('/correction-requests', data),
  delete: (id) => api.delete(`/correction-requests/${id}`),
  update: (id, data) => api.put(`/correction-requests/${id}`, data),
  getAll: () => api.get('/admin/correction-requests'), // admin/staff
};

export default correctionRequestService; 