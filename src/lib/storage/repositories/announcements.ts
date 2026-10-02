import type { Announcement, AnnouncementAudience, Role } from '@/types';
import { KEYS } from '../keys';
import { makeRepo } from './base';

const repo = makeRepo<Announcement>(KEYS.announcements);

export const getAnnouncements = repo.list;
export const getAnnouncementById = repo.get;
export const createAnnouncement = repo.create;
export const updateAnnouncement = repo.update;
export const deleteAnnouncement = repo.remove;
export const replaceAnnouncements = repo.replace;

export function getAnnouncementsFor(role: Role, classId?: string | null): Announcement[] {
  return repo
    .list()
    .filter((a) => {
      if (role === 'ADMIN') return true;
      if (a.audience === 'semua') return true;
      if (role === 'TEACHER') return a.audience === 'guru';
      // Parent view
      if (a.audience === 'ibu_bapa') return true;
      if (a.audience === 'kelas') return !!classId && a.classId === classId;
      return false;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export const AUDIENCES: AnnouncementAudience[] = ['semua', 'guru', 'ibu_bapa', 'kelas'];
