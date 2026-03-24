import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import notificationsService, { Notification } from '../services/notifications.service';

const WS_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3000';

export function useNotifications(token: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  // Cargar notificaciones iniciales
  const loadNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationsService.getAll();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.leida).length);
    } catch {
      // silencioso
    }
  }, [token]);

  // Conectar WebSocket
  useEffect(() => {
    if (!token) return;

    loadNotifications();

    const socket = io(`${WS_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('notification', (notif: Notification) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const markRead = useCallback(async (id: string) => {
    await notificationsService.markRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsService.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, markRead, markAllRead, reload: loadNotifications };
}
