import { useState, useEffect } from "react";

export interface NotificationItem {
  id: string;
  title: string;
  project: string;
  time: string;
  unread: boolean;
}

const initialNotifications: NotificationItem[] = [
  { id: "1", title: "The township replied to your comment", project: "Hilltop Park Expansion", time: "2h ago", unread: true },
  { id: "2", title: "New stage: Public Comment Period is open", project: "Hilltop Park Expansion", time: "1d ago", unread: true },
  { id: "3", title: "A project you follow was updated", project: "Road Paving 2026", time: "3d ago", unread: false },
  { id: "4", title: "Comment period closing soon", project: "Township Ordinance Updates", time: "5d ago", unread: false },
];

let notifications = [...initialNotifications];
const listeners = new Set<() => void>();

export const notificationsStore = {
  getNotifications() {
    return notifications;
  },
  getUnreadCount() {
    return notifications.filter((n) => n.unread).length;
  },
  markAllAsRead() {
    notifications = notifications.map((n) => ({ ...n, unread: false }));
    this.notify();
  },
  markAsRead(id: string) {
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, unread: false } : n
    );
    this.notify();
  },
  markAsUnread(id: string) {
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, unread: true } : n
    );
    this.notify();
  },
  toggleRead(id: string) {
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, unread: !n.unread } : n
    );
    this.notify();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  notify() {
    listeners.forEach((l) => l());
  },
};

export function useNotifications() {
  const [list, setList] = useState(notificationsStore.getNotifications());
  const [unreadCount, setUnreadCount] = useState(notificationsStore.getUnreadCount());

  useEffect(() => {
    const unsubscribe = notificationsStore.subscribe(() => {
      setList(notificationsStore.getNotifications());
      setUnreadCount(notificationsStore.getUnreadCount());
    });
    return unsubscribe;
  }, []);

  return {
    notifications: list,
    unreadCount,
    markAllAsRead: () => notificationsStore.markAllAsRead(),
    markAsRead: (id: string) => notificationsStore.markAsRead(id),
    markAsUnread: (id: string) => notificationsStore.markAsUnread(id),
    toggleRead: (id: string) => notificationsStore.toggleRead(id),
  };
}
