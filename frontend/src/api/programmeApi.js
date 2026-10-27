import apiClient from './apiClient';

export const programmeApi = {
  getProgrammes: () => apiClient.get('/programmes'),
  getActiveProgrammes: () => apiClient.get('/programmes/active'),
  getProgrammeById: (id) => apiClient.get(`/programmes/${id}`),
  createProgramme: (data) => apiClient.post('/programmes', data),
  updateProgramme: (id, data) => apiClient.put(`/programmes/${id}`, data),
  updateMeritFormula: (id, formulaJson) => apiClient.put(`/programmes/${id}/merit-formula`, { meritFormula: formulaJson }),
  deleteProgramme: (id) => apiClient.delete(`/programmes/${id}`),
};
