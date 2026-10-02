import { useState } from 'react';
import { Link, useNavigate, useParams } from '@/lib/router';
import type { Student, StudentStatus } from '@/types';
import { deleteStudent, getStudentById, updateStudent } from '@/lib/storage/repositories/students';
import { getParentsOfStudent } from '@/lib/storage/repositories/parents';
import { getAttendanceForStudent } from '@/lib/storage/repositories/attendance';
import { getDailyLogsForStudent } from '@/lib/storage/repositories/dailyLogs';
import { getIncidentsForStudent } from '@/lib/storage/repositories/incidents';
import { getInvoicesForStudent } from '@/lib/storage/repositories/invoices';
import { getPaymentsForStudent } from '@/lib/storage/repositories/payments';
import { getClassById } from '@/lib/storage/repositories/classes';
import { getTeacherForClass } from '@/lib/storage/repositories/teachers';
import { notifyRoles } from '@/lib/storage/repositories/notifications';
import { logActivity } from '@/lib/storage/repositories/activityLogs';
import { getSession } from '@/lib/auth';
import { useStore } from '@/hooks/useStore';
import {
  ATTENDANCE_LABELS,
  ATTENDANCE_TONES,
  GENDER_LABELS,
  INCIDENT_LEVEL_LABELS,
  INCIDENT_LEVEL_TONES,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_TONES,
  MEAL_LABELS,
  MILK_LABELS,
  MOOD_LABELS,
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_TONES,
} from '@/lib/labels';
import { ageFrom, formatDate, formatDateShort, formatRM, formatTime } from '@/lib/format';
import { Avatar, EmptyState, StatusPill } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { FileText, HeartPulse, Phone, Plus, ShieldCheck, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentProfile() {
  useStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const student = id ? getStudentById(id) : undefined;
  const [editOpen, setEditOpen] = useState(false);

  if (!student) {
    return (
      <EmptyState
        icon={UserRound}
        title="Murid tidak ditemui"
        description="Rekod mungkin telah dipadam."
        action={
          <Link to="/admin/students">
            <Button data-testid="profile-back-to-students">Kembali ke Senarai Murid</Button>
          </Link>
        }
        testId="student-profile-not-found"
      />
    );
  }

  const cls = getClassById(student.classId ?? '');
  const teacher = getTeacherForClass(student.classId ?? null);
  const parentsList = getParentsOfStudent(student.id);
  const attendance = getAttendanceForStudent(student.id);
  const logs = getDailyLogsForStudent(student.id);
  const incidents = getIncidentsForStudent(student.id);
  const invoices = getInvoicesForStudent(student.id);
  const payments = getPaymentsForStudent(student.id);
  const session = getSession();

  const decide = (status: StudentStatus) => {
    updateStudent(student.id, { status });
    if (status === 'approved') {
      notifyRoles(['PARENT'], 'Pendaftaran diluluskan', `Pendaftaran ${student.fullName} telah diluluskan. Selamat datang ke Tadika Ceria!`);
      logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Meluluskan pendaftaran', student.fullName);
      toast.success('Pendaftaran diluluskan');
    } else {
      logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Menolak pendaftaran', student.fullName);
      toast('Pendaftaran ditolak');
    }
  };

  const attendanceSummary = {
    hadir: attendance.filter((a) => a.status === 'hadir').length,
    lewat: attendance.filter((a) => a.status === 'lewat').length,
    tidak_hadir: attendance.filter((a) => a.status === 'tidak_hadir').length,
    cuti: attendance.filter((a) => a.status === 'cuti').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]" data-testid="student-profile-header">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={student.fullName} size="lg" testId="student-profile-avatar" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900" data-testid="student-profile-name">{student.fullName}</h1>
              <p className="text-sm text-slate-500">
                {cls?.name ?? 'Tiada kelas'} · {ageFrom(student.dob)} · {GENDER_LABELS[student.gender]}
              </p>
              <div className="mt-2">
                <StatusPill label={STUDENT_STATUS_LABELS[student.status]} tone={STUDENT_STATUS_TONES[student.status]} testId="student-profile-status" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {student.status === 'pending' && (
              <>
                <Button size="sm" onClick={() => decide('approved')} data-testid="student-approve-button">
                  <ShieldCheck className="h-4 w-4" /> Luluskan
                </Button>
                <Button size="sm" variant="outline" onClick={() => decide('rejected')} data-testid="student-reject-button">
                  Tolak
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} data-testid="student-edit-button">
              Kemaskini
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-rose-600"
              data-testid="student-delete-button"
              onClick={() => {
                logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Memadam murid', student.fullName);
                deleteStudent(student.id);
                toast.success('Murid dipadam');
                navigate('/admin/students');
              }}
            >
              Padam
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="maklumat">
        <TabsList className="flex w-full flex-wrap">
          <TabsTrigger value="maklumat" data-testid="profile-tab-maklumat">Maklumat Murid</TabsTrigger>
          <TabsTrigger value="ibu_bapa" data-testid="profile-tab-ibu-bapa">Ibu Bapa / Penjaga</TabsTrigger>
          <TabsTrigger value="kehadiran" data-testid="profile-tab-kehadiran">Kehadiran</TabsTrigger>
          <TabsTrigger value="rekod" data-testid="profile-tab-rekod">Rekod Harian</TabsTrigger>
          <TabsTrigger value="insiden" data-testid="profile-tab-insiden">Insiden</TabsTrigger>
          <TabsTrigger value="yuran" data-testid="profile-tab-yuran">Yuran &amp; Bayaran</TabsTrigger>
          <TabsTrigger value="dokumen" data-testid="profile-tab-dokumen">Dokumen</TabsTrigger>
        </TabsList>

        <TabsContent value="maklumat" className="pt-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {[
                ['Nama Penuh', student.fullName],
                ['Nama Panggilan', student.nickname],
                ['Tarikh Lahir', formatDate(student.dob)],
                ['Umur', ageFrom(student.dob)],
                ['Jantina', GENDER_LABELS[student.gender]],
                ['Kelas', cls?.name ?? '—'],
                ['Guru Kelas', teacher?.fullName ?? '—'],
                ['Tarikh Pendaftaran', formatDateShort(student.enrolledAt)],
                ['Alergi', student.allergies || 'Tiada'],
                ['Keadaan Kesihatan', student.healthConditions || 'Tiada'],
                ['Nota Kesihatan', student.healthNotes || '—'],
                ['Alamat', student.address],
                ['Kontak Kecemasan', `${student.emergencyName} (${student.emergencyRelationship}) — ${student.emergencyPhone}`],
              ].map(([k, v]) => (
                <div key={k} data-testid={`profile-info-${k.toLowerCase().replace(/\s+/g, '-')}`}>
                  <dt className="text-xs text-slate-400">{k}</dt>
                  <dd className="text-sm font-medium text-slate-800">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </TabsContent>

        <TabsContent value="ibu_bapa" className="pt-4">
          {parentsList.length === 0 ? (
            <EmptyState icon={UserRound} title="Tiada maklumat ibu bapa" description="Tambahkan ibu bapa di halaman Ibu Bapa." testId="profile-parents-empty" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {parentsList.map((p) => (
                <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4" data-testid={`profile-parent-${p.id}`}>
                  <p className="font-semibold text-slate-900">{p.fullName}</p>
                  <p className="text-xs text-slate-500">{p.relationship}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> {p.phone}
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-600">{p.email}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="kehadiran" className="pt-4">
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(['hadir', 'lewat', 'tidak_hadir', 'cuti'] as const).map((st) => (
              <div key={st} className="rounded-2xl border border-slate-200 bg-white p-4 text-center" data-testid={`profile-attendance-${st}`}>
                <p className="text-xl font-bold text-slate-900">{attendanceSummary[st]}</p>
                <p className="text-xs text-slate-500">{ATTENDANCE_LABELS[st]}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white" data-testid="profile-attendance-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarikh</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Masuk</TableHead>
                  <TableHead>Keluar</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.slice(0, 20).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm">{formatDateShort(a.date)}</TableCell>
                    <TableCell>
                      <StatusPill label={ATTENDANCE_LABELS[a.status]} tone={ATTENDANCE_TONES[a.status]} />
                    </TableCell>
                    <TableCell className="text-sm">{formatTime(a.checkIn) || '—'}</TableCell>
                    <TableCell className="text-sm">{formatTime(a.checkOut) || '—'}</TableCell>
                    <TableCell className="text-sm text-slate-500">{a.note || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="rekod" className="pt-4">
          {logs.length === 0 ? (
            <EmptyState icon={HeartPulse} title="Belum ada rekod harian" description="Guru boleh menambah rekod harian dari portal guru." testId="profile-logs-empty" />
          ) : (
            <ul className="space-y-3" data-testid="profile-logs-list">
              {logs.slice(0, 10).map((l) => (
                <li key={l.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{formatDate(l.date)}</p>
                    {l.mood && <StatusPill label={MOOD_LABELS[l.mood]} tone="brand" />}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Sarapan: {l.breakfast ? MEAL_LABELS[l.breakfast.status] : '—'} · Tengah hari:{' '}
                    {l.lunch ? MEAL_LABELS[l.lunch.status] : '—'} · Susu: {l.milk ? MILK_LABELS[l.milk.status] : '—'} ·
                    Tidur: {l.nap?.start ? `${formatTime(l.nap.start)}–${formatTime(l.nap.end) || '...'}` : '—'}
                  </p>
                  {l.activities.length > 0 && (
                    <p className="mt-1 text-xs text-slate-500">Aktiviti: {l.activities.map((a) => a.name).join(', ')}</p>
                  )}
                  {l.note && <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{l.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="insiden" className="pt-4">
          {incidents.length === 0 ? (
            <EmptyState icon={ShieldCheck} title="Tiada insiden" description="Alhamdulillah, tiada insiden direkodkan untuk murid ini." testId="profile-incidents-empty" />
          ) : (
            <ul className="space-y-3" data-testid="profile-incidents-list">
              {incidents.map((i) => (
                <li key={i.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{i.type}</p>
                    <StatusPill label={INCIDENT_LEVEL_LABELS[i.level]} tone={INCIDENT_LEVEL_TONES[i.level]} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateShort(i.date)} · {formatTime(i.time) || '—'} · Dilaporkan oleh {i.reportedBy}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{i.description}</p>
                  <p className="mt-1 text-xs text-slate-500">Tindakan: {i.action}</p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="yuran" className="pt-4">
          <div className="rounded-2xl border border-slate-200 bg-white" data-testid="profile-invoices-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bil</TableHead>
                  <TableHead>Jenis / Tempoh</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="text-sm font-medium">{i.number}</TableCell>
                    <TableCell className="text-sm">
                      {i.title}
                      <span className="block text-xs text-slate-400">{i.periodLabel}</span>
                    </TableCell>
                    <TableCell className="text-sm">{formatRM(i.amount)}</TableCell>
                    <TableCell>
                      <StatusPill label={INVOICE_STATUS_LABELS[i.status]} tone={INVOICE_STATUS_TONES[i.status]} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 text-sm text-slate-500" data-testid="profile-payments-total">
            Jumlah dibayar: <span className="font-semibold text-emerald-600">{formatRM(payments.reduce((a, p) => a + p.amount, 0))}</span> ({payments.length} resit)
          </p>
        </TabsContent>

        <TabsContent value="dokumen" className="pt-4">
          <ul className="space-y-2" data-testid="profile-documents-list">
            {student.documents.map((d) => (
              <li key={d.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-900">{d.name}</span>
                  <span className="block text-xs text-slate-400">
                    {d.fileType} · {d.size} · Dimuat naik {formatDateShort(d.uploadedAt)}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label="Padam dokumen"
                  data-testid={`profile-document-remove-${d.id}`}
                  onClick={() => {
                    updateStudent(student.id, { documents: student.documents.filter((x) => x.id !== d.id) });
                    toast.success('Dokumen dipadam');
                  }}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="mt-3"
            data-testid="profile-document-add"
            onClick={() => {
              const doc = {
                id: `doc-${Date.now()}`,
                name: 'Dokumen Tambahan (simulasi)',
                fileType: 'PDF',
                size: '156 KB',
                uploadedAt: new Date().toISOString(),
              };
              updateStudent(student.id, { documents: [...student.documents, doc] });
              toast.success('Dokumen ditambah (simulasi)');
            }}
          >
            <Plus className="h-4 w-4" /> Tambah Dokumen (Simulasi)
          </Button>
        </TabsContent>
      </Tabs>

      {/* Dialog kemaskini ringkas */}
      {editOpen && (
        <Dialog open onOpenChange={(o) => !o && setEditOpen(false)}>
          <DialogContent className="sm:max-w-md" data-testid="student-edit-dialog">
            <DialogTitle>Kemaskini Murid</DialogTitle>
            <ProfileEditForm student={student} onDone={() => setEditOpen(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ProfileEditForm({ student, onDone }: { student: Student; onDone: () => void }) {
  const [fullName, setFullName] = useState(student.fullName);
  const [nickname, setNickname] = useState(student.nickname);
  const [dob, setDob] = useState(student.dob);
  const [address, setAddress] = useState(student.address);
  const [allergies, setAllergies] = useState(student.allergies);
  const [healthConditions, setHealthConditions] = useState(student.healthConditions);
  const [healthNotes, setHealthNotes] = useState(student.healthNotes);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="pe-fullname">Nama Penuh</Label>
        <Input id="pe-fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} data-testid="student-edit-fullname" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="pe-nickname">Nama Panggilan</Label>
          <Input id="pe-nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} data-testid="student-edit-nickname" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pe-dob">Tarikh Lahir</Label>
          <Input id="pe-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} data-testid="student-edit-dob" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pe-address">Alamat</Label>
        <Input id="pe-address" value={address} onChange={(e) => setAddress(e.target.value)} data-testid="student-edit-address" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="pe-allergies">Alergi</Label>
          <Input id="pe-allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} data-testid="student-edit-allergies" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pe-conditions">Keadaan Kesihatan</Label>
          <Input id="pe-conditions" value={healthConditions} onChange={(e) => setHealthConditions(e.target.value)} data-testid="student-edit-conditions" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pe-notes">Nota Kesihatan</Label>
        <Input id="pe-notes" value={healthNotes} onChange={(e) => setHealthNotes(e.target.value)} data-testid="student-edit-healthnotes" />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onDone} data-testid="student-edit-cancel">
          Batal
        </Button>
        <Button
          data-testid="student-edit-save"
          onClick={() => {
            updateStudent(student.id, {
              fullName: fullName.trim() || student.fullName,
              nickname: nickname.trim(),
              dob,
              address,
              allergies,
              healthConditions,
              healthNotes,
            });
            toast.success('Maklumat murid dikemaskini');
            onDone();
          }}
        >
          Simpan
        </Button>
      </DialogFooter>
    </div>
  );
}
