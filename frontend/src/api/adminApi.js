import apiClient from './apiClient';

export const adminApi = {
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  getUserStats: () => apiClient.get('/admin/users/stats'),
  getUserDetails: (id) => apiClient.get(`/admin/users/${id}`),
  createUser: (data) => apiClient.post('/admin/users', data),
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  toggleUserStatus: (id, isActive) => apiClient.patch(`/admin/users/${id}/status?isActive=${isActive}`),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getAuditLogs: () => apiClient.get('/admin/audit-logs'),
  getSystemHealth: () => apiClient.get('/admin/system-health'),
};
