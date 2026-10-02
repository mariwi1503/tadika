import type { UserAccount } from '@/types';
import { KEYS } from '../keys';
import { makeRepo } from './base';

const repo = makeRepo<UserAccount>(KEYS.users);

export const getUsers = repo.list;
export const replaceUsers = repo.replace;
