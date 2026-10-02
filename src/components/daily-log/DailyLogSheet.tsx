import { useEffect, useState } from 'react';
import type { ActivityEntry, MealStatus, MilkStatus, Mood, Student } from '@/types';
import { getDailyLogFor, saveDailyLog } from '@/lib/storage/repositories/dailyLogs';
import { getParentsOfStudent } from '@/lib/storage/repositories/parents';
import { notifyRoles } from '@/lib/storage/repositories/notifications';
import { logActivity } from '@/lib/storage/repositories/activityLogs';
import { ACTIVITY_SUGGESTIONS, MEAL_LABELS, MILK_LABELS, MOOD_LABELS } from '@/lib/labels';
import { minutesBetween, nowHM, todayISO } from '@/lib/format';
import { getSession } from '@/lib/auth';
import { useStore } from '@/hooks/useStore';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Draft {
  breakfast: { status: MealStatus; time: string } | null;
  lunch: { status: MealStatus; time: string } | null;
  milk: { status: MilkStatus; time: string } | null;
  napStart: string;
  napEnd: string;
  activities: ActivityEntry[];
  mood: Mood | null;
  note: string;
}

const EMPTY_DRAFT: Draft = {
  breakfast: null,
  lunch: null,
  milk: null,
  napStart: '',
  napEnd: '',
  activities: [],
  mood: null,
  note: '',
};

