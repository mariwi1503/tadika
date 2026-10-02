import type { Incident } from '@/types';
import { KEYS } from '../keys';
import { makeRepo } from './base';

const repo = makeRepo<Incident>(KEYS.incidents);

export const getIncidents = repo.list;
export const getIncidentById = repo.get;
export const createIncident = repo.create;
export const updateIncident = repo.update;
export const deleteIncident = repo.remove;
export const replaceIncidents = repo.replace;

export function getIncidentsForStudent(studentId: string): Incident[] {
  return repo
    .list()
    .filter((i) => i.studentId === studentId)
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
}

export function getRecentIncidents(daysBackIso: string): Incident[] {
  return repo
    .list()
    .filter((i) => i.date >= daysBackIso)
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
}
