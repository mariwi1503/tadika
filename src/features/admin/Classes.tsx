import { useState } from 'react';
import type { Class as ClassType } from '@/types';
import { createClass, deleteClass, getClasses, updateClass } from '@/lib/storage/repositories/classes';
import { getStudents, updateStudent } from '@/lib/storage/repositories/students';
import { getTeacherById, getTeachers, updateTeacher } from '@/lib/storage/repositories/teachers';
import { logActivity } from '@/lib/storage/repositories/activityLogs';
import { getSession } from '@/lib/auth';
import { useStore } from '@/hooks/useStore';
import { Avatar, EmptyState, PageHeader } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BookOpen, MoreHorizontal, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function Classes() {
  useStore();
  const classes = getClasses();
  const students = getStudents();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClassType | null>(null);
  const [rosterFor, setRosterFor] = useState<ClassType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClassType | null>(null);

  const studentsIn = (classId: string) => students.filter((s) => s.classId === classId && s.status === 'approved');

  return (
    <div>
      <PageHeader
        description={`${classes.length} kelas aktif`}
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            data-testid="classes-add-button"
          >
            <Plus className="h-4 w-4" /> Tambah Kelas
          </Button>
        }
      />

      {classes.length === 0 ? (
        <EmptyState icon={BookOpen} title="Tiada kelas" description="Ciptakan kelas pertama tadika anda." testId="classes-empty" />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" data-testid="classes-grid">
          {classes.map((c) => {
            const teacher = getTeacherById(c.teacherId ?? '');
            const list = studentsIn(c.id);
            return (
              <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]" data-testid={`classes-card-${c.id}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">{c.name}</h2>
                    <p className="text-xs text-slate-500">
                      {c.ageGroup} · {c.room}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" data-testid={`classes-actions-${c.id}`} aria-label="Tindakan">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing(c);
                          setFormOpen(true);
                        }}
                        data-testid={`classes-edit-${c.id}`}
                      >
                        <Pencil className="h-4 w-4" /> Kemaskini
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(c)} data-testid={`classes-delete-${c.id}`}>
                        <Trash2 className="h-4 w-4" /> Padam
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-1.5 text-sm">
                  <p className="flex items-center gap-2 text-slate-600">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                      <Users className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-medium text-slate-900">{list.length}</span> murid
                  </p>
                  {teacher && (
                    <p className="flex items-center gap-2 text-slate-600">
                      <Avatar name={teacher.fullName} size="sm" />
                      {teacher.fullName}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Select
                    value={c.teacherId ?? 'tiada'}
                    onValueChange={(v: string) => {
                      const session = getSession();
                      // satu guru satu kelas
                      getTeachers()
                        .filter((t) => t.classId === c.id && t.id !== v)
                        .forEach((t) => updateTeacher(t.id, { classId: null }));
                      if (v !== 'tiada') {
                        const holder = getTeachers().find((t) => t.classId === v && t.id !== (c.teacherId ?? ''));
                        if (holder) updateTeacher(holder.id, { classId: null });
                        updateTeacher(v, { classId: c.id });
                      }
                      updateClass(c.id, { teacherId: v === 'tiada' ? null : v });
                      logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Menetapkan guru kelas', `${c.name}`);
                      toast.success('Guru kelas dikemaskini');
                    }}
                  >
                    <SelectTrigger size="sm" className="flex-1" data-testid={`classes-assign-teacher-${c.id}`}>
                      <SelectValue>{(v: string) => getTeacherById(v)?.fullName ?? 'Pilih guru'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tiada">Tiada guru</SelectItem>
                      {getTeachers().map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setRosterFor(c)} data-testid={`classes-manage-students-${c.id}`}>
                    Urus Murid
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <ClassForm
          key={editing?.id ?? 'new'}
          klass={editing}
          onClose={() => setFormOpen(false)}
        />
      )}

      {rosterFor && (
        <RosterDialog
          key={rosterFor.id}
          klass={rosterFor}
          students={students.map((s) => ({ id: s.id, name: s.fullName, classId: s.classId }))}
          onClose={() => setRosterFor(null)}
        />
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm" data-testid="classes-delete-dialog">
          <DialogTitle>Padam kelas?</DialogTitle>
          <p className="text-sm text-slate-500">
            {deleteTarget?.name} akan dipadam. Murid dalam kelas ini tidak dipadam tetapi akan kekal tanpa kelas.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} data-testid="classes-delete-cancel">
              Batal
            </Button>
            <Button
              variant="destructive"
              data-testid="classes-delete-confirm"
              onClick={() => {
                if (!deleteTarget) return;
                const session = getSession();
                studentsIn(deleteTarget.id).forEach((s) => updateStudent(s.id, { classId: null }));
                getTeachers()
                  .filter((t) => t.classId === deleteTarget.id)
                  .forEach((t) => updateTeacher(t.id, { classId: null }));
                deleteClass(deleteTarget.id);
                logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Memadam kelas', deleteTarget.name);
                toast.success('Kelas dipadam');
                setDeleteTarget(null);
              }}
            >
              Padam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClassForm({ klass, onClose }: { klass: ClassType | null; onClose: () => void }) {
  const [name, setName] = useState(klass?.name ?? '');
  const [ageGroup, setAgeGroup] = useState(klass?.ageGroup ?? '');
  const [room, setRoom] = useState(klass?.room ?? '');

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" data-testid="classes-form-dialog">
        <DialogTitle>{klass ? 'Kemaskini Kelas' : 'Tambah Kelas'}</DialogTitle>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cf-name">Nama Kelas</Label>
            <Input id="cf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. Kelas Melur" data-testid="classes-form-name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cf-age">Kumpulan Umur</Label>
              <Input id="cf-age" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} placeholder="cth. 4 - 5 tahun" data-testid="classes-form-age" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cf-room">Bilik</Label>
              <Input id="cf-room" value={room} onChange={(e) => setRoom(e.target.value)} data-testid="classes-form-room" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="classes-form-cancel">
            Batal
          </Button>
          <Button
            data-testid="classes-form-save"
            onClick={() => {
              if (!name.trim()) {
                toast.error('Nama kelas diperlukan');
                return;
              }
              const session = getSession();
              if (klass) {
                updateClass(klass.id, { name: name.trim(), ageGroup, room });
                logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Mengemaskini kelas', name);
                toast.success('Kelas dikemaskini');
              } else {
                createClass({ name: name.trim(), ageGroup, room, teacherId: null });
                logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Menambah kelas', name);
                toast.success('Kelas ditambah');
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

function RosterDialog({
  klass,
  students,
  onClose,
}: {
  klass: ClassType;
  students: { id: string; name: string; classId: string | null }[];
  onClose: () => void;
}) {
  const inClass = students.filter((s) => s.classId === klass.id);
  const others = students.filter((s) => s.classId !== klass.id);

  const move = (id: string, to: boolean) => {
    updateStudent(id, { classId: to ? klass.id : null });
    toast.success(to ? 'Murid ditambah ke kelas' : 'Murid dikeluarkan dari kelas');
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md" data-testid="classes-roster-dialog">
        <DialogTitle>Murid — {klass.name}</DialogTitle>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-400 uppercase">Dalam kelas ({inClass.length})</p>
            {inClass.length === 0 ? (
              <p className="text-sm text-slate-400">Belum ada murid.</p>
            ) : (
              <ul className="space-y-1.5" data-testid="classes-roster-in">
                {inClass.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    {s.name}
                    <Button variant="ghost" size="xs" onClick={() => move(s.id, false)} data-testid={`classes-roster-remove-${s.id}`}>
                      Keluar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-400 uppercase">Murid lain ({others.length})</p>
            <ul className="max-h-52 space-y-1.5 overflow-y-auto" data-testid="classes-roster-others">
              {others.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-sm">
                  {s.name}
                  <Button variant="ghost" size="xs" onClick={() => move(s.id, true)} data-testid={`classes-roster-add-${s.id}`}>
                    Tambah
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} data-testid="classes-roster-done">
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
