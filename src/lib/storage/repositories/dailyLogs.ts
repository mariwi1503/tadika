import type { ActivityEntry, DailyLog, MealStatus, MilkStatus, Mood } from '@/types';
import { KEYS } from '../keys';
import { makeRepo } from './base';
import { nowISO } from '../storage';

const repo = makeRepo<DailyLog>(KEYS.dailyLogs);

export const getDailyLogs = repo.list;
export const getDailyLogById = repo.get;
export const replaceDailyLogs = repo.replace;

export function getDailyLogFor(studentId: string, date: string): DailyLog | undefined {
  return repo.list().find((l) => l.studentId === studentId && l.date === date);
}

export function getDailyLogsForStudent(studentId: string): DailyLog[] {
  return repo
    .list()
    .filter((l) => l.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getDailyLogsForDate(date: string): DailyLog[] {
  return repo.list().filter((l) => l.date === date);
}

export interface DailyLogInput {
  studentId: string;
  date: string;
  breakfast?: { status: MealStatus; time?: string } | null;
  lunch?: { status: MealStatus; time?: string } | null;
  milk?: { status: MilkStatus; time?: string } | null;
  nap?: { start?: string; end?: string } | null;
  activities: ActivityEntry[];
  mood?: Mood | null;
  note?: string;
}

export function saveDailyLog(input: DailyLogInput, recordedBy: string): DailyLog {
  const existing = getDailyLogFor(input.studentId, input.date);
  if (existing) {
    const updated = repo.update(existing.id, { ...input, recordedBy, recordedAt: nowISO() });
    return updated as DailyLog;
  }
  return repo.create({ ...input, recordedBy, recordedAt: nowISO() });
}
