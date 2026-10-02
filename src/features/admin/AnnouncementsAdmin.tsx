import { useState } from 'react';
import type { Announcement, AnnouncementAudience } from '@/types';
import { createAnnouncement, deleteAnnouncement, getAnnouncements, updateAnnouncement } from '@/lib/storage/repositories/announcements';
import { getClasses } from '@/lib/storage/repositories/classes';
import { notifyRoles } from '@/lib/storage/repositories/notifications';
import { logActivity } from '@/lib/storage/repositories/activityLogs';
import { getSession } from '@/lib/auth';
import { AUDIENCE_LABELS } from '@/lib/labels';
import { formatDateShort, todayISO } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { EmptyState, PageHeader, StatusPill } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AnnouncementsAdmin() {
  useStore();
  const announcements = getAnnouncements();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const audienceRoles = (a: AnnouncementAudience): ('TEACHER' | 'PARENT')[] =>
    a === 'semua' ? ['TEACHER', 'PARENT'] : a === 'guru' ? ['TEACHER'] : ['PARENT'];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        description="Pengumuman dipaparkan kepada kumpulan sasaran yang berkaitan."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            data-testid="announcements-add-button"
          >
            <Plus className="h-4 w-4" /> Pengumuman Baharu
          </Button>
        }
      />

      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="Belum ada pengumuman" description="Ciptakan pengumuman pertama untuk guru dan ibu bapa." testId="announcements-empty" />
      ) : (
        <ul className="space-y-3" data-testid="announcements-list">
          {announcements.map((a) => (
            <li key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]" data-testid={`announcements-item-${a.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{a.title}</h2>
                    <StatusPill label={AUDIENCE_LABELS[a.audience]} tone={a.audience === 'semua' ? 'brand' : a.audience === 'guru' ? 'info' : 'warning'} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{a.content}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {formatDateShort(a.date)} · Oleh {a.authorName}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Kemaskini"
                    data-testid={`announcements-edit-${a.id}`}
                    onClick={() => {
                      setEditing(a);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Padam"
                    className="text-rose-500 hover:bg-rose-50"
                    data-testid={`announcements-delete-${a.id}`}
                    onClick={() => {
                      deleteAnnouncement(a.id);
                      logActivity(getSession()?.name ?? 'Pentadbir', 'ADMIN', 'Memadam pengumuman', a.title);
                      toast.success('Pengumuman dipadam');
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && <AnnouncementForm key={editing?.id ?? 'new'} announcement={editing} onClose={() => setOpen(false)} audienceRoles={audienceRoles} />}
    </div>
  );
}

function AnnouncementForm({
  announcement,
  onClose,
  audienceRoles,
}: {
  announcement: Announcement | null;
  onClose: () => void;
  audienceRoles: (a: AnnouncementAudience) => ('TEACHER' | 'PARENT')[];
}) {
  const classes = getClasses();
  const [title, setTitle] = useState(announcement?.title ?? '');
  const [content, setContent] = useState(announcement?.content ?? '');
  const [audience, setAudience] = useState<AnnouncementAudience>(announcement?.audience ?? 'semua');
  const [classId, setClassId] = useState(announcement?.classId ?? '');
  const [date, setDate] = useState(announcement?.date ?? todayISO());

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg" data-testid="announcements-form-dialog">
        <DialogTitle>{announcement ? 'Kemaskini Pengumuman' : 'Pengumuman Baharu'}</DialogTitle>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="af-title">Tajuk</Label>
            <Input id="af-title" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="announcements-form-title" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="af-content">Kandungan</Label>
            <Textarea id="af-content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} data-testid="announcements-form-content" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={(v: string) => setAudience(v as AnnouncementAudience)}>
                <SelectTrigger data-testid="announcements-form-audience">
                  <SelectValue>{AUDIENCE_LABELS[audience]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(AUDIENCE_LABELS) as AnnouncementAudience[]).map((a) => (
                    <SelectItem key={a} value={a}>
                      {AUDIENCE_LABELS[a]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {audience === 'kelas' && (
              <div className="space-y-1.5">
                <Label>Kelas</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger data-testid="announcements-form-class">
                    <SelectValue>{(v: string) => classes.find((c) => c.id === v)?.name ?? 'Pilih kelas'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="af-date">Tarikh</Label>
              <Input id="af-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} data-testid="announcements-form-date" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="announcements-form-cancel">
            Batal
          </Button>
          <Button
            data-testid="announcements-form-save"
            onClick={() => {
              if (!title.trim() || !content.trim()) {
                toast.error('Tajuk dan kandungan diperlukan');
                return;
              }
              if (audience === 'kelas' && !classId) {
                toast.error('Pilih kelas untuk pengumuman kelas tertentu');
                return;
              }
              const session = getSession();
              const data = {
                title: title.trim(),
                content: content.trim(),
                audience,
                classId: audience === 'kelas' ? classId : null,
                date,
                authorName: session?.name ?? 'Pentadbir',
              };
              if (announcement) {
                updateAnnouncement(announcement.id, data);
                logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Mengemaskini pengumuman', data.title);
                toast.success('Pengumuman dikemaskini');
              } else {
                createAnnouncement({ ...data, createdAt: new Date().toISOString() });
                notifyRoles(audienceRoles(audience), 'Pengumuman baharu daripada tadika', data.title);
                logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Menerbitkan pengumuman', `${data.title}`);
                toast.success('Pengumuman diterbitkan');
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