function Segmented<T extends string>({
  options,
  value,
  onChange,
  testPrefix,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  testPrefix: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          data-testid={`${testPrefix}-${o.value}`}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors',
            value === o.value
              ? 'border-teal-600 bg-teal-50 text-teal-700'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function DailyLogSheet({
  open,
  onOpenChange,
  student,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}) {
  useStore();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [newActivity, setNewActivity] = useState('');
  const [newActivityTime, setNewActivityTime] = useState('');

  useEffect(() => {
    if (!open || !student) return;
    const existing = getDailyLogFor(student.id, todayISO());
    setDraft({
      breakfast: existing?.breakfast ? { status: existing.breakfast.status, time: existing.breakfast.time ?? '' } : null,
      lunch: existing?.lunch ? { status: existing.lunch.status, time: existing.lunch.time ?? '' } : null,
      milk: existing?.milk ? { status: existing.milk.status, time: existing.milk.time ?? '' } : null,
      napStart: existing?.nap?.start ?? '',
      napEnd: existing?.nap?.end ?? '',
      activities: existing?.activities ?? [],
      mood: existing?.mood ?? null,
      note: existing?.note ?? '',
    });
    setNewActivity('');
    setNewActivityTime(nowHM());
  }, [open, student]);

  if (!student) return null;

  const save = () => {
    const session = getSession();
    const recordedBy = session?.name ?? 'Cikgu';
    saveDailyLog(
      {
        studentId: student.id,
        date: todayISO(),
        breakfast: draft.breakfast ? { status: draft.breakfast.status, time: draft.breakfast.time || nowHM() } : null,
        lunch: draft.lunch ? { status: draft.lunch.status, time: draft.lunch.time || nowHM() } : null,
        milk: draft.milk ? { status: draft.milk.status, time: draft.milk.time || nowHM() } : null,
        nap: draft.napStart || draft.napEnd ? { start: draft.napStart || undefined, end: draft.napEnd || undefined } : null,
        activities: draft.activities,
        mood: draft.mood,
        note: draft.note,
      },
      recordedBy,
    );
    logActivity(recordedBy, 'TEACHER', 'Menambah rekod harian', `${student.fullName}`);
    const hasParent = getParentsOfStudent(student.id).length > 0;
    if (hasParent) {
      notifyRoles(['PARENT'], `Rekod harian ${student.nickname} telah dikemaskini`, `Cikgu merekodkan aktiviti harian untuk ${student.fullName} hari ini.`);
    }
    toast.success(`Rekod harian ${student.nickname} disimpan`);
    onOpenChange(false);
  };

  const addActivity = () => {
    const name = newActivity.trim();
    if (!name) return;
    if (draft.activities.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Aktiviti sudah direkodkan');
      return;
    }
    setDraft((d) => ({ ...d, activities: [...d.activities, { name, time: newActivityTime || nowHM() }] }));
    setNewActivity('');
    setNewActivityTime(nowHM());
  };

  const mealOptions = (Object.keys(MEAL_LABELS) as MealStatus[]).map((v) => ({ value: v, label: MEAL_LABELS[v] }));
  const milkOptions = (Object.keys(MILK_LABELS) as MilkStatus[]).map((v) => ({ value: v, label: MILK_LABELS[v] }));
  const moodOptions = (Object.keys(MOOD_LABELS) as Mood[]).map((v) => ({ value: v, label: MOOD_LABELS[v] }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[92svh] overflow-y-auto rounded-t-3xl p-0 sm:max-w-lg sm:mx-auto" data-testid="daily-log-sheet">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-5 py-4">
          <SheetTitle className="text-base">Rekod Harian — {student.fullName}</SheetTitle>
          <p className="text-xs text-slate-500">Isi mengikut kesesuaian. Simpan sekali di akhir.</p>
        </div>
        <div className="px-5 pb-5 pt-4">
          <Tabs defaultValue="makanan">
            <TabsList className="flex w-full flex-wrap">
              <TabsTrigger value="makanan" data-testid="dailylog-tab-makanan">Makanan</TabsTrigger>
              <TabsTrigger value="susu" data-testid="dailylog-tab-susu">Susu</TabsTrigger>
              <TabsTrigger value="tidur" data-testid="dailylog-tab-tidur">Tidur</TabsTrigger>
              <TabsTrigger value="aktiviti" data-testid="dailylog-tab-aktiviti">Aktiviti</TabsTrigger>
              <TabsTrigger value="perasaan" data-testid="dailylog-tab-perasaan">Perasaan</TabsTrigger>
              <TabsTrigger value="catatan" data-testid="dailylog-tab-catatan">Catatan</TabsTrigger>
            </TabsList>

            <TabsContent value="makanan" className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label>Sarapan</Label>
                <Segmented
                  options={mealOptions}
                  value={draft.breakfast?.status ?? null}
                  testPrefix="dailylog-breakfast"
                  onChange={(v) => setDraft((d) => ({ ...d, breakfast: { status: v, time: d.breakfast?.time || nowHM() } }))}
                />
                {draft.breakfast && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-slate-500">Masa</Label>
                    <Input
                      type="time"
                      value={draft.breakfast.time}
                      onChange={(e) => setDraft((d) => ({ ...d, breakfast: { ...d.breakfast!, time: e.target.value } }))}
                      className="w-36"
                      data-testid="dailylog-breakfast-time"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Makan Tengah Hari</Label>
                <Segmented
                  options={mealOptions}
                  value={draft.lunch?.status ?? null}
                  testPrefix="dailylog-lunch"
                  onChange={(v) => setDraft((d) => ({ ...d, lunch: { status: v, time: d.lunch?.time || nowHM() } }))}
                />
                {draft.lunch && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-slate-500">Masa</Label>
                    <Input
                      type="time"
                      value={draft.lunch.time}
                      onChange={(e) => setDraft((d) => ({ ...d, lunch: { ...d.lunch!, time: e.target.value } }))}
                      className="w-36"
                      data-testid="dailylog-lunch-time"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="susu" className="space-y-3 pt-4">
              <Label>Status Susu</Label>
              <Segmented
                options={milkOptions}
                value={draft.milk?.status ?? null}
                testPrefix="dailylog-milk"
                onChange={(v) => setDraft((d) => ({ ...d, milk: { status: v, time: d.milk?.time || nowHM() } }))}
              />
              {draft.milk && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-slate-500">Masa</Label>
                  <Input
                    type="time"
                    value={draft.milk.time}
                    onChange={(e) => setDraft((d) => ({ ...d, milk: { ...d.milk!, time: e.target.value } }))}
                    className="w-36"
                    data-testid="dailylog-milk-time"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="tidur" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="nap-start">Masa Mula</Label>
                  <Input id="nap-start" type="time" value={draft.napStart} onChange={(e) => setDraft((d) => ({ ...d, napStart: e.target.value }))} data-testid="dailylog-nap-start" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nap-end">Masa Tamat</Label>
                  <Input id="nap-end" type="time" value={draft.napEnd} onChange={(e) => setDraft((d) => ({ ...d, napEnd: e.target.value }))} data-testid="dailylog-nap-end" />
                </div>
              </div>
              {(draft.napStart || draft.napEnd) && (
                <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600" data-testid="dailylog-nap-duration">
                  Tempoh: {minutesBetween(draft.napStart, draft.napEnd) || '—'}
                </p>
              )}
            </TabsContent>

            <TabsContent value="aktiviti" className="space-y-3 pt-4">
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <Label htmlFor="activity-name">Aktiviti</Label>
                  <Input
                    id="activity-name"
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    placeholder="cth. Mewarna"
                    data-testid="dailylog-activity-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-time">Masa</Label>
                  <Input id="activity-time" type="time" value={newActivityTime} onChange={(e) => setNewActivityTime(e.target.value)} className="w-28" data-testid="dailylog-activity-time" />
                </div>
                <Button type="button" size="icon" onClick={addActivity} data-testid="dailylog-activity-add" aria-label="Tambah aktiviti">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ACTIVITY_SUGGESTIONS.filter((s) => !draft.activities.some((a) => a.name === s)).map((s) => (
                  <button
                    key={s}
                    type="button"
                    data-testid={`dailylog-activity-suggest-${s.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setDraft((d) => ({ ...d, activities: [...d.activities, { name: s, time: nowHM() }] }))}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    + {s}
                  </button>
                ))}
              </div>
              {draft.activities.length === 0 ? (
                <p className="text-sm text-slate-400">Belum ada aktiviti ditambah.</p>
              ) : (
                <ul className="space-y-2" data-testid="dailylog-activity-list">
                  {draft.activities.map((a, i) => (
                    <li key={`${a.name}-${i}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                      <span className="font-medium text-slate-800">{a.name}</span>
                      <span className="flex items-center gap-2 text-xs text-slate-500">
                        {a.time || '—'}
                        <button
                          type="button"
                          aria-label={`Padam aktiviti ${a.name}`}
                          data-testid={`dailylog-activity-remove-${i}`}
                          onClick={() => setDraft((d) => ({ ...d, activities: d.activities.filter((_, idx) => idx !== i) }))}
                          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="perasaan" className="pt-4">
              <Segmented
                options={moodOptions}
                value={draft.mood}
                testPrefix="dailylog-mood"
                onChange={(v) => setDraft((d) => ({ ...d, mood: d.mood === v ? null : v }))}
              />
              <p className="mt-3 text-xs text-slate-400">Ketik sekali untuk pilih, ketik lagi untuk batal.</p>
            </TabsContent>

            <TabsContent value="catatan" className="space-y-3 pt-4">
              <Label htmlFor="dailylog-note">Catatan Guru</Label>
              <Textarea
                id="dailylog-note"
                value={draft.note}
                onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                rows={5}
                placeholder="cth. Adam sangat aktif hari ini dan cukup makan."
                data-testid="dailylog-note"
              />
            </TabsContent>
          </Tabs>
        </div>
        <div className="sticky bottom-0 border-t border-slate-100 bg-white/95 p-4 backdrop-blur">
          <Button className="w-full" size="lg" onClick={save} data-testid="dailylog-save-button">
            Simpan Rekod Harian
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
