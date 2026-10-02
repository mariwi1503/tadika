import { useMemo, useState } from 'react';
import { Link, useNavigate } from '@/lib/router';
import type { Student, StudentStatus } from '@/types';
import { deleteStudent, getStudents, updateStudent } from '@/lib/storage/repositories/students';
import { getClasses } from '@/lib/storage/repositories/classes';
import { getParentsOfStudent } from '@/lib/storage/repositories/parents';
import { logActivity } from '@/lib/storage/repositories/activityLogs';
import { getSession } from '@/lib/auth';
import { STUDENT_STATUS_LABELS, STUDENT_STATUS_TONES, GENDER_LABELS } from '@/lib/labels';
import { ageFrom } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { Avatar, EmptyState, PageHeader, StatusPill } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Pencil, Plus, Search, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function Students() {
  useStore();
  const navigate = useNavigate();
  const classes = getClasses();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('semua');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const students = getStudents();
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students
      .filter((s) => (classFilter === 'semua' ? true : s.classId === classFilter))
      .filter((s) => (statusFilter === 'semua' ? true : s.status === statusFilter))
      .filter((s) => (q ? s.fullName.toLowerCase().includes(q) || s.nickname.toLowerCase().includes(q) : true))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [students, search, classFilter, statusFilter]);

  const classLabel = (id: string | null) => classes.find((c) => c.id === id)?.name ?? '—';

  return (
    <div>
      <PageHeader
        description={`${students.length} rekod murid berdaftar`}
        action={
          <Link to="/admin/registration" data-testid="students-new-registration-link">
            <Button data-testid="students-new-registration-button">
              <Plus className="h-4 w-4" /> Pendaftaran Baharu
            </Button>
          </Link>
        }
      />

      {/* Tapis & carian */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama murid..."
            className="pl-9"
            data-testid="students-search-input"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-44" data-testid="students-filter-class">
            <SelectValue>{(v: string) => (v === 'semua' ? 'Semua Kelas' : classLabel(v))}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Kelas</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="students-filter-status">
            <SelectValue>{(v: string) => (v === 'semua' ? 'Semua Status' : STUDENT_STATUS_LABELS[v as StudentStatus])}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Status</SelectItem>
            {(Object.keys(STUDENT_STATUS_LABELS) as StudentStatus[]).map((st) => (
              <SelectItem key={st} value={st}>
                {STUDENT_STATUS_LABELS[st]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Tiada rekod ditemui"
          description="Cuba ubah kata kunci carian atau penapis. Atau daftarkan murid baharu."
          action={
            <Link to="/admin/registration">
              <Button data-testid="students-empty-cta">
                <Plus className="h-4 w-4" /> Daftar Murid
              </Button>
            </Link>
          }
          testId="students-empty"
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]" data-testid="students-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Murid</TableHead>
                <TableHead>Umur</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Ibu Bapa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const parent = getParentsOfStudent(s.id)[0];
                return (
                  <TableRow key={s.id} data-testid={`students-row-${s.id}`}>
                    <TableCell>
                      <Link to={`/admin/students/${s.id}`} className="flex items-center gap-3 hover:underline" data-testid={`students-name-link-${s.id}`}>
                        <Avatar name={s.fullName} size="sm" />
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">{s.fullName}</span>
                          <span className="block text-xs text-slate-400">{GENDER_LABELS[s.gender]}</span>
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{ageFrom(s.dob)}</TableCell>
                    <TableCell className="text-sm text-slate-600">{classLabel(s.classId)}</TableCell>
                    <TableCell className="text-sm text-slate-600">{parent?.fullName ?? '—'}</TableCell>
                    <TableCell>
                      <StatusPill label={STUDENT_STATUS_LABELS[s.status]} tone={STUDENT_STATUS_TONES[s.status]} testId={`students-status-${s.id}`} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" data-testid={`students-actions-${s.id}`} aria-label="Tindakan">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/students/${s.id}`)} data-testid={`students-view-${s.id}`}>
                            Lihat Profil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditTarget(s)} data-testid={`students-edit-${s.id}`}>
                            <Pencil className="h-4 w-4" /> Kemaskini
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(s)} data-testid={`students-delete-${s.id}`}>
                            <Trash2 className="h-4 w-4" /> Padam
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog kemaskini */}
      {editTarget && (
        <EditDialog
          key={editTarget.id}
          student={editTarget}
          classes={classes}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Dialog padam */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm" data-testid="students-delete-dialog">
          <DialogTitle>Padam murid?</DialogTitle>
          <p className="text-sm text-slate-500">
            {deleteTarget?.fullName} akan dipadam bersama rujukan kelas. Rekod kehadiran &amp; bayaran lama kekal dalam senarai umum.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} data-testid="students-delete-cancel">
              Batal
            </Button>
            <Button
              variant="destructive"
              data-testid="students-delete-confirm"
              onClick={() => {
                if (!deleteTarget) return;
                const session = getSession();
                logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Memadam murid', deleteTarget.fullName);
                deleteStudent(deleteTarget.id);
                toast.success('Murid dipadam');
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

function EditDialog({
  student,
  classes,
  onClose,
}: {
  student: Student;
  classes: { id: string; name: string }[];
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState(student.fullName);
  const [nickname, setNickname] = useState(student.nickname);
  const [dob, setDob] = useState(student.dob);
  const [address, setAddress] = useState(student.address);
  const [classId, setClassId] = useState(student.classId ?? '');

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" data-testid="students-edit-dialog">
        <DialogTitle>Kemaskini Murid</DialogTitle>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-fullname">Nama Penuh</Label>
            <Input id="edit-fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} data-testid="students-edit-fullname" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-nickname">Nama Panggilan</Label>
              <Input id="edit-nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} data-testid="students-edit-nickname" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-dob">Tarikh Lahir</Label>
              <Input id="edit-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} data-testid="students-edit-dob" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Kelas</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger data-testid="students-edit-class">
                <SelectValue>{(v: string) => classes.find((c) => c.id === v)?.name ?? '—'}</SelectValue>
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
          <div className="space-y-1.5">
            <Label htmlFor="edit-address">Alamat</Label>
            <Input id="edit-address" value={address} onChange={(e) => setAddress(e.target.value)} data-testid="students-edit-address" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="students-edit-cancel">
            Batal
          </Button>
          <Button
            data-testid="students-edit-save"
            onClick={() => {
              const session = getSession();
              updateStudent(student.id, {
                fullName: fullName.trim() || student.fullName,
                nickname: nickname.trim(),
                dob,
                address,
                classId: classId || null,
              });
              logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Mengemaskini murid', fullName);
              toast.success('Maklumat murid dikemaskini');
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
