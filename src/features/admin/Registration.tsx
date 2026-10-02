import { useState } from 'react';
import { useNavigate } from '@/lib/router';
import type { Gender, StudentDocument } from '@/types';
import { createStudent } from '@/lib/storage/repositories/students';
import { createParent } from '@/lib/storage/repositories/parents';
import { getClasses } from '@/lib/storage/repositories/classes';
import { notifyRoles } from '@/lib/storage/repositories/notifications';
import { logActivity } from '@/lib/storage/repositories/activityLogs';
import { getSession } from '@/lib/auth';
import { todayISO } from '@/lib/format';
import { uid } from '@/lib/storage/storage';
import { GENDER_LABELS } from '@/lib/labels';
import { PageHeader, SectionCard } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const DUMMY_DOCS = [
  { name: 'Sijil Kelahiran', fileType: 'PDF', size: '241 KB' },
  { name: 'Salinan MyKad Ibu Bapa', fileType: 'JPG', size: '890 KB' },
  { name: 'Sijil Imunisasi', fileType: 'PDF', size: '312 KB' },
  { name: 'Dokumen Sokongan Lain', fileType: 'PDF', size: '180 KB' },
];

export default function Registration() {
  const navigate = useNavigate();
  const classes = getClasses();
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender>('lelaki');
  const [address, setAddress] = useState('');
  const [classId, setClassId] = useState('');
  const [parentName, setParentName] = useState('');
  const [relationship, setRelationship] = useState('Ibu');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentAddress, setParentAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [allergies, setAllergies] = useState('');
  const [healthConditions, setHealthConditions] = useState('');
  const [healthNotes, setHealthNotes] = useState('');
  const [documents, setDocuments] = useState<StudentDocument[]>([]);

  const addDummyDoc = () => {
    const next = DUMMY_DOCS[documents.length % DUMMY_DOCS.length];
    setDocuments((d) => [...d, { id: uid(), ...next, uploadedAt: new Date().toISOString() }]);
  };

  const submit = () => {
    if (!fullName.trim() || !dob || !parentName.trim()) {
      toast.error('Sila lengkapkan nama murid, tarikh lahir dan nama ibu bapa.');
      return;
    }
    const student = createStudent({
      fullName: fullName.trim(),
      nickname: nickname.trim() || fullName.trim().split(' ')[0],
      dob,
      gender,
      address: address.trim(),
      classId: classId || null,
      status: 'pending',
      emergencyName: emergencyName.trim() || parentName.trim(),
      emergencyRelationship: emergencyRelationship.trim() || relationship,
      emergencyPhone: emergencyPhone.trim() || parentPhone.trim(),
      allergies: allergies.trim() || 'Tiada',
      healthConditions: healthConditions.trim() || 'Tiada',
      healthNotes: healthNotes.trim(),
      documents,
      enrolledAt: todayISO(),
    });
    createParent({
      fullName: parentName.trim(),
      relationship,
      phone: parentPhone.trim(),
      email: parentEmail.trim(),
      address: parentAddress.trim() || address.trim(),
      studentIds: [student.id],
    });
    const session = getSession();
    notifyRoles(['ADMIN'], 'Pendaftaran baharu', `${student.fullName} menunggu semakan pendaftaran.`);
    logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Menambah murid baharu', `${student.fullName} — menunggu semakan`);
    toast.success('Pendaftaran murid dihantar untuk semakan');
    navigate('/admin/students');
  };

  const classOptions = classes.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader description="Lengkapkan maklumat di bawah. Pendaftaran baharu berstatus Menunggu Semakan." />

      <div className="space-y-5">
        <SectionCard title="Maklumat Murid" testId="registration-section-student">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="reg-fullname">Nama Penuh</Label>
              <Input id="reg-fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="cth. Muhammad Adam Hakimi" data-testid="registration-fullname-input" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-nickname">Nama Panggilan</Label>
              <Input id="reg-nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="cth. Adam" data-testid="registration-nickname-input" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-dob">Tarikh Lahir</Label>
              <Input id="reg-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} data-testid="registration-dob-input" />
            </div>
            <div className="space-y-1.5">
              <Label>Jantina</Label>
              <Select value={gender} onValueChange={(v: string) => setGender(v as Gender)}>
                <SelectTrigger data-testid="registration-gender-select">
                  <SelectValue>{(v: string) => GENDER_LABELS[v as Gender]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
                    <SelectItem key={g} value={g}>
                      {GENDER_LABELS[g]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="reg-address">Alamat</Label>
              <Input id="reg-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Alamat kediaman" data-testid="registration-address-input" />
            </div>
            <div className="space-y-1.5">
              <Label>Kelas</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger data-testid="registration-class-select">
                  <SelectValue placeholder="Pilih kelas">{(v: string) => classOptions.find((c) => c.value === v)?.label ?? 'Pilih kelas'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Maklumat Ibu Bapa / Penjaga" testId="registration-section-parent">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="reg-parent-name">Nama</Label>
              <Input id="reg-parent-name" value={parentName} onChange={(e) => setParentName(e.target.value)} data-testid="registration-parent-name-input" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-parent-rel">Hubungan</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger data-testid="registration-relationship-select">
                  <SelectValue>{relationship}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {['Ibu', 'Bapa', 'Penjaga'].map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-parent-phone">Nombor Telefon</Label>
              <Input id="reg-parent-phone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="012-345 6789" data-testid="registration-parent-phone-input" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-parent-email">Email</Label>
              <Input id="reg-parent-email" type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} data-testid="registration-parent-email-input" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="reg-parent-address">Alamat</Label>
              <Input id="reg-parent-address" value={parentAddress} onChange={(e) => setParentAddress(e.target.value)} data-testid="registration-parent-address-input" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Maklumat Kecemasan" testId="registration-section-emergency">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="reg-em-name">Nama Kontak</Label>
              <Input id="reg-em-name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} data-testid="registration-emergency-name-input" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-em-rel">Hubungan</Label>
              <Input id="reg-em-rel" value={emergencyRelationship} onChange={(e) => setEmergencyRelationship(e.target.value)} data-testid="registration-emergency-relationship-input" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-em-phone">Nombor Telefon</Label>
              <Input id="reg-em-phone" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} data-testid="registration-emergency-phone-input" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Maklumat Kesihatan" testId="registration-section-health">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="reg-allergies">Alergi</Label>
              <Input id="reg-allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="cth. Alergi telur (jika ada)" data-testid="registration-allergies-input" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-conditions">Keadaan Kesihatan</Label>
              <Input id="reg-conditions" value={healthConditions} onChange={(e) => setHealthConditions(e.target.value)} placeholder="cth. Asma ringan (jika ada)" data-testid="registration-conditions-input" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="reg-healthnotes">Nota Kesihatan</Label>
              <Input id="reg-healthnotes" value={healthNotes} onChange={(e) => setHealthNotes(e.target.value)} data-testid="registration-healthnotes-input" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Dokumen" description="Muat naik dokumen disimulasikan untuk versi demo." testId="registration-section-documents">
          <Button variant="outline" onClick={addDummyDoc} data-testid="registration-add-document-button">
            <Plus className="h-4 w-4" /> Tambah Dokumen
          </Button>
          {documents.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Belum ada dokumen ditambah.</p>
          ) : (
            <ul className="mt-3 space-y-2" data-testid="registration-document-list">
              {documents.map((d) => (
                <li key={d.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                  <FileText className="h-4 w-4 text-teal-600" />
                  <span className="flex-1 text-slate-700">{d.name}</span>
                  <span className="text-xs text-slate-400">
                    {d.fileType} · {d.size}
                  </span>
                  <button
                    type="button"
                    aria-label="Padam dokumen"
                    data-testid={`registration-document-remove-${d.id}`}
                    onClick={() => setDocuments((list) => list.filter((x) => x.id !== d.id))}
                    className="rounded-full p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <div className="flex justify-end gap-2 pb-6">
          <Button variant="outline" onClick={() => navigate('/admin/students')} data-testid="registration-cancel-button">
            Batal
          </Button>
          <Button onClick={submit} data-testid="registration-submit-button">
            Hantar Pendaftaran
          </Button>
        </div>
      </div>
    </div>
  );
}
