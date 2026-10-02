import type { ActivityLogEntry, Role } from '@/types';
import { KEYS } from '../keys';
import { makeRepo } from './base';
import { nowISO } from '../storage';

const repo = makeRepo<ActivityLogEntry>(KEYS.activityLogs);

export const getActivityLogs = repo.list;
export const replaceActivityLogs = repo.replace;

export function logActivity(actorName: string, actorRole: Role, action: string, detail: string): void {
  repo.create({ actorName, actorRole, action, detail, createdAt: nowISO() });
  const all = repo.list();
  if (all.length > 200) repo.replace(all.slice(0, 200));
}
