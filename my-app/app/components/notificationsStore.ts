"use client";

// ================================================================
//  notificationsStore — web port of the mobile app's
//  mobile/src/store/notificationsStore.ts: same seed items and
//  read/unread operations, backed by a module store read via
//  useSyncExternalStore so every mounted bell stays in sync.
// ================================================================

import { useSyncExternalStore } from "react";

export interface NotificationItem {
  id: string;
  title: string;
  project: string;
  time: string;
  unread: boolean;
  /** Where clicking the notification lands, per app context: a reply
   *  goes to the discussion board, a stage update to the timeline. */
  residentHref: string;
  townshipHref: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "The township replied to your comment",
    project: "Hilltop Park Expansion",
    time: "2h ago",
    unread: true,
    residentHref: "/proposal#discussion",
    townshipHref: "/township/project/hilltop?tab=feedback",
  },
  {
    id: "2",
    title: "New stage: Public Comment Period is open",
    project: "Hilltop Park Expansion",
    time: "1d ago",
    unread: true,
    residentHref: "/proposal#timeline",
    townshipHref: "/township/project/hilltop?tab=details&stage=1",
  },
  {
    id: "3",
    title: "A project you follow was updated",
    project: "Road Paving 2026",
    time: "3d ago",
    unread: false,
    residentHref: "/proposal",
    townshipHref: "/township/project/road-paving?tab=details",
  },
  {
    id: "4",
    title: "Comment period closing soon",
    project: "Township Ordinance Updates",
    time: "5d ago",
    unread: false,
    residentHref: "/proposal#discussion",
    townshipHref: "/township/project/ordinance?tab=feedback",
  },
];

let notifications = initialNotifications;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): NotificationItem[] {
  return notifications;
}

export function markAllAsRead() {
  notifications = notifications.map((n) => ({ ...n, unread: false }));
  emit();
}

export function markAsRead(id: string) {
  notifications = notifications.map((n) => (n.id === id ? { ...n, unread: false } : n));
  emit();
}

export function toggleRead(id: string) {
  notifications = notifications.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n));
  emit();
}

export function useNotifications() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    notifications: list,
    unreadCount: list.filter((n) => n.unread).length,
  };
}
