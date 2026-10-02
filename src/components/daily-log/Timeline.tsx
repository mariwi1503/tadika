import { LogIn, LogOut, Milk, Moon, Palette, Sunrise, Utensils } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Attendance, DailyLog } from '@/types';
import { MEAL_LABELS, MILK_LABELS } from '@/lib/labels';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface TimelineEntry {
  time?: string;
  title: string;
  detail?: string;
  kind: 'masuk' | 'makan' | 'susu' | 'aktiviti' | 'tidur' | 'bangun' | 'keluar';
}

const KIND_STYLE: Record<TimelineEntry['kind'], { icon: LucideIcon; cls: string }> = {
  masuk: { icon: LogIn, cls: 'bg-teal-100 text-teal-600' },
  makan: { icon: Utensils, cls: 'bg-amber-100 text-amber-600' },
  susu: { icon: Milk, cls: 'bg-sky-100 text-sky-600' },
  aktiviti: { icon: Palette, cls: 'bg-indigo-100 text-indigo-600' },
  tidur: { icon: Moon, cls: 'bg-violet-100 text-violet-600' },
  bangun: { icon: Sunrise, cls: 'bg-amber-100 text-amber-600' },
  keluar: { icon: LogOut, cls: 'bg-teal-100 text-teal-600' },
};

/** Derives the parent-facing daily timeline from attendance + daily log. */
export function deriveTimeline(att?: Attendance, log?: DailyLog): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  if (att?.checkIn) {
    entries.push({ time: att.checkIn, title: 'Daftar masuk', detail: att.status === 'lewat' ? 'Lewat ke tadika' : 'Tiba di tadika dengan selamat', kind: 'masuk' });
  }
  if (log?.breakfast && log.breakfast.status !== 'tidak_makan') {
    entries.push({ time: log.breakfast.time ?? undefined, title: 'Sarapan', detail: MEAL_LABELS[log.breakfast.status], kind: 'makan' });
  }
  for (const act of log?.activities ?? []) {
    entries.push({ time: act.time ?? undefined, title: `Aktiviti ${act.name}`, detail: 'Aktiviti kelas', kind: 'aktiviti' });
  }
  if (log?.milk && log.milk.status !== 'tidak_minum') {
    entries.push({ time: log.milk.time ?? undefined, title: 'Minum susu', detail: MILK_LABELS[log.milk.status], kind: 'susu' });
  }
  if (log?.nap?.start) {
    entries.push({ time: log.nap.start, title: 'Tidur tengah hari', detail: log.nap.end ? `Hingga ${formatTime(log.nap.end)}` : 'Sedang tidur', kind: 'tidur' });
  }
  if (log?.nap?.end) {
    entries.push({ time: log.nap.end, title: 'Bangun tidur', detail: log.mood ? 'Bangun dengan ceria' : undefined, kind: 'bangun' });
  }
  if (log?.lunch) {
    entries.push({ time: log.lunch.time ?? undefined, title: 'Makan tengah hari', detail: MEAL_LABELS[log.lunch.status], kind: 'makan' });
  }
  if (att?.checkOut) {
    entries.push({ time: att.checkOut, title: 'Daftar keluar', detail: 'Dijemput pulang', kind: 'keluar' });
  }
  return entries.sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'));
}

export function Timeline({ entries, testId }: { entries: TimelineEntry[]; testId?: string }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-8 text-center text-sm text-slate-500">
        Tiada catatan masa untuk hari ini lagi.
      </p>
    );
  }
  return (
    <ol data-testid={testId} className="relative ml-3 space-y-5 border-l-2 border-teal-100 pl-6">
      {entries.map((e, i) => {
        const style = KIND_STYLE[e.kind];
        return (
          <li key={`${e.title}-${i}`} className="relative">
            <span className={cn('absolute top-0 -left-[37px] flex h-7 w-7 items-center justify-center rounded-full', style.cls)}>
              <style.icon className="h-3.5 w-3.5" />
            </span>
            <p className="text-xs font-semibold text-teal-600">{e.time ? formatTime(e.time) : '—'}</p>
            <p className="mt-0.5 text-sm font-medium text-slate-900">{e.title}</p>
            {e.detail && <p className="text-xs text-slate-500">{e.detail}</p>}
          </li>
        );
      })}
    </ol>
  );
}
