import { useMemo, useState } from 'react';
import type { CalendarEvent, EventType, Role } from '@/types';
import { getEventsFor } from '@/lib/storage/repositories/calendar';
import { EVENT_TYPE_LABELS } from '@/lib/labels';
import { formatDate, monthLabel, todayISO } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const EVENT_COLORS: Record<EventType, string> = {
  aktiviti: 'bg-teal-500',
  acara: 'bg-amber-500',
  cuti: 'bg-rose-500',
  cuti_guru: 'bg-slate-400',
  mesyuarat: 'bg-indigo-500',
  hari_terbuka: 'bg-emerald-500',
  aktiviti_kelas: 'bg-sky-500',
  penutupan: 'bg-rose-700',
};

interface CalendarViewProps {
  role: Role;
  canManage?: boolean;
  onAddEvent?: (dateIso: string) => void;
  onEditEvent?: (event: CalendarEvent) => void;
}

export function CalendarView({ role, canManage, onAddEvent, onEditEvent }: CalendarViewProps) {
  useStore();
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState<string>(todayISO());

  const events = useMemo(() => getEventsFor(role), [role]);
  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const out: (string | null)[] = [];
    for (let i = 0; i < startPad; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      out.push(`${view.year}-${String(view.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [view]);

  const dayEvents = byDate.get(selected) ?? [];
  const today = todayISO();

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold text-slate-900" data-testid="calendar-month-label">
            {monthLabel(view.year, view.month)}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Bulan sebelum"
              data-testid="calendar-prev-month"
              onClick={() =>
                setView(({ year, month }) =>
                  month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Bulan berikut"
              data-testid="calendar-next-month"
              onClick={() =>
                setView(({ year, month }) =>
                  month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
          {['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((iso, idx) =>
            iso === null ? (
              <div key={`pad-${idx}`} />
            ) : (
              <button
                key={iso}
                data-testid={`calendar-day-${iso}`}
                onClick={() => setSelected(iso)}
                className={cn(
                  'relative flex h-11 flex-col items-center justify-center rounded-lg text-sm transition-colors sm:h-12',
                  iso === selected && 'bg-teal-600 font-semibold text-white',
                  iso !== selected && iso === today && 'ring-1 ring-teal-400',
                  iso !== selected && 'text-slate-700 hover:bg-slate-100',
                )}
              >
                {Number(iso.slice(8, 10))}
                <span className="mt-0.5 flex h-1.5 items-center gap-0.5">
                  {(byDate.get(iso) ?? []).slice(0, 3).map((e) => (
                    <span key={e.id} className={cn('h-1.5 w-1.5 rounded-full', iso === selected ? 'bg-white/90' : EVENT_COLORS[e.type])} />
                  ))}
                </span>
              </button>
            ),
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3">
          {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className={cn('h-2 w-2 rounded-full', EVENT_COLORS[t])} />
              {EVENT_TYPE_LABELS[t]}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900" data-testid="calendar-selected-date">
            {formatDate(selected)}
          </h2>
          {canManage && onAddEvent && (
            <Button size="sm" onClick={() => onAddEvent(selected)} data-testid="calendar-add-event-button">
              <Plus className="h-4 w-4" /> Tambah Acara
            </Button>
          )}
        </div>
        {dayEvents.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-8 text-center text-sm text-slate-500">
            Tiada acara pada tarikh ini.
          </p>
        ) : (
          <ul className="space-y-2">
            {dayEvents.map((e) => (
              <li key={e.id}>
                <button
                  data-testid={`calendar-event-${e.id}`}
                  disabled={!canManage || !onEditEvent}
                  onClick={() => onEditEvent?.(e)}
                  className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] disabled:cursor-default"
                >
                  <span className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', EVENT_COLORS[e.type])} />
                  <span className="min-w-0">
                    <span className="block font-medium text-slate-900">{e.title}</span>
                    <span className="block text-xs text-slate-500">
                      {EVENT_TYPE_LABELS[e.type]} · {e.audience === 'semua' ? 'Semua' : e.audience === 'guru' ? 'Guru' : 'Ibu Bapa'}
                    </span>
                    {e.note && <span className="mt-1 block text-xs text-slate-500">{e.note}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
