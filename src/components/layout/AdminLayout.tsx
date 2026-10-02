import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { NavLink, Outlet, useNavigate } from '@/lib/router';
import {
  BarChart3,
  Baby,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Receipt,
  Settings,
  Users,
  UsersRound,
} from 'lucide-react';
import { Avatar } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NotificationsInbox } from '@/components/shared/NotificationsInbox';
import { useStore } from '@/hooks/useStore';
import { getSession, logout } from '@/lib/auth';
import { getUnreadCount } from '@/lib/storage/repositories/notifications';
import { ROLE_LABELS } from '@/lib/labels';
import { formatDate, todayISO, weekday } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const NAV = [
  { to: '/admin', label: 'Papan Pemuka', icon: LayoutDashboard, end: true },
  { to: '/admin/students', label: 'Murid', icon: Users },
  { to: '/admin/teachers', label: 'Guru', icon: GraduationCap },
  { to: '/admin/parents', label: 'Ibu Bapa', icon: UsersRound },
  { to: '/admin/classes', label: 'Kelas', icon: BookOpen },
  { to: '/admin/attendance', label: 'Kehadiran', icon: ClipboardCheck },
  { to: '/admin/billing', label: 'Yuran & Bayaran', icon: Receipt },
  { to: '/admin/calendar', label: 'Kalendar', icon: CalendarDays },
  { to: '/admin/announcements', label: 'Pengumuman', icon: Megaphone },
  { to: '/admin/reports', label: 'Laporan', icon: BarChart3 },
  { to: '/admin/activity-log', label: 'Log Aktiviti', icon: History },
  { to: '/admin/settings', label: 'Tetapan', icon: Settings },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
        <Baby className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-bold leading-tight tracking-tight text-slate-900">Tadika Ceria</span>
        <span className="block text-[11px] leading-tight text-slate-400">Sistem Pengurusan Tadika</span>
      </span>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          data-testid={`admin-nav-${item.to.replace('/admin/', '') || 'dashboard'}`}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
              isActive
                ? 'bg-teal-50 font-semibold text-teal-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            )
          }
        >
          <item.icon className="h-4.5 w-4.5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  useStore();
  const pathname = usePathname();
  const session = getSession();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = getUnreadCount('ADMIN');
  const today = todayISO();
  const pageTitle = pathname === '/admin/registration'
    ? 'Pendaftaran Murid'
    : pathname.startsWith('/admin/students/')
      ? 'Profil Murid'
      : NAV.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)))?.label
        ?? 'Papan Pemuka';

  const handleLogout = () => {
    logout();
    toast('Anda telah log keluar');
    navigate('/login');
  };

  return (
    <div className="min-h-svh bg-slate-50">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-slate-100 px-5">
          <BrandMark />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks />
        </div>
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={session?.name ?? 'Pentadbir'} testId="admin-avatar" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{session?.name}</p>
              <p className="text-xs text-slate-400">{session ? ROLE_LABELS[session.role] : ''}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              data-testid="admin-logout-button"
              aria-label="Log keluar"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Topbar */}
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6 lg:ml-64 lg:px-8">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden" data-testid="admin-mobile-menu-button" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
            <div className="flex h-16 items-center border-b border-slate-100 px-5">
              <BrandMark />
            </div>
            <div className="px-3 py-4">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-slate-900">{pageTitle}</h1>
          <p className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{weekday(today)}, {formatDate(today)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotifOpen(true)}
            data-testid="admin-notifications-button"
            aria-label="Pemberitahuan"
          >
            <Bell className="h-5 w-5 text-slate-500" />
            {unread > 0 && (
              <span
                data-testid="admin-notifications-badge"
                className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
              >
                {unread}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button data-testid="admin-account-button" className="rounded-full" aria-label="Akaun">
                  <Avatar name={session?.name ?? 'Pentadbir'} size="sm" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/admin/settings')} data-testid="admin-menu-settings">
                <Settings className="h-4 w-4" /> Tetapan
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={handleLogout} data-testid="admin-menu-logout">
                <LogOut className="h-4 w-4" /> Log Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
          <DialogTitle>Pemberitahuan</DialogTitle>
          <NotificationsInbox role="ADMIN" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
