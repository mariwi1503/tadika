import { useState } from 'react';
import type { CalendarEvent, EventType } from '@/types';
import { createEvent, deleteEvent, EVENT_TYPES, updateEvent } from '@/lib/storage/repositories/calendar';
import { EVENT_TYPE_LABELS } from '@/lib/labels';
import { todayISO } from '@/lib/format';
import { logActivity } from '@/lib/storage/repositories/activityLogs';
import { getSession } from '@/lib/auth';
import { CalendarView } from '@/components/shared/CalendarView';
import { PageHeader } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CalendarAdmin() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [presetDate, setPresetDate] = useState(todayISO());

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader description="Aktiviti tadika, cuti, mesyuarat dan acara istimewa." />
      <CalendarView
        role="ADMIN"
        canManage
        onAddEvent={(d) => {
          setEditing(null);
          setPresetDate(d);
          setOpen(true);
        }}
        onEditEvent={(e) => {
          setEditing(e);
          setPresetDate(e.date);
          setOpen(true);
        }}
      />
      {open && <EventDialog key={editing?.id ?? presetDate} event={editing} presetDate={presetDate} onClose={() => setOpen(false)} />}
    </div>
  );
}

function EventDialog({ event, presetDate, onClose }: { event: CalendarEvent | null; presetDate: string; onClose: () => void }) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [date, setDate] = useState(event?.date ?? presetDate);
  const [type, setType] = useState<EventType>(event?.type ?? 'aktiviti');
  const [note, setNote] = useState(event?.note ?? '');
  const [audience, setAudience] = useState<CalendarEvent['audience']>(event?.audience ?? 'semua');

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" data-testid="calendar-event-dialog">
        <DialogTitle>{event ? 'Kemaskini Acara' : 'Tambah Acara'}</DialogTitle>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="ce-title">Tajuk</Label>
            <Input id="ce-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="cth. Sukaneka Tadika" data-testid="calendar-event-title" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ce-date">Tarikh</Label>
              <Input id="ce-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} data-testid="calendar-event-date" />
            </div>
            <div className="space-y-1.5">
              <Label>Jenis</Label>
              <Select value={type} onValueChange={(v: string) => setType(v as EventType)}>
                <SelectTrigger data-testid="calendar-event-type">
                  <SelectValue>{EVENT_TYPE_LABELS[type]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {EVENT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Papar Kepada</Label>
            <Select value={audience} onValueChange={(v: string) => setAudience(v as CalendarEvent['audience'])}>
              <SelectTrigger data-testid="calendar-event-audience">
                <SelectValue>{audience === 'semua' ? 'Semua' : audience === 'guru' ? 'Guru' : 'Ibu Bapa'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua</SelectItem>
                <SelectItem value="guru">Guru</SelectItem>
                <SelectItem value="ibu_bapa">Ibu Bapa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ce-note">Catatan</Label>
            <Textarea id="ce-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} data-testid="calendar-event-note" />
          </div>
        </div>
        <DialogFooter>
          {event && (
            <Button
              variant="destructive"
              className="mr-auto"
              data-testid="calendar-event-delete"
              onClick={() => {
                const session = getSession();
                deleteEvent(event.id);
                logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Memadam acara kalendar', event.title);
                toast.success('Acara dipadam');
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4" /> Padam
            </Button>
          )}
          <Button variant="outline" onClick={onClose} data-testid="calendar-event-cancel">
            Batal
          </Button>
          <Button
            data-testid="calendar-event-save"
            onClick={() => {
              if (!title.trim() || !date) {
                toast.error('Tajuk dan tarikh diperlukan');
                return;
              }
              const session = getSession();
              if (event) {
                updateEvent(event.id, { title: title.trim(), date, type, note, audience });
                logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Mengemaskini acara kalendar', title);
                toast.success('Acara dikemaskini');
              } else {
                createEvent({ title: title.trim(), date, type, note, audience });
                logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Menambah acara kalendar', title);
                toast.success('Acara ditambah');
              }
              onClose();
            }}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
