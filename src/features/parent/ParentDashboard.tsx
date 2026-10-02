import { Link, useNavigate } from '@/lib/router';
import { ChevronRight, Clock, Milk, Moon, Palette, Receipt, Smile, Utensils } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getParentById } from '@/lib/storage/repositories/parents';
import { getStudentsForParent } from '@/lib/storage/repositories/students';
import { getClassById } from '@/lib/storage/repositories/classes';
import { getAttendanceForStudentDate } from '@/lib/storage/repositories/attendance';
import { getDailyLogFor } from '@/lib/storage/repositories/dailyLogs';
import { getInvoicesForStudent } from '@/lib/storage/repositories/invoices';
import { getSession } from '@/lib/auth';
import { ATTENDANCE_LABELS, ATTENDANCE_TONES, MEAL_LABELS, MILK_LABELS, MOOD_LABELS } from '@/lib/labels';
import { formatRM, formatTime, greeting, minutesBetween, todayISO } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { Avatar, GreetingCard, SectionCard, StatusPill } from '@/components/shared/elements';
import { Timeline, deriveTimeline } from '@/components/daily-log/Timeline';

function SummaryTile({ icon: Icon, label, value, testId }: { icon: LucideIcon; label: string; value: string; testId: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5" data-testid={testId}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-2 text-[11px] text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function ParentDashboard() {
  useStore();
  const session = getSession();
  const navigate = useNavigate();
  const parent = session?.parentId ? getParentById(session.parentId) : undefined;
  const children = parent ? getStudentsForParent(parent.studentIds) : [];
  const today = todayISO();

  const unpaid = children.flatMap((c) => getInvoicesForStudent(c.id).filter((i) => i.status === 'belum_dibayar' || i.status === 'tertunggak'));

  return (
    <div className="space-y-5">
      <GreetingCard
        title={`${greeting()}, ${session?.name ?? 'Ibu Bapa'} 👋`}
        subtitle="Berikut ialah perkembangan anak anda hari ini."
        testId="parent-greeting"
      />

      {unpaid.length > 0 && (
        <button
          data-testid="parent-unpaid-alert"
          onClick={() => navigate('/parent/billing')}
          className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left transition-colors hover:bg-amber-100"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Receipt className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-amber-800">
              {unpaid.length} bil yuran perlu dibayar — {formatRM(unpaid.reduce((a, i) => a + i.amount, 0))}
            </span>
            <span className="block text-xs text-amber-700">
              {unpaid[0].title} {unpaid[0].periodLabel}
            </span>
          </span>
          <span className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white">Bayar Sekarang</span>
        </button>
      )}

      {children.length === 0 && (
        <SectionCard testId="parent-no-child">
          <p className="text-sm text-slate-500">Tiada anak didaftarkan kepada akaun ini.</p>
        </SectionCard>
      )}

      {children.map((child) => {
        const cls = getClassById(child.classId ?? '');
        const att = getAttendanceForStudentDate(child.id, today);
        const log = getDailyLogFor(child.id, today);
        return (
          <div key={child.id} className="space-y-4">
            {/* Kad anak */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]" data-testid={`parent-child-card-${child.id}`}>
              <Avatar name={child.fullName} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="font-bold tracking-tight text-slate-900" data-testid={`parent-child-name-${child.id}`}>{child.fullName}</p>
                <p className="text-sm text-slate-500">{cls?.name ?? 'Tiada kelas'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {att ? (
                    <>
                      <StatusPill label={ATTENDANCE_LABELS[att.status]} tone={ATTENDANCE_TONES[att.status]} testId={`parent-child-attendance-${child.id}`} />
                      {att.checkIn && (
                        <span className="flex items-center gap-1" data-testid={`parent-child-checkin-${child.id}`}>
                          <Clock className="h-3 w-3" /> Daftar masuk {formatTime(att.checkIn)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-400">Belum daftar masuk hari ini</span>
                  )}
                </div>
              </div>
              <Link to="/parent/child" data-testid={`parent-child-link-${child.id}`} aria-label="Profil anak" className="text-slate-300 hover:text-teal-600">
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Ringkasan hari ini */}
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">Ringkasan Hari Ini</p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                <SummaryTile icon={Smile} label="Perasaan" value={log?.mood ? MOOD_LABELS[log.mood] : '—'} testId={`parent-summary-mood-${child.id}`} />
                <SummaryTile icon={Utensils} label="Sarapan" value={log?.breakfast ? MEAL_LABELS[log.breakfast.status] : '—'} testId={`parent-summary-breakfast-${child.id}`} />
                <SummaryTile icon={Milk} label="Susu" value={log?.milk ? MILK_LABELS[log.milk.status] : '—'} testId={`parent-summary-milk-${child.id}`} />
                <SummaryTile
                  icon={Moon}
                  label="Tidur"
                  value={log?.nap?.start ? minutesBetween(log.nap.start, log.nap.end) || 'Sedang tidur' : '—'}
                  testId={`parent-summary-nap-${child.id}`}
                />
                <SummaryTile icon={Palette} label="Aktiviti" value={log ? `${log.activities.length} aktiviti` : '—'} testId={`parent-summary-activities-${child.id}`} />
                <SummaryTile
                  icon={Utensils}
                  label="Makan Tengah Hari"
                  value={log?.lunch ? MEAL_LABELS[log.lunch.status] : '—'}
                  testId={`parent-summary-lunch-${child.id}`}
                />
              </div>
            </div>

            {/* Timeline */}
            <SectionCard title="Garis Masa Hari Ini" description={`Perkembangan ${child.nickname} dari masa ke masa.`} testId={`parent-timeline-card-${child.id}`}>
              {log?.note && (
                <div className="mb-4 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800" data-testid={`parent-teacher-note-${child.id}`}>
                  <span className="font-semibold">Catatan guru:</span> {log.note}
                </div>
              )}
              <Timeline entries={deriveTimeline(att, log)} testId={`parent-timeline-${child.id}`} />
            </SectionCard>
          </div>
        );
      })}
    </div>
  );
}
