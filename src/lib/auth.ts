import type { Role, Session, UserAccount } from '@/types';
import { KEYS } from './storage/keys';
import { listCol, read, remove, write } from './storage/storage';

export function getSession(): Session | null {
  return read<Session | null>(KEYS.session, null);
}

export function setSession(session: Session | null): void {
  if (session) write(KEYS.session, session);
  else remove(KEYS.session);
}

export function homeFor(role: Role): string {
  if (role === 'ADMIN') return '/admin';
  if (role === 'TEACHER') return '/teacher';
  return '/parent';
}

export function login(email: string, password: string): Session | null {
  const user = listCol<UserAccount>(KEYS.users).find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!user) return null;
  const session: Session = {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    teacherId: user.teacherId,
    parentId: user.parentId,
  };
  setSession(session);
  return session;
}

export function loginAsRole(role: Role): Session | null {
  const user = listCol<UserAccount>(KEYS.users).find((u) => u.role === role);
  if (!user) return null;
  return login(user.email, user.password);
}

export function logout(): void {
  setSession(null);
}
