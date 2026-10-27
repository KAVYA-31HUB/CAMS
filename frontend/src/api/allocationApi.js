import apiClient from './apiClient';

export const allocationApi = {
  runAllocation: (seatMatrixId) => apiClient.post(`/allocation/run/${seatMatrixId}`),
  runAllocationStats: (seatMatrixId) => apiClient.post(`/allocation/run-matrix/${seatMatrixId}`),
  runRoundAllocation: (roundNo, academicYear) =>
    apiClient.post('/allocation/run', { roundNo, academicYear }),
  getAllotmentResults: (round) => apiClient.get(`/allocation/results/${round}`),
  requestUpgrade: (applicationId) => apiClient.put(`/allocation/${applicationId}/upgrade`),
  confirmSeat: (applicationId) => apiClient.post(`/allocation/confirm/${applicationId}`),
  cancelSeat: (applicationId) => apiClient.delete(`/allocation/${applicationId}`),
  getWaitlist: (programmeId, quota) =>
    apiClient.get(`/allocation/waitlist/${programmeId}${quota ? `?quota=${quota}` : ''}`),
};
