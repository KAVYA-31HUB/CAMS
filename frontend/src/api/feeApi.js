import apiClient from './apiClient';

export const feeApi = {
  payFee: (dto) => apiClient.post('/fees/pay', dto),
  initiateFee: (applicantId, amount, mode) =>
    apiClient.post(`/fees/initiate?applicantId=${applicantId}&amount=${amount}&mode=${mode}`),
  getAllPayments: () => apiClient.get('/fees'),
  getPaymentById: (id) => apiClient.get(`/fees/${id}`),
  getApplicantPayments: (applicantId) => apiClient.get(`/fees/applicant/${applicantId}`),
  getReceipt: (id) => apiClient.get(`/fees/receipt/${id}`),
  getOutstanding: (applicantId) => apiClient.get(`/fees/outstanding/${applicantId}`),
};
