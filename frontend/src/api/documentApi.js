import apiClient from './apiClient';

export const documentApi = {
  uploadDocument: (dto) => apiClient.post('/documents/upload', dto),
  getApplicantDocuments: (applicantId) => apiClient.get(`/documents/applicant/${applicantId}`),
  getPendingDocuments: () => apiClient.get('/documents/pending'),
  getAllDocuments: () => apiClient.get('/documents'),
  getDocumentById: (id) => apiClient.get(`/documents/${id}`),
  verifyDocument: (id, dto) => apiClient.put(`/documents/${id}/verify`, dto),
  importDigiLocker: (applicantId, documentType) =>
    apiClient.post('/documents/digilocker/import', { applicantId, documentType }),
};
