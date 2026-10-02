'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import AdminLayout from '@/components/layout/AdminLayout';
import MobileLayout from '@/components/layout/MobileLayout';
import { RoleGuard } from '@/components/layout/RoleGuard';
import Login from '@/features/Login';
import AdminDashboard from '@/features/admin/AdminDashboard';
import Students from '@/features/admin/Students';
import StudentProfile from '@/features/admin/StudentProfile';
import Registration from '@/features/admin/Registration';
import Teachers from '@/features/admin/Teachers';
import Parents from '@/features/admin/Parents';
import Classes from '@/features/admin/Classes';
import AttendanceAdmin from '@/features/admin/AttendanceAdmin';
import Billing from '@/features/admin/Billing';
import CalendarAdmin from '@/features/admin/CalendarAdmin';
import AnnouncementsAdmin from '@/features/admin/AnnouncementsAdmin';
import Reports from '@/features/admin/Reports';
import ActivityLogPage from '@/features/admin/ActivityLogPage';
import Settings from '@/features/admin/Settings';
import TeacherDashboard from '@/features/teacher/TeacherDashboard';
import TeacherAttendance from '@/features/teacher/TeacherAttendance';
import TeacherDailyLog from '@/features/teacher/TeacherDailyLog';
import TeacherIncidents from '@/features/teacher/TeacherIncidents';
import TeacherCalendar from '@/features/teacher/TeacherCalendar';
import TeacherNotifications from '@/features/teacher/TeacherNotifications';
import TeacherProfile from '@/features/teacher/TeacherProfile';
import ParentDashboard from '@/features/parent/ParentDashboard';
import ParentChild from '@/features/parent/ParentChild';
import ParentAttendance from '@/features/parent/ParentAttendance';
import ParentDailyLog from '@/features/parent/ParentDailyLog';
import ParentBilling from '@/features/parent/ParentBilling';
import ParentCalendar from '@/features/parent/ParentCalendar';
import ParentAnnouncements from '@/features/parent/ParentAnnouncements';
import ParentNotifications from '@/features/parent/ParentNotifications';
import ParentProfile from '@/features/parent/ParentProfile';
import { getSession, homeFor } from '@/lib/auth';
import { ensureSeed } from '@/lib/storage/storage';
import { Navigate, OutletProvider } from '@/lib/router';

const ADMIN_ROUTES: Record<string, ComponentType> = {
  '/admin': AdminDashboard,
  '/admin/students': Students,
  '/admin/registration': Registration,
  '/admin/teachers': Teachers,
  '/admin/parents': Parents,
  '/admin/classes': Classes,
  '/admin/attendance': AttendanceAdmin,
  '/admin/billing': Billing,
  '/admin/calendar': CalendarAdmin,
  '/admin/announcements': AnnouncementsAdmin,
  '/admin/reports': Reports,
  '/admin/activity-log': ActivityLogPage,
  '/admin/settings': Settings,
};

const TEACHER_ROUTES: Record<string, ComponentType> = {
  '/teacher': TeacherDashboard,
  '/teacher/attendance': TeacherAttendance,
  '/teacher/daily-log': TeacherDailyLog,
  '/teacher/incidents': TeacherIncidents,
  '/teacher/calendar': TeacherCalendar,
  '/teacher/notifications': TeacherNotifications,
  '/teacher/profile': TeacherProfile,
};

const PARENT_ROUTES: Record<string, ComponentType> = {
  '/parent': ParentDashboard,
  '/parent/child': ParentChild,
  '/parent/attendance': ParentAttendance,
  '/parent/daily-log': ParentDailyLog,
  '/parent/billing': ParentBilling,
  '/parent/calendar': ParentCalendar,
  '/parent/announcements': ParentAnnouncements,
  '/parent/notifications': ParentNotifications,
  '/parent/profile': ParentProfile,
};

function LoadingScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      <span className="sr-only">Memuatkan demo Tadika Ceria</span>
    </div>
  );
}

export function PortalRouter() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureSeed();
    setReady(true);
  }, []);

  if (!ready) return <LoadingScreen />;

  let content;
  if (pathname === '/login') {
    content = <Login />;
  } else if (pathname === '/') {
    const session = getSession();
    content = <Navigate to={session ? homeFor(session.role) : '/login'} replace />;
  } else if (pathname.startsWith('/admin/students/') && pathname.split('/').length === 4) {
    content = (
      <OutletProvider outlet={<StudentProfile />}>
        <RoleGuard role="ADMIN"><AdminLayout /></RoleGuard>
      </OutletProvider>
    );
  } else if (ADMIN_ROUTES[pathname]) {
    const Screen = ADMIN_ROUTES[pathname];
    content = (
      <OutletProvider outlet={<Screen />}>
        <RoleGuard role="ADMIN"><AdminLayout /></RoleGuard>
      </OutletProvider>
    );
  } else if (TEACHER_ROUTES[pathname]) {
    const Screen = TEACHER_ROUTES[pathname];
    content = (
      <OutletProvider outlet={<Screen />}>
        <RoleGuard role="TEACHER"><MobileLayout role="TEACHER" /></RoleGuard>
      </OutletProvider>
    );
  } else if (PARENT_ROUTES[pathname]) {
    const Screen = PARENT_ROUTES[pathname];
    content = (
      <OutletProvider outlet={<Screen />}>
        <RoleGuard role="PARENT"><MobileLayout role="PARENT" /></RoleGuard>
      </OutletProvider>
    );
  } else {
    const session = getSession();
    content = <Navigate to={session ? homeFor(session.role) : '/login'} replace />;
  }

  return (
    <>
      {content}
      <Toaster richColors offset={{ bottom: '24px' }} mobileOffset={{ bottom: '84px' }} />
    </>
  );
}
