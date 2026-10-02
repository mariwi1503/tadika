import type { Attendance } from '@/types';
import { KEYS } from '../keys';
import { makeRepo } from './base';

const repo = makeRepo<Attendance>(KEYS.attendance);

export const getAttendance = repo.list;
export const getAttendanceById = repo.get;
export const createAttendance = repo.create;
export const updateAttendance = repo.update;
export const deleteAttendance = repo.remove;
export const replaceAttendance = repo.replace;

export function getAttendanceForDate(date: string): Attendance[] {
  return repo.list().filter((a) => a.date === date);
}

export function getAttendanceForStudent(studentId: string): Attendance[] {
  return repo
    .list()
    .filter((a) => a.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getAttendanceForStudentDate(studentId: string, date: string): Attendance | undefined {
  return repo.list().find((a) => a.studentId === studentId && a.date === date);
}

export function getAttendanceRange(fromIso: string, toIso: string): Attendance[] {
  return repo.list().filter((a) => a.date >= fromIso && a.date <= toIso);
}

/** Create or update the attendance row for (studentId, date). */
export function saveAttendance(
  input: {
    studentId: string;
    date: string;
    status: Attendance['status'];
    checkIn?: string | null;
    checkOut?: string | null;
    note?: string;
  },
  recordedBy: string,
): Attendance {
  const existing = getAttendanceForStudentDate(input.studentId, input.date);
  if (existing) {
    const updated = repo.update(existing.id, { ...input, recordedBy, recordedAt: new Date().toISOString() });
    return updated as Attendance;
  }
  return repo.create({ ...input, recordedBy, recordedAt: new Date().toISOString() });
}
