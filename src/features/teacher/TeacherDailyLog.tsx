import { useState } from 'react';
import type { Student } from '@/types';
import { getClassById } from '@/lib/storage/repositories/classes';
import { getStudentsByClass } from '@/lib/storage/repositories/students';
import { getDailyLogFor } from '@/lib/storage/repositories/dailyLogs';
import { getTeacherById } from '@/lib/storage/repositories/teachers';
import { getSession } from '@/lib/auth';
import { MOOD_LABELS } from '@/lib/labels';
import { todayISO } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { DailyLogSheet } from '@/components/daily-log/DailyLogSheet';
import { Avatar, EmptyState, SectionCard, StatusPill } from '@/components/shared/elements';
import { NotebookPen } from 'lucide-react';

export default function TeacherDailyLog() {
  useStore();
  const session = getSession();
  const teacher = getTeacherById(session?.teacherId ?? '');
  const cls = getClassById(teacher?.classId ?? '');
  const students = cls ? getStudentsByClass(cls.id) : [];
  const [target, setTarget] = useState<Student | null>(null);
  const today = todayISO();

  if (!cls) {
    return <EmptyState icon={NotebookPen} title="Tiada kelas ditetapkan" description="Hubungi pentadbir untuk menetapkan kelas anda." testId="teacher-dailylog-no-class" />;
  }

  return (
    <div className="space-y-4">
      <SectionCard title={`Rekod Harian — ${cls.name}`} description={`Pilih murid untuk mengisi rekod harian ${today}.`} testId="teacher-dailylog-card">
        <ul className="space-y-2">
          {students.map((s) => {
            const log = getDailyLogFor(s.id, today);
            return (
              <li key={s.id}>
                <button
                  data-testid={`teacher-dailylog-open-${s.id}`}
                  onClick={() => setTarget(s)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition-all hover:border-teal-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] active:scale-[0.99]"
                >
                  <Avatar name={s.fullName} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">{s.fullName}</span>
                    <span className="block text-xs text-slate-500">
                      {log
                        ? `Sudah direkod · ${log.activities.length} aktiviti${log.mood ? ` · ${MOOD_LABELS[log.mood]}` : ''}`
                        : 'Belum direkod'}
                    </span>
                  </span>
                  <StatusPill label={log ? 'Lengkap' : 'Belum Rekod'} tone={log ? 'success' : 'warning'} testId={`teacher-dailylog-status-${s.id}`} />
                </button>
              </li>
            );
          })}
        </ul>
      </SectionCard>

      <DailyLogSheet open={!!target} onOpenChange={(o) => !o && setTarget(null)} student={target} />
    </div>
  );
}
