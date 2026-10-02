import { useState } from 'react';
import type { IncidentLevel, Student } from '@/types';
import { createIncident, getIncidents } from '@/lib/storage/repositories/incidents';
import { getClassById } from '@/lib/storage/repositories/classes';
import { getStudentsByClass } from '@/lib/storage/repositories/students';
import { getTeacherById } from '@/lib/storage/repositories/teachers';
import { notifyRoles } from '@/lib/storage/repositories/notifications';
import { logActivity } from '@/lib/storage/repositories/activityLogs';
import { getSession } from '@/lib/auth';
import { INCIDENT_LEVEL_LABELS, INCIDENT_LEVEL_TONES } from '@/lib/labels';
import { formatDateShort, formatTime, nowHM, todayISO } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { EmptyState, SectionCard, StatusPill } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const LEVELS: IncidentLevel[] = ['rendah', 'sederhana', 'tinggi'];

const LEVEL_CLS: Record<IncidentLevel, string> = {
  rendah: 'border-sky-500 bg-sky-50 text-sky-700',
  sederhana: 'border-amber-500 bg-amber-50 text-amber-700',
  tinggi: 'border-rose-500 bg-rose-50 text-rose-700',
};

export default function TeacherIncidents() {
  useStore();
  const session = getSession();
  const teacher = getTeacherById(session?.teacherId ?? '');
  const cls = getClassById(teacher?.classId ?? '');
  const students = cls ? getStudentsByClass(cls.id) : [];
  const classIds = new Set(students.map((s) => s.id));
  const incidents = getIncidents().filter((i) => classIds.has(i.studentId));
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Insiden Kelas"
        description="Laporkan insiden supaya pentadbir & ibu bapa dimaklumkan."
        action={
          <Button size="sm" onClick={() => setOpen(true)} data-testid="teacher-incident-report-button">
            <Plus className="h-4 w-4" /> Lapor Insiden
          </Button>
        }
        testId="teacher-incidents-card"
      >
        {incidents.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="Tiada insiden" description="Alhamdulillah, tiada insiden direkodkan untuk kelas ini." testId="teacher-incidents-empty" />
        ) : (
          <ul className="space-y-2" data-testid="teacher-incidents-list">
            {incidents.map((i) => {
              const student = students.find((s) => s.id === i.studentId);
              return (
                <li key={i.id} className="rounded-2xl border border-slate-200 bg-white p-4" data-testid={`teacher-incident-${i.id}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{i.type}</p>
                    <StatusPill label={INCIDENT_LEVEL_LABELS[i.level]} tone={INCIDENT_LEVEL_TONES[i.level]} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {student?.fullName} · {formatDateShort(i.date)} · {formatTime(i.time) || '—'}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{i.description}</p>
                  <p className="mt-1 text-xs text-slate-500">Tindakan: {i.action}</p>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {open && <IncidentForm key="incident-form" students={students} onClose={() => setOpen(false)} />}
    </div>
  );
}

function IncidentForm({ students, onClose }: { students: Student[]; onClose: () => void }) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? '');
  const [type, setType] = useState('');
  const [time, setTime] = useState(nowHM());
  const [description, setDescription] = useState('');
  const [action, setAction] = useState('');
  const [level, setLevel] = useState<IncidentLevel>('rendah');

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md" data-testid="teacher-incident-dialog">
        <DialogTitle>Lapor Insiden</DialogTitle>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Murid</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger data-testid="teacher-incident-student">
                  <SelectValue>{(v: string) => students.find((s) => s.id === v)?.fullName ?? 'Pilih murid'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inc-time">Masa</Label>
              <Input id="inc-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} data-testid="teacher-incident-time" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inc-type">Jenis Insiden</Label>
            <Input id="inc-type" value={type} onChange={(e) => setType(e.target.value)} placeholder="cth. Jatuh semasa bermain" data-testid="teacher-incident-type" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inc-desc">Penerangan</Label>
            <Textarea id="inc-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} data-testid="teacher-incident-description" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inc-action">Tindakan Guru</Label>
            <Textarea id="inc-action" value={action} onChange={(e) => setAction(e.target.value)} rows={2} data-testid="teacher-incident-action" />
          </div>
          <div className="space-y-1.5">
            <Label>Tahap</Label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  data-testid={`teacher-incident-level-${l}`}
                  onClick={() => setLevel(l)}
                  className={cn(
                    'rounded-xl border px-2 py-2 text-sm font-medium transition-colors',
                    level === l ? LEVEL_CLS[l] : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {INCIDENT_LEVEL_LABELS[l]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="teacher-incident-cancel">
            Batal
          </Button>
          <Button
            data-testid="teacher-incident-save"
            onClick={() => {
              if (!type.trim() || !studentId) {
                toast.error('Pilih murid dan isi jenis insiden');
                return;
              }
              const session = getSession();
              const student = students.find((s) => s.id === studentId);
              createIncident({
                studentId,
                date: todayISO(),
                time,
                type: type.trim(),
                description: description.trim(),
                action: action.trim(),
                level,
                reportedBy: session?.name ?? 'Cikgu',
                reportedAt: new Date().toISOString(),
              });
              notifyRoles(['ADMIN'], 'Insiden dilaporkan', `${session?.name ?? 'Cikgu'} melaporkan insiden ${level === 'rendah' ? 'tahap rendah' : level === 'sederhana' ? 'tahap sederhana' : 'tahap tinggi'} melibatkan ${student?.fullName ?? 'murid'}.`);
              notifyRoles(['PARENT'], `Insiden ${student?.nickname ?? ''}`, `${student?.fullName ?? 'Murid'} — ${type.trim()}. Tindakan: ${action.trim() || 'Dipantau oleh guru'}.`);
              logActivity(session?.name ?? 'Cikgu', 'TEACHER', 'Melaporkan insiden', `${type.trim()} — ${student?.fullName ?? ''}`);
              toast.success('Insiden dilaporkan');
              onClose();
            }}
          >
            Hantar Laporan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
