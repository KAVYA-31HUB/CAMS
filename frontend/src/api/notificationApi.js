import apiClient from './apiClient';

export const notificationApi = {
  getMyNotifications: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  broadcast: (data) => apiClient.post('/notifications/broadcast', data),
};
