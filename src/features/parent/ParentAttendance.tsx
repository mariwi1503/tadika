import { getParentById } from '@/lib/storage/repositories/parents';
import { getStudentsForParent } from '@/lib/storage/repositories/students';
import { getAttendanceForStudent } from '@/lib/storage/repositories/attendance';
import { getSession } from '@/lib/auth';
import { ATTENDANCE_LABELS, ATTENDANCE_TONES } from '@/lib/labels';
import { formatDateShort, formatTime } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { EmptyState, PageHeader, StatusPill } from '@/components/shared/elements';
import { ClipboardList } from 'lucide-react';
import type { AttendanceStatus } from '@/types';

export default function ParentAttendance() {
  useStore();
  const session = getSession();
  const parent = session?.parentId ? getParentById(session.parentId) : undefined;
  const children = parent ? getStudentsForParent(parent.studentIds) : [];
  const records = children
    .flatMap((c) => getAttendanceForStudent(c.id))
    .sort((a, b) => b.date.localeCompare(a.date));

  const count = (st: AttendanceStatus) => records.filter((r) => r.status === st).length;

  if (records.length === 0) {
    return (
      <div>
        <PageHeader title="Kehadiran" />
        <EmptyState icon={ClipboardList} title="Belum ada rekod kehadiran" description="Rekod kehadiran anak anda akan dipaparkan di sini." testId="parent-attendance-empty" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Kehadiran" description="Rekod kehadiran keseluruhan." />
      <div className="grid grid-cols-4 gap-3">
        {(['hadir', 'lewat', 'tidak_hadir', 'cuti'] as AttendanceStatus[]).map((st) => (
          <div key={st} className="rounded-2xl border border-slate-200 bg-white p-3 text-center" data-testid={`parent-attendance-count-${st}`}>
            <p className="text-lg font-bold text-slate-900">{count(st)}</p>
            <p className="text-[11px] text-slate-500">{ATTENDANCE_LABELS[st]}</p>
          </div>
        ))}
      </div>
      <ul className="space-y-2" data-testid="parent-attendance-list">
        {records.slice(0, 30).map((r) => {
          const child = children.find((c) => c.id === r.studentId);
          return (
            <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4" data-testid={`parent-attendance-item-${r.id}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDateShort(r.date)}
                    {children.length > 1 && <span className="font-normal text-slate-500"> · {child?.nickname}</span>}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.checkIn ? `Masuk ${formatTime(r.checkIn)}` : 'Tiada daftar masuk'}
                    {r.checkOut ? ` · Keluar ${formatTime(r.checkOut)}` : ''}
                    {r.note ? ` · ${r.note}` : ''}
                  </p>
                </div>
                <StatusPill label={ATTENDANCE_LABELS[r.status]} tone={ATTENDANCE_TONES[r.status]} testId={`parent-attendance-status-${r.id}`} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
