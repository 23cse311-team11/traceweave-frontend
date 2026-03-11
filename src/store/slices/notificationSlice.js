import { notificationApi } from '@/api/notification.api';

export const createNotificationSlice = (set, get) => ({
  notifications: [],
  unreadCount: 0,
  isNotificationsLoading: false,

  fetchNotifications: async () => {
    set({ isNotificationsLoading: true });
    try {
      const data = await notificationApi.getNotifications();
      set({ 
        notifications: data,
        unreadCount: data.filter(n => !n.isRead).length,
        isNotificationsLoading: false 
      });
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      set({ isNotificationsLoading: false });
    }
  },

  addRealtimeNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  markNotificationRead: async (id) => {
    set(state => {
      const updated = state.notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      );
      return { 
        notifications: updated,
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    });
    try {
      await notificationApi.markAsRead(id);
    } catch (err) {
      console.warn("Failed to sync read status", err);
    }
  },

  markAllNotificationsRead: async () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0
    }));
    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.warn("Failed to sync read-all status", err);
    }
  }
});