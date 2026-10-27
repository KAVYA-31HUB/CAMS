import apiClient from './apiClient';

export const applicantApi = {
  getMyApplicant: () => apiClient.get('/applicants/me'),
  getCurrentProfile: () => apiClient.get('/applicants/me'),
  getApplicantById: (id) => apiClient.get(`/applicants/${id}`),
  getById: (id) => apiClient.get(`/applicants/${id}`),
  getAllApplicants: () => apiClient.get('/applicants'),
  updateApplicant: (id, data) => apiClient.put(`/applicants/${id}`, data),
};
