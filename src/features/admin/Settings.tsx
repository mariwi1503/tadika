import { useState } from 'react';
import { useNavigate } from '@/lib/router';
import { getSettings, saveSettings } from '@/lib/storage/repositories/settings';
import { resetDemoData } from '@/lib/storage/storage';
import { PageHeader, SectionCard } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Baby, RefreshCw, ShieldCheck, GraduationCap, Users } from 'lucide-react';
import { toast } from 'sonner';

const DEMO_ACCOUNTS = [
  { role: 'Pentadbir', email: 'admin@demo.tadika.my', password: 'admin123', icon: ShieldCheck },
  { role: 'Guru', email: 'teacher@demo.tadika.my', password: 'teacher123', icon: GraduationCap },
  { role: 'Ibu Bapa', email: 'parent@demo.tadika.my', password: 'parent123', icon: Users },
];

export default function Settings() {
  const navigate = useNavigate();
  const settings = getSettings();
  const [nurseryName, setNurseryName] = useState(settings.nurseryName);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader description="Profil tadika, akaun demo dan data." />

      <SectionCard title="Profil Tadika" testId="settings-profile-card">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="set-name">Nama Tadika</Label>
            <Input id="set-name" value={nurseryName} onChange={(e) => setNurseryName(e.target.value)} data-testid="settings-name-input" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="set-address">Alamat</Label>
            <Input id="set-address" value={address} onChange={(e) => setAddress(e.target.value)} data-testid="settings-address-input" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-phone">Telefon</Label>
            <Input id="set-phone" value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="settings-phone-input" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-email">Email</Label>
            <Input id="set-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="settings-email-input" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            data-testid="settings-save-button"
            onClick={() => {
              saveSettings({ nurseryName: nurseryName.trim() || settings.nurseryName, address, phone, email });
              toast.success('Tetapan disimpan');
            }}
          >
            Simpan Tetapan
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Akaun Demo" description="Akaun untuk persembahan demo." testId="settings-accounts-card">
        <ul className="space-y-2">
          {DEMO_ACCOUNTS.map((a) => (
            <li key={a.email} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3" data-testid={`settings-account-${a.role.toLowerCase()}`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <a.icon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm">
                <span className="block font-semibold text-slate-900">{a.role}</span>
                <span className="block text-xs text-slate-500">
                  {a.email} · {a.password}
                </span>
              </span>
              <Baby className="h-4 w-4 text-slate-300" />
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Data Demo" description="Semua data disimpan dalam localStorage pelayar ini." testId="settings-data-card">
        <p className="text-sm text-slate-600">
          Butang di bawah akan memadam semua data dan memulihkan data demo asal. Sesi log masuk semasa tidak diubah.
        </p>
        <div className="mt-4">
          <Button variant="destructive" onClick={() => setResetOpen(true)} data-testid="settings-reset-button">
            <RefreshCw className="h-4 w-4" /> Reset Data Demo
          </Button>
        </div>
      </SectionCard>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-sm" data-testid="settings-reset-dialog">
          <DialogTitle>Reset data demo?</DialogTitle>
          <p className="text-sm text-slate-500">Semua perubahan yang dibuat akan dipadam dan data demo asal dipulihkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)} data-testid="settings-reset-cancel">
              Batal
            </Button>
            <Button
              variant="destructive"
              data-testid="settings-reset-confirm"
              onClick={() => {
                resetDemoData();
                toast.success('Data demo dipulihkan');
                setResetOpen(false);
                navigate('/admin');
              }}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
