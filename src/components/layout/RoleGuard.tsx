import type { ReactNode } from 'react';
import { Navigate } from '@/lib/router';
import type { Role } from '@/types';
import { getSession, homeFor } from '@/lib/auth';

/** Blocks direct URL access to portals belonging to other roles. */
export function RoleGuard({ role, children }: { role: Role; children: ReactNode }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== role) return <Navigate to={homeFor(session.role)} replace />;
  return <>{children}</>;
}
