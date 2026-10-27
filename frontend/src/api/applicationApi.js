import apiClient from './apiClient';

export const applicationApi = {
  submitApplication: (applicantId, programmeId, preferenceRank) =>
    apiClient.post(`/applications?applicantId=${applicantId}&programmeId=${programmeId}&preferenceRank=${preferenceRank}`),
  submitMultiStep: (dto) => apiClient.post('/applications/multi-step', dto),
  getAllApplications: () => apiClient.get('/applications'),
  getApplicationById: (id) => apiClient.get(`/applications/${id}`),
  getByApplicant: (applicantId) => apiClient.get(`/applications/applicant/${applicantId}`),
  updateStatus: (id, status) => apiClient.put(`/applications/${id}/status?status=${status}`),
  getMeritList: (programmeId, category) =>
    apiClient.get(`/applications/merit-list/${programmeId}${category ? `?category=${category}` : ''}`),
  getDetailedMeritList: (programmeId, category) =>
    apiClient.get(`/applications/detailed-merit/${programmeId}${category ? `?category=${category}` : ''}`),
  getStatusTimeline: (identifier) => apiClient.get(`/applications/status/${identifier}`),
  getAdmissionSchedule: () => apiClient.get('/admissions/schedule'),
};
