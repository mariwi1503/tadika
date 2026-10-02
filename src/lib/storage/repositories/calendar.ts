import type { CalendarEvent, EventType, Role } from '@/types';
import { KEYS } from '../keys';
import { makeRepo } from './base';

const repo = makeRepo<CalendarEvent>(KEYS.events);

export const getEvents = repo.list;
export const getEventById = repo.get;
export const createEvent = repo.create;
export const updateEvent = repo.update;
export const deleteEvent = repo.remove;
export const replaceEvents = repo.replace;

export function getEventsFor(role: Role): CalendarEvent[] {
  return repo
    .list()
    .filter((e) => {
      if (role === 'ADMIN') return true;
      if (e.audience === 'semua') return true;
      return role === 'TEACHER' ? e.audience === 'guru' : e.audience === 'ibu_bapa';
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export const EVENT_TYPES: EventType[] = [
  'aktiviti',
  'acara',
  'cuti',
  'cuti_guru',
  'mesyuarat',
  'hari_terbuka',
  'aktiviti_kelas',
  'penutupan',
];
