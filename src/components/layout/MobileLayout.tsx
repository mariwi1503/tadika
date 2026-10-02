import type { Role } from '@/types';
import { Outlet, useNavigate, NavLink } from '@/lib/router';
import {
  AlertTriangle,
  Baby,
  Bell,
  CalendarDays,
  ClipboardCheck,
  Home,
  NotebookPen,
  Receipt,
} from 'lucide-react';
import { Avatar } from '@/components/shared/elements';
import { useStore } from '@/hooks/useStore';
import { getSession } from '@/lib/auth';
import { getUnreadCount } from '@/lib/storage/repositories/notifications';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
}

const NAVS: Record<Role, NavItem[]> = {
  ADMIN: [],
  TEACHER: [
    { id: 'home', to: '/teacher', label: 'Utama', icon: Home, end: true },
    { id: 'attendance', to: '/teacher/attendance', label: 'Kehadiran', icon: ClipboardCheck },
    { id: 'daily-log', to: '/teacher/daily-log', label: 'Rekod Harian', icon: NotebookPen },
    { id: 'incidents', to: '/teacher/incidents', label: 'Insiden', icon: AlertTriangle },
    { id: 'calendar', to: '/teacher/calendar', label: 'Kalendar', icon: CalendarDays },
  ],
  PARENT: [
    { id: 'home', to: '/parent', label: 'Utama', icon: Home, end: true },
    { id: 'daily-log', to: '/parent/daily-log', label: 'Rekod Harian', icon: NotebookPen },
    { id: 'attendance', to: '/parent/attendance', label: 'Kehadiran', icon: ClipboardCheck },
    { id: 'billing', to: '/parent/billing', label: 'Bil', icon: Receipt },
    { id: 'calendar', to: '/parent/calendar', label: 'Kalendar', icon: CalendarDays },
  ],
};

export default function MobileLayout({ role }: { role: Role }) {
  useStore();
  const session = getSession();
  const navigate = useNavigate();
  const items = NAVS[role];
  const notifPath = role === 'TEACHER' ? '/teacher/notifications' : '/parent/notifications';
  const profilePath = role === 'TEACHER' ? '/teacher/profile' : '/parent/profile';
  const unread = getUnreadCount(role);

  return (
    <div className="min-h-svh bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2" data-testid={`${role.toLowerCase()}-brand`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Baby className="h-4.5 w-4.5" />
            </span>
            <span className="font-bold tracking-tight text-slate-900">Tadika Ceria</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(notifPath)}
              data-testid={`${role.toLowerCase()}-notifications-button`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              aria-label="Pemberitahuan"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span
                  data-testid={`${role.toLowerCase()}-notifications-badge`}
                  className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
                >
                  {unread}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate(profilePath)}
              data-testid={`${role.toLowerCase()}-profile-button`}
              className="rounded-full"
              aria-label="Profil"
            >
              <Avatar name={session?.name ?? ''} size="sm" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-5 pb-28">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 h-16 border-t border-slate-200 bg-white/95 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-md">
        <div className="mx-auto grid h-full max-w-3xl grid-cols-5">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={`${role.toLowerCase()}-nav-${item.id}`}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
                  isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn('h-5 w-5', isActive && 'text-teal-600')} />
                  <span>{item.label}</span>
                  <span className={cn('h-0.5 w-6 rounded-full', isActive ? 'bg-teal-600' : 'bg-transparent')} />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
