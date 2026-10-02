import { useMemo } from 'react';
import { Link } from '@/lib/router';
import {
  AlertTriangle,
  Baby,
  Bell,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Receipt,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader, StatCard, StatusPill } from '@/components/shared/elements';
import { getActivityLogs } from '@/lib/storage/repositories/activityLogs';
import { getStudents } from '@/lib/storage/repositories/students';
import { getTeachers } from '@/lib/storage/repositories/teachers';
import { getParents } from '@/lib/storage/repositories/parents';
import { getClasses } from '@/lib/storage/repositories/classes';
import { getAttendanceForDate } from '@/lib/storage/repositories/attendance';
import { getInvoices } from '@/lib/storage/repositories/invoices';
import { getIncidents } from '@/lib/storage/repositories/incidents';
import { ATTENDANCE_LABELS, ATTENDANCE_TONES } from '@/lib/labels';
import type { AttendanceStatus } from '@/types';
import { daysAgoISO, formatDateShort, formatRM, relativeTime, todayISO } from '@/lib/format';
import { useStore } from '@/hooks/useStore';

interface AttentionItem {
  icon: LucideIcon;
  text: string;
  to: string;
  testId: string;
}

export default function AdminDashboard() {
  useStore();
  const today = todayISO();

  const students = getStudents();
  const active = students.filter((s) => s.status === 'approved');
  const teachers = getTeachers();
  const parents = getParents();
  const classes = getClasses();
  const attendanceToday = getAttendanceForDate(today);
  const invoices = getInvoices();
  const logs = getActivityLogs();

  const statusCount = (st: AttendanceStatus) => attendanceToday.filter((a) => a.status === st).length;
  const recordedIds = new Set(attendanceToday.map((a) => a.studentId));
  const notCheckedIn = active.filter((s) => !recordedIds.has(s.id)).length;

  const trend = useMemo(() => {
    const out: { label: string; hadir: number; lewat: number; tidak_hadir: number }[] = [];
    for (let off = 6; off >= 0; off--) {
      const date = daysAgoISO(off);
      const dt = new Date(`${date}T00:00:00`);
      if (dt.getDay() === 0 || dt.getDay() === 6) continue;
      const rows = getAttendanceForDate(date);
      out.push({
        label: `${dt.getDate()}/${dt.getMonth() + 1}`,
        hadir: rows.filter((r) => r.status === 'hadir').length,
        lewat: rows.filter((r) => r.status === 'lewat').length,
        tidak_hadir: rows.filter((r) => r.status === 'tidak_hadir').length,
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  const sumStatus = (...statuses: string[]) =>
    invoices.filter((i) => statuses.includes(i.status)).reduce((a, i) => a + i.amount, 0);
  const overdue = invoices.filter((i) => i.status === 'tertunggak');
  const unpaid = invoices.filter((i) => i.status === 'belum_dibayar');
  const pending = students.filter((s) => s.status === 'pending');
  const recentIncidents = getIncidents().filter((i) => i.date >= daysAgoISO(3));

  const attention: AttentionItem[] = [
    overdue.length > 0 && {
      icon: Receipt,
      text: `${overdue.length} bil tertunggak berjumlah ${formatRM(overdue.reduce((a, i) => a + i.amount, 0))}`,
      to: '/admin/billing',
      testId: 'attention-overdue',
    },
    notCheckedIn > 0 && {
      icon: ClipboardCheck,
      text: `${notCheckedIn} murid belum daftar masuk hari ini`,
      to: '/admin/attendance',
      testId: 'attention-not-checked-in',
    },
    pending.length > 0 && {
      icon: UserPlus,
      text: `${pending.length} pendaftaran menunggu semakan`,
      to: '/admin/students',
      testId: 'attention-pending',
    },
    recentIncidents.length > 0 && {
      icon: AlertTriangle,
      text: `${recentIncidents.length} insiden dilaporkan dalam 3 hari kebelakangan`,
      to: '/admin/activity-log',
      testId: 'attention-incidents',
    },
    unpaid.length > 0 && {
      icon: Bell,
      text: `${unpaid.length} bil belum dibayar untuk bulan semasa`,
      to: '/admin/billing',
      testId: 'attention-unpaid',
    },
  ].filter(Boolean) as AttentionItem[];

  return (
    <div className="space-y-6">
      <PageHeader description={`Ringkasan operasi hari ini · ${formatDateShort(today)}`} />

      {/* Kad ringkasan */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Baby} label="Jumlah Murid" value={active.length} hint={`${students.length} termasuk pendaftaran baharu`} testId="stat-total-students" />
        <StatCard icon={ClipboardCheck} label="Hadir Hari Ini" value={statusCount('hadir') + statusCount('lewat')} hint={`${statusCount('lewat')} lewat`} tone="success" testId="stat-present-today" />
        <StatCard icon={GraduationCap} label="Jumlah Guru" value={teachers.length} tone="info" testId="stat-total-teachers" />
        <StatCard icon={UsersRound} label="Jumlah Ibu Bapa" value={parents.length} tone="warning" testId="stat-total-parents" />
        <StatCard icon={BookOpen} label="Jumlah Kelas" value={classes.length} tone="neutral" testId="stat-total-classes" />
      </div>

      {/* Kehadiran */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] lg:col-span-2" data-testid="attendance-chart-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Trend Kehadiran</h2>
              <p className="text-xs text-slate-500">7 hari persekolahan kebelakangan</p>
            </div>
            <Link to="/admin/attendance" className="text-xs font-semibold text-teal-600 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={28} />
                <Tooltip cursor={{ fill: 'rgba(13,148,136,0.06)' }} />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="hadir" name="Hadir" stackId="a" fill="#10B981" />
                <Bar dataKey="lewat" name="Lewat" stackId="a" fill="#F59E0B" />
                <Bar dataKey="tidak_hadir" name="Tidak Hadir" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]" data-testid="attendance-today-card">
          <h2 className="font-semibold text-slate-900">Kehadiran Hari Ini</h2>
          <p className="text-xs text-slate-500">{formatDateShort(today)}</p>
          <ul className="mt-4 space-y-3">
            {(['hadir', 'lewat', 'tidak_hadir', 'cuti'] as AttendanceStatus[]).map((st) => (
              <li key={st} className="flex items-center justify-between" data-testid={`today-count-${st}`}>
                <StatusPill label={ATTENDANCE_LABELS[st]} tone={ATTENDANCE_TONES[st]} />
                <span className="text-lg font-bold text-slate-900">{statusCount(st)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-center" data-testid="attendance-rate">
            <p className="text-2xl font-bold text-teal-600">
              {active.length > 0 ? Math.round(((statusCount('hadir') + statusCount('lewat')) / active.length) * 100) : 0}%
            </p>
            <p className="text-xs text-slate-500">Kadar kehadiran</p>
          </div>
        </div>
      </div>

      {/* Kewangan */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Kewangan</h2>
          <Link to="/admin/billing" className="text-xs font-semibold text-teal-600 hover:underline">
            Yuran &amp; Bayaran
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
          <StatCard icon={Receipt} label="Jumlah Bil Aktif" value={invoices.filter((i) => i.status !== 'dibatalkan' && i.status !== 'draf').length} testId="finance-total-invoices" />
          <StatCard icon={Receipt} label="Sudah Dibayar" value={formatRM(sumStatus('sudah_dibayar'))} tone="success" testId="finance-paid" />
          <StatCard icon={Receipt} label="Belum Dibayar" value={formatRM(sumStatus('belum_dibayar'))} tone="warning" testId="finance-unpaid" />
          <StatCard icon={Receipt} label="Tertunggak" value={formatRM(sumStatus('tertunggak'))} tone="danger" testId="finance-overdue" />
        </div>
      </div>

      {/* Perhatian + Aktiviti */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]" data-testid="attention-card">
          <h2 className="font-semibold text-slate-900">Perkara Yang Memerlukan Perhatian</h2>
          {attention.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Tiada perkara yang memerlukan perhatian. Bagus!</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {attention.map((item) => (
                <li key={item.testId}>
                  <Link
                    to={item.to}
                    data-testid={item.testId}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3 transition-colors hover:border-teal-200 hover:bg-teal-50/50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-slate-700">{item.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]" data-testid="activity-feed-card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Aktiviti Terkini</h2>
            <Link to="/admin/activity-log" className="text-xs font-semibold text-teal-600 hover:underline">
              Log penuh
            </Link>
          </div>
          <ul className="mt-4 space-y-4">
            {logs.slice(0, 6).map((l) => (
              <li key={l.id} className="flex gap-3" data-testid="activity-feed-item">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                  {l.actorRole === 'ADMIN' ? <ShieldCheck className="h-3.5 w-3.5" /> : l.actorRole === 'TEACHER' ? <GraduationCap className="h-3.5 w-3.5" /> : <UsersRound className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{l.actorName}</span> {l.action.toLowerCase()}
                  </p>
                  <p className="truncate text-xs text-slate-500">{l.detail}</p>
                  <p className="text-[11px] text-slate-400">{relativeTime(l.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
