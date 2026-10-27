import apiClient from './apiClient';

export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getCoordinatorStats: () => apiClient.get('/dashboard/programme-coordinator'),
  getRegistrarSummary: () => apiClient.get('/dashboard/registrar'),
  getFinanceSummary: () => apiClient.get('/dashboard/finance'),
  getAdminSummary: () => apiClient.get('/dashboard/admin'),
};

export default dashboardApi;
