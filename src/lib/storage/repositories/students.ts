import type { Student } from '@/types';
import { KEYS } from '../keys';
import { makeRepo } from './base';

const repo = makeRepo<Student>(KEYS.students);

export const getStudents = repo.list;
export const getStudentById = repo.get;
export const createStudent = repo.create;
export const updateStudent = repo.update;
export const deleteStudent = repo.remove;
export const replaceStudents = repo.replace;

export function getActiveStudents(): Student[] {
  return repo.list().filter((s) => s.status === 'approved');
}

export function getStudentsByClass(classId: string): Student[] {
  return repo
    .list()
    .filter((s) => s.classId === classId && s.status === 'approved')
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export function getStudentsForParent(studentIds: string[]): Student[] {
  const all = repo.list();
  return studentIds.map((id) => all.find((s) => s.id === id)).filter((s): s is Student => !!s);
}
