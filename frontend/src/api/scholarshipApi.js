import apiClient from './apiClient';

export const scholarshipApi = {
  apply: (dto) => apiClient.post('/scholarships/apply', dto),
  getQueue: () => apiClient.get('/scholarships/queue'),
  getAll: () => apiClient.get('/scholarships'),
  getByApplicant: (applicantId) => apiClient.get(`/scholarships/applicant/${applicantId}`),
  getById: (id) => apiClient.get(`/scholarships/${id}`),
  review: (id, dto) => apiClient.put(`/scholarships/${id}/review`, dto),
};
