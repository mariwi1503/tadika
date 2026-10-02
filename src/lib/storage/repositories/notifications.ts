import type { AppNotification, Role } from '@/types';
import { KEYS } from '../keys';
import { makeRepo } from './base';
import { nowISO } from '../storage';

const repo = makeRepo<AppNotification>(KEYS.notifications);

export const getNotifications = repo.list;
export const updateNotification = repo.update;
export const replaceNotifications = repo.replace;

export function getNotificationsForRole(role: Role): AppNotification[] {
  return repo
    .list()
    .filter((n) => n.targetRoles.includes(role))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUnreadCount(role: Role): number {
  return getNotificationsForRole(role).filter((n) => !n.read).length;
}

export function markNotificationRead(id: string): void {
  repo.update(id, { read: true });
}

export function markAllRead(role: Role): void {
  repo.replace(repo.list().map((n) => (n.targetRoles.includes(role) ? { ...n, read: true } : n)));
}

export function notifyRoles(roles: Role[], title: string, body: string): void {
  repo.create({ targetRoles: roles, title, body, read: false, createdAt: nowISO() });
  const all = repo.list();
  if (all.length > 120) repo.replace(all.slice(0, 120));
}
