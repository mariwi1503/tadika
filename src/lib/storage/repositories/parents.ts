import type { Parent } from '@/types';
import { KEYS } from '../keys';
import { makeRepo } from './base';

const repo = makeRepo<Parent>(KEYS.parents);

export const getParents = repo.list;
export const getParentById = repo.get;
export const createParent = repo.create;
export const updateParent = repo.update;
export const deleteParent = repo.remove;
export const replaceParents = repo.replace;

export function getParentsOfStudent(studentId: string): Parent[] {
  return repo.list().filter((p) => p.studentIds.includes(studentId));
}
