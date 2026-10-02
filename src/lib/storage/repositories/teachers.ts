import type { Teacher } from '@/types';
import { KEYS } from '../keys';
import { makeRepo } from './base';

const repo = makeRepo<Teacher>(KEYS.teachers);

export const getTeachers = repo.list;
export const getTeacherById = repo.get;
export const createTeacher = repo.create;
export const updateTeacher = repo.update;
export const deleteTeacher = repo.remove;
export const replaceTeachers = repo.replace;

export function getTeacherForClass(classId: string | null): Teacher | undefined {
  if (!classId) return undefined;
  return repo.list().find((t) => t.classId === classId);
}
