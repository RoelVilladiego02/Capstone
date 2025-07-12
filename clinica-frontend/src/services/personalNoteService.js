import { api } from './api';

const personalNoteService = {
  getMyNotes: () => api.get('/personal-notes'),
  create: (data) => api.post('/personal-notes', data),
  update: (id, data) => api.put(`/personal-notes/${id}`, data),
  delete: (id) => api.delete(`/personal-notes/${id}`),
};

export default personalNoteService; 