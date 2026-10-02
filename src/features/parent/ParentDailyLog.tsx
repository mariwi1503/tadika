import { useState } from 'react';
import { getParentById } from '@/lib/storage/repositories/parents';
import { getStudentsForParent } from '@/lib/storage/repositories/students';
import { getDailyLogsForStudent } from '@/lib/storage/repositories/dailyLogs';
import { getAttendanceForStudentDate } from '@/lib/storage/repositories/attendance';
import { getSession } from '@/lib/auth';
import { MEAL_LABELS, MILK_LABELS, MOOD_LABELS } from '@/lib/labels';
import { formatDate, formatDateShort, formatTime, minutesBetween } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { EmptyState, PageHeader, SectionCard, StatusPill } from '@/components/shared/elements';
import { Timeline, deriveTimeline } from '@/components/daily-log/Timeline';
import { NotebookPen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ParentDailyLog() {
  useStore();
  const session = getSession();
  const parent = session?.parentId ? getParentById(session.parentId) : undefined;
  const children = parent ? getStudentsForParent(parent.studentIds) : [];
  const logs = children.flatMap((c) => getDailyLogsForStudent(c.id));
  const dates = Array.from(new Set(logs.map((l) => l.date))).sort().reverse();
  const [selected, setSelected] = useState('');
  const active = selected || dates[0] || '';

  if (dates.length === 0) {
    return (
      <div>
        <PageHeader title="Rekod Harian" />
        <EmptyState icon={NotebookPen} title="Belum ada rekod harian" description="Rekod harian daripada guru akan dipaparkan di sini." testId="parent-dailylog-empty" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Rekod Harian" description="Arkib rekod harian anak anda." />

      <div className="flex gap-2 overflow-x-auto pb-1" data-testid="parent-dailylog-date-chips">
        {dates.map((d) => (
          <button
            key={d}
            data-testid={`parent-dailylog-date-${d}`}
            onClick={() => setSelected(d)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
              d === active ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {formatDateShort(d)}
          </button>
        ))}
      </div>

      {children.map((child) => {
        const log = getDailyLogsForStudent(child.id).find((l) => l.date === active);
        const att = getAttendanceForStudentDate(child.id, active);
        if (!log) return null;
        return (
          <SectionCard
            key={child.id}
            title={`${child.nickname} — ${formatDate(active)}`}
            description={`Rekod oleh ${log.recordedBy}`}
            action={att?.status ? <StatusPill label={att.status === 'hadir' ? 'Hadir' : att.status === 'lewat' ? 'Lewat' : att.status === 'cuti' ? 'Cuti' : 'Tidak Hadir'} tone={att.status === 'hadir' ? 'success' : att.status === 'lewat' ? 'warning' : att.status === 'cuti' ? 'info' : 'danger'} /> : undefined}
            testId={`parent-dailylog-detail-${child.id}`}
          >
            <div className="mb-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              {[
                ['Sarapan', log.breakfast ? MEAL_LABELS[log.breakfast.status] : '—'],
                ['Tengah Hari', log.lunch ? MEAL_LABELS[log.lunch.status] : '—'],
                ['Susu', log.milk ? MILK_LABELS[log.milk.status] : '—'],
                ['Tidur', log.nap?.start ? minutesBetween(log.nap.start, log.nap.end) || 'Sedang tidur' : '—'],
                ['Perasaan', log.mood ? MOOD_LABELS[log.mood] : '—'],
                ['Aktiviti', log.activities.length > 0 ? log.activities.map((a) => a.name).join(', ') : '—'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-[11px] text-slate-400">{k}</p>
                  <p className="font-medium text-slate-800">{v}</p>
                </div>
              ))}
            </div>
            {log.note && (
              <div className="mb-4 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800" data-testid={`parent-dailylog-note-${child.id}`}>
                <span className="font-semibold">Catatan guru:</span> {log.note}
              </div>
            )}
            <Timeline entries={deriveTimeline(att, log)} testId={`parent-dailylog-timeline-${child.id}`} />
            {log.nap?.start && (
              <p className="mt-3 text-xs text-slate-400">
                Tidur: {formatTime(log.nap.start)} — {formatTime(log.nap.end) || '...'}
              </p>
            )}
          </SectionCard>
        );
      })}
    </div>
  );
}
