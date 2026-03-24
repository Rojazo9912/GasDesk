import api from './api';

export interface Notification {
  id: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  tipo: string;
  creadaEn: string;
}

const notificationsService = {
  getAll: () => api.get<Notification[]>('/notifications').then(r => r.data),

  markRead: (id: string) => api.patch(`/notifications/${id}/read`).then(r => r.data),

  markAllRead: () => api.patch('/notifications/read-all').then(r => r.data),
};

export default notificationsService;
