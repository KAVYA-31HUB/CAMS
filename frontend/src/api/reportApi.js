import apiClient from './apiClient';

export const reportApi = {
  getDashboardStats: () => apiClient.get('/reports/dashboard'),
  getFunnelReport: () => apiClient.get('/reports/funnel'),
  getAisheReport: () => apiClient.get('/reports/aishe'),
  getUgcReport: () => apiClient.get('/reports/ugc'),
};
