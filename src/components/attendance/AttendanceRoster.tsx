import type { AttendanceStatus, Student } from '@/types';
import { getAttendanceForDate, getAttendanceForStudentDate, saveAttendance } from '@/lib/storage/repositories/attendance';
import { ATTENDANCE_LABELS, ATTENDANCE_TONES } from '@/lib/labels';
import { formatTime, nowHM } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/storage/repositories/activityLogs';
import { Avatar, EmptyState, StatusPill } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ClipboardList } from 'lucide-react';

const STATUSES: AttendanceStatus[] = ['hadir', 'tidak_hadir', 'lewat', 'cuti'];

const ACTIVE_CLS: Record<AttendanceStatus, string> = {
  hadir: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  tidak_hadir: 'border-rose-500 bg-rose-50 text-rose-700',
  lewat: 'border-amber-500 bg-amber-50 text-amber-700',
  cuti: 'border-sky-500 bg-sky-50 text-sky-700',
};

export function AttendanceRoster({ students, date }: { students: Student[]; date: string }) {
  useStore();
  const session = getSession();
  const recordedBy = session?.name ?? 'Pentadbir';
  const records = getAttendanceForDate(date);
  const byStudent = new Map(records.map((r) => [r.studentId, r]));

  if (students.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Tiada murid dalam kelas ini"
        description="Tambahkan murid kepada kelas terlebih dahulu di halaman Kelas."
        testId="attendance-roster-empty"
      />
    );
  }

  const setStatus = (student: Student, status: AttendanceStatus) => {
    const existing = byStudent.get(student.id);
    saveAttendance(
      {
        studentId: student.id,
        date,
        status,
        checkIn: status === 'hadir' || status === 'lewat' ? (existing?.checkIn || nowHM()) : null,
        checkOut: existing?.checkOut ?? null,
        note: existing?.note ?? '',
      },
      recordedBy,
    );
    logActivity(recordedBy, session?.role ?? 'ADMIN', 'Merekodkan kehadiran', `${student.fullName} — ${ATTENDANCE_LABELS[status]}`);
    toast.success(`${student.nickname}: ${ATTENDANCE_LABELS[status]}`);
  };

  const handleCheck = (student: Student, kind: 'in' | 'out') => {
    const hm = nowHM();
    const existing = getAttendanceForStudentDate(student.id, date);
    if (!existing || existing.status === 'tidak_hadir' || existing.status === 'cuti') {
      setStatus(student, 'hadir');
      return;
    }
    saveAttendance(
      {
        studentId: student.id,
        date,
        status: existing.status,
        checkIn: kind === 'in' ? hm : (existing.checkIn ?? null),
        checkOut: kind === 'out' ? hm : (existing.checkOut ?? null),
        note: existing.note,
      },
      recordedBy,
    );
    logActivity(recordedBy, session?.role ?? 'ADMIN', kind === 'in' ? 'Merekodkan daftar masuk' : 'Merekodkan daftar keluar', student.fullName);
    toast.success(`${student.nickname} ${kind === 'in' ? 'berdaftar masuk' : 'berdaftar keluar'} pada ${formatTime(hm)}`);
  };

  return (
    <ul className="space-y-3" data-testid="attendance-roster">
      {students.map((student) => {
        const rec = byStudent.get(student.id);
        const showCheckIn = !!rec && (rec.status === 'hadir' || rec.status === 'lewat') && !rec.checkIn;
        const showCheckOut = !!rec && (rec.status === 'hadir' || rec.status === 'lewat') && !!rec.checkIn && !rec.checkOut;
        return (
          <li
            key={student.id}
            data-testid={`attendance-row-${student.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center gap-3">
              <Avatar name={student.fullName} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{student.fullName}</p>
                <p className="text-xs text-slate-500">
                  {rec?.checkIn ? `Masuk ${formatTime(rec.checkIn)}` : 'Belum daftar masuk'}
                  {rec?.checkOut ? ` · Keluar ${formatTime(rec.checkOut)}` : ''}
                </p>
              </div>
              {rec && <StatusPill label={ATTENDANCE_LABELS[rec.status]} tone={ATTENDANCE_TONES[rec.status]} testId={`attendance-status-label-${student.id}`} />}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                {STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    data-testid={`attendance-status-${student.id}-${st}`}
                    onClick={() => setStatus(student, st)}
                    className={cn(
                      'rounded-xl border px-2 py-2 text-xs font-semibold transition-colors',
                      rec?.status === st ? ACTIVE_CLS[st] : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
                    )}
                  >
                    {ATTENDANCE_LABELS[st]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {showCheckIn && (
                  <Button size="sm" onClick={() => handleCheck(student, 'in')} data-testid={`attendance-checkin-${student.id}`}>
                    Daftar Masuk
                  </Button>
                )}
                {showCheckOut && (
                  <Button size="sm" variant="outline" onClick={() => handleCheck(student, 'out')} data-testid={`attendance-checkout-${student.id}`}>
                    Daftar Keluar
                  </Button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
