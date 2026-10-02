import type { Class } from '@/types';
import { KEYS } from '../keys';
import { makeRepo } from './base';

const repo = makeRepo<Class>(KEYS.classes);

export const getClasses = repo.list;
export const getClassById = repo.get;
export const createClass = repo.create;
export const updateClass = repo.update;
export const deleteClass = repo.remove;
export const replaceClasses = repo.replace;
