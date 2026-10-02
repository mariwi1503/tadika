import { Link } from '@/lib/router';
import { AlertTriangle, ChevronRight, ClipboardCheck, Megaphone, Milk, Moon, NotebookPen, Palette, Utensils } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getClassById } from '@/lib/storage/repositories/classes';
import { getStudentsByClass } from '@/lib/storage/repositories/students';
import { getAttendanceForDate } from '@/lib/storage/repositories/attendance';
import { getAnnouncementsFor } from '@/lib/storage/repositories/announcements';
import { getTeacherById } from '@/lib/storage/repositories/teachers';
import { getSession } from '@/lib/auth';
import { ATTENDANCE_LABELS, ATTENDANCE_TONES } from '@/lib/labels';
import { formatDateShort, formatTime, greeting, todayISO } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { Avatar, GreetingCard, SectionCard, StatusPill } from '@/components/shared/elements';

interface QuickAction {
  label: string;
  icon: LucideIcon;
  to: string;
  testId: string;
}

export default function TeacherDashboard() {
  useStore();
  const session = getSession();
  const teacher = getTeacherById(session?.teacherId ?? '');
  const cls = getClassById(teacher?.classId ?? '');
  const students = cls ? getStudentsByClass(cls.id) : [];
  const today = todayISO();
  const records = getAttendanceForDate(today);
  const inClass = new Set(students.map((s) => s.id));
  const classRecords = records.filter((r) => inClass.has(r.studentId));
  const hadir = classRecords.filter((r) => r.status === 'hadir').length;
  const lewat = classRecords.filter((r) => r.status === 'lewat').length;
  const tidakHadir = classRecords.filter((r) => r.status === 'tidak_hadir').length;
  const cuti = classRecords.filter((r) => r.status === 'cuti').length;
  const announcements = getAnnouncementsFor('TEACHER').slice(0, 2);

  const quickActions: QuickAction[] = [
    { label: 'Daftar Kehadiran', icon: ClipboardCheck, to: '/teacher/attendance', testId: 'quick-attendance' },
    { label: 'Rekod Makanan', icon: Utensils, to: '/teacher/daily-log', testId: 'quick-meal' },
    { label: 'Rekod Susu', icon: Milk, to: '/teacher/daily-log', testId: 'quick-milk' },
    { label: 'Rekod Tidur', icon: Moon, to: '/teacher/daily-log', testId: 'quick-nap' },
    { label: 'Tambah Aktiviti', icon: Palette, to: '/teacher/daily-log', testId: 'quick-activity' },
    { label: 'Lapor Insiden', icon: AlertTriangle, to: '/teacher/incidents', testId: 'quick-incident' },
  ];

  return (
    <div className="space-y-5">
      <GreetingCard
        title={`${greeting()}, ${session?.name ?? 'Cikgu'} 👋`}
        subtitle={cls ? `${cls.name} · ${students.length} murid · ${formatDateShort(today)}` : 'Tiada kelas ditetapkan'}
        testId="teacher-greeting"
      />

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">Tindakan Pantas</p>
        <div className="grid grid-cols-3 gap-3" data-testid="teacher-quick-actions">
          {quickActions.map((a) => (
            <Link
              key={a.testId}
              to={a.to}
              data-testid={`teacher-${a.testId}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center transition-all hover:border-teal-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] active:scale-[0.98]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <a.icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium text-slate-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <SectionCard
        title="Kelas Saya"
        description={cls ? `${cls.name} · ${cls.ageGroup}` : 'Tiada kelas'}
        action={
          <Link to="/teacher/attendance" className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline" data-testid="teacher-class-open-attendance">
            Buka Kehadiran <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        }
        testId="teacher-class-card"
      >
        {students.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada murid dalam kelas ini.</p>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Murid', value: students.length, cls: 'text-slate-900' },
                { label: 'Hadir', value: hadir, cls: 'text-emerald-600' },
                { label: 'Tidak Hadir', value: tidakHadir, cls: 'text-rose-600' },
                { label: 'Lewat', value: lewat, cls: 'text-amber-600' },
              ].map((x) => (
                <div key={x.label} className="rounded-xl bg-slate-50 py-3" data-testid={`teacher-class-count-${x.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <p className={`text-xl font-bold ${x.cls}`}>{x.value}</p>
                  <p className="text-[11px] text-slate-500">{x.label}</p>
                </div>
              ))}
            </div>
            {cuti > 0 && (
              <p className="mt-2 text-xs text-sky-600">
                {cuti} murid bercuti hari ini.
              </p>
            )}
          </>
        )}
      </SectionCard>

      {students.length > 0 && (
        <SectionCard title="Murid Hari Ini" description="Ketik murid untuk rekod harian." testId="teacher-roster-preview">
          <ul className="space-y-2">
            {students.slice(0, 4).map((s) => {
              const rec = classRecords.find((r) => r.studentId === s.id);
              return (
                <li key={s.id}>
                  <Link
                    to="/teacher/daily-log"
                    data-testid={`teacher-roster-item-${s.id}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 transition-colors hover:bg-slate-50"
                  >
                    <Avatar name={s.fullName} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">{s.fullName}</span>
                      <span className="block text-xs text-slate-500">
                        {rec?.checkIn ? `Masuk ${formatTime(rec.checkIn)}` : 'Belum daftar masuk'}
                      </span>
                    </span>
                    {rec ? (
                      <StatusPill label={ATTENDANCE_LABELS[rec.status]} tone={ATTENDANCE_TONES[rec.status]} />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      )}

      {announcements.length > 0 && (
        <SectionCard title="Pengumuman Terkini" testId="teacher-announcements-preview">
          <ul className="space-y-3">
            {announcements.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Megaphone className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                  <p className="line-clamp-2 text-xs text-slate-500">{a.content}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/teacher/calendar" className="mt-3 flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline">
            Lihat kalendar <NotebookPen className="h-3 w-3" />
          </Link>
        </SectionCard>
      )}
    </div>
  );
}
