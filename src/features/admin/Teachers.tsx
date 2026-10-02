import { useState } from 'react';
import type { Teacher } from '@/types';
import { createTeacher, deleteTeacher, getTeachers, updateTeacher } from '@/lib/storage/repositories/teachers';
import { getClasses, updateClass } from '@/lib/storage/repositories/classes';
import { logActivity } from '@/lib/storage/repositories/activityLogs';
import { getSession } from '@/lib/auth';
import { useStore } from '@/hooks/useStore';
import { EmptyState, PageHeader, StatusPill } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BadgeCheck, MoreHorizontal, Pencil, Plus, Trash2, UserRound } from 'lucide-react';
import { toast } from 'sonner';

export default function Teachers() {
  useStore();
  const teachers = getTeachers();
  const classes = getClasses();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  const classLabel = (id: string | null) => classes.find((c) => c.id === id)?.name ?? 'Tiada kelas';

  const removeTeacher = (t: Teacher) => {
    const session = getSession();
    // Lepas kelas yang dipegang guru ini
    classes.filter((c) => c.teacherId === t.id).forEach((c) => updateClass(c.id, { teacherId: null }));
    deleteTeacher(t.id);
    logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Memadam guru', t.fullName);
    toast.success('Guru dipadam');
    setDeleteTarget(null);
  };

  return (
    <div>
      <PageHeader
        description={`${teachers.length} guru berdaftar`}
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            data-testid="teachers-add-button"
          >
            <Plus className="h-4 w-4" /> Tambah Guru
          </Button>
        }
      />

      {teachers.length === 0 ? (
        <EmptyState icon={UserRound} title="Tiada guru berdaftar" description="Tambahkan guru pertama anda." testId="teachers-empty" />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]" data-testid="teachers-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guru</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((t) => (
                <TableRow key={t.id} data-testid={`teachers-row-${t.id}`}>
                  <TableCell>
                    <span className="block text-sm font-semibold text-slate-900">{t.fullName}</span>
                    <span className="block text-xs text-slate-400">{t.email}</span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{t.phone}</TableCell>
                  <TableCell className="text-sm text-slate-600">{classLabel(t.classId)}</TableCell>
                  <TableCell>
                    <StatusPill label={t.active ? 'Aktif' : 'Tidak Aktif'} tone={t.active ? 'success' : 'neutral'} testId={`teachers-status-${t.id}`} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" data-testid={`teachers-actions-${t.id}`} aria-label="Tindakan">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(t);
                            setFormOpen(true);
                          }}
                          data-testid={`teachers-edit-${t.id}`}
                        >
                          <Pencil className="h-4 w-4" /> Kemaskini
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(t)} data-testid={`teachers-delete-${t.id}`}>
                          <Trash2 className="h-4 w-4" /> Padam
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {formOpen && (
        <TeacherForm
          key={editing?.id ?? 'new'}
          teacher={editing}
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
          onClose={() => setFormOpen(false)}
        />
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm" data-testid="teachers-delete-dialog">
          <DialogTitle>Padam guru?</DialogTitle>
          <p className="text-sm text-slate-500">{deleteTarget?.fullName} akan dipadam dan kelas yang dipegang akan dikosongkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} data-testid="teachers-delete-cancel">
              Batal
            </Button>
            <Button variant="destructive" onClick={() => deleteTarget && removeTeacher(deleteTarget)} data-testid="teachers-delete-confirm">
              Padam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeacherForm({
  teacher,
  classes,
  onClose,
}: {
  teacher: Teacher | null;
  classes: { id: string; name: string }[];
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState(teacher?.fullName ?? '');
  const [email, setEmail] = useState(teacher?.email ?? '');
  const [phone, setPhone] = useState(teacher?.phone ?? '');
  const [classId, setClassId] = useState(teacher?.classId ?? '');
  const [active, setActive] = useState(teacher?.active ?? true);

  const save = () => {
    if (!fullName.trim()) {
      toast.error('Nama guru diperlukan');
      return;
    }
    const session = getSession();
    if (teacher) {
      // Kelas lama yang dipegang guru lain untuk kelas ini dikosongkan (satu guru satu kelas)
      getClasses()
        .filter((c) => c.teacherId === teacher.id && c.id !== classId)
        .forEach((c) => updateClass(c.id, { teacherId: null }));
      getClasses()
        .filter((c) => c.teacherId !== teacher.id && c.id === classId)
        .forEach((c) => {
          const holder = getTeachers().find((t) => t.classId === c.id && t.id !== teacher.id);
          if (holder) updateTeacher(holder.id, { classId: null });
        });
      updateTeacher(teacher.id, { fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), classId: classId || null, active });
      logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Mengemaskini guru', fullName);
      toast.success('Maklumat guru dikemaskini');
    } else {
      const created = createTeacher({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), classId: classId || null, active });
      getClasses()
        .filter((c) => c.teacherId !== created.id && c.id === classId)
        .forEach((c) => {
          const holder = getTeachers().find((t) => t.classId === c.id && t.id !== created.id);
          if (holder) updateTeacher(holder.id, { classId: null });
        });
      logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Menambah guru', fullName);
      toast.success('Guru ditambah');
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" data-testid="teachers-form-dialog">
        <DialogTitle>{teacher ? 'Kemaskini Guru' : 'Tambah Guru'}</DialogTitle>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="tf-name">Nama</Label>
            <Input id="tf-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="cth. Cikgu Sarah Ahmad" data-testid="teachers-form-name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tf-email">Email</Label>
            <Input id="tf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="teachers-form-email" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tf-phone">Telefon</Label>
              <Input id="tf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="teachers-form-phone" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={active ? 'aktif' : 'tidak'} onValueChange={(v: string) => setActive(v === 'aktif')}>
                <SelectTrigger data-testid="teachers-form-status">
                  <SelectValue>{active ? 'Aktif' : 'Tidak Aktif'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">
                    <BadgeCheck className="mr-1 inline h-3.5 w-3.5" /> Aktif
                  </SelectItem>
                  <SelectItem value="tidak">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Kelas</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger data-testid="teachers-form-class">
                <SelectValue>{(v: string) => classes.find((c) => c.id === v)?.name ?? 'Tiada kelas'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tiada">Tiada kelas</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="teachers-form-cancel">
            Batal
          </Button>
          <Button onClick={save} data-testid="teachers-form-save">
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
