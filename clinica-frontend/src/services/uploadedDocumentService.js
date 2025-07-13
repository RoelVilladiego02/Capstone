import { api } from './api';

const uploadedDocumentService = {
  getMyDocuments: () => api.get('/uploaded-documents'),
  upload: (formData) => api.post('/uploaded-documents', formData),
  delete: (id) => api.delete(`/uploaded-documents/${id}`),
  getAll: () => api.get('/admin/uploaded-documents'), // admin/staff
};

export default uploadedDocumentService; 