import { api } from './api';

export const auditLogService = {
  getLogs: (params = {}) => {
    // Build query string from params
    const query = new URLSearchParams(params).toString();
    return api.get(`/audit-logs${query ? `?${query}` : ''}`);
  }
}; 