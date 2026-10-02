import { useState } from 'react';
import { Navigate, useNavigate } from '@/lib/router';
import type { Role } from '@/types';
import { getSession, homeFor, login, loginAsRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Baby, GraduationCap, ShieldCheck, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const QUICK: { role: Role; label: string; icon: typeof ShieldCheck; testId: string }[] = [
  { role: 'ADMIN', label: 'Masuk sebagai Pentadbir', icon: ShieldCheck, testId: 'login-quick-admin' },
  { role: 'TEACHER', label: 'Masuk sebagai Guru', icon: GraduationCap, testId: 'login-quick-teacher' },
  { role: 'PARENT', label: 'Masuk sebagai Ibu Bapa', icon: Users, testId: 'login-quick-parent' },
];

export default function Login() {
  const session = getSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (session) return <Navigate to={homeFor(session.role)} replace />;

  const enter = (s: ReturnType<typeof login>) => {
    if (s) {
      toast.success(`Selamat kembali, ${s.name}`);
      navigate(homeFor(s.role), { replace: true });
    } else {
      setError('Email atau kata laluan tidak sah. Sila cuba lagi.');
    }
  };

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    enter(login(email, password));
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Panel jenama */}
      <div className="hidden flex-col justify-between bg-teal-600 p-10 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Baby className="h-5.5 w-5.5" />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight">Tadika Ceria</span>
            <span className="block text-xs text-teal-100">Sistem Pengurusan Tadika</span>
          </span>
        </div>
        <div className="max-w-md space-y-8">
          <div>
            <p className="text-xs font-semibold tracking-wider text-teal-100 uppercase">Demo Persembahan</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Satu sistem untuk tadika anda.
            </h1>
            <p className="mt-4 text-teal-50/90">
              Kehadiran, rekod harian murid, yuran &amp; bayaran, kalendar serta komunikasi ibu
              bapa — semuanya di satu tempat. Selamat tinggal kertas &amp; WhatsApp.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {[
              'Kehadiran & daftar masuk tanpa kertas',
              'Rekod harian yang ibu bapa nantikan setiap hari',
              'Yuran digital dengan resit rasmi',
              'Pengumuman berpusat ikut kumpulan sasaran',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-100" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-teal-100/70">© {new Date().getFullYear()} Tadika Ceria. Semua hak cipta terpelihara.</p>
      </div>

      {/* Borang log masuk */}
      <div className="flex items-center justify-center bg-slate-50 p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
              <Baby className="h-5 w-5" />
            </span>
            <span className="font-bold tracking-tight text-slate-900">Tadika Ceria</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Selamat Datang Kembali</h2>
          <p className="mt-1 text-sm text-slate-500">Pilih peranan demo atau log masuk mengikut akaun.</p>

          <div className="mt-6 space-y-2.5">
            {QUICK.map((q) => (
              <button
                key={q.role}
                type="button"
                data-testid={q.testId}
                onClick={() => {
                  setError('');
                  enter(loginAsRole(q.role));
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left transition-all hover:border-teal-400 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] active:scale-[0.99]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <q.icon className="h-4.5 w-4.5" />
                </span>
                <span className="flex-1 text-sm font-semibold text-slate-800">{q.label}</span>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </button>
            ))}
          </div>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">atau</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={doLogin} className="space-y-4" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="nama@demo.tadika.my"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="login-email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Kata Laluan</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="login-password-input"
              />
            </div>
            {error && (
              <p role="alert" data-testid="login-error" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" size="lg" data-testid="login-submit-button">
              Log Masuk
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500" data-testid="login-demo-credentials">
            <p className="font-semibold text-slate-700">Akaun demo:</p>
            <p className="mt-1.5">Pentadbir — admin@demo.tadika.my / admin123</p>
            <p>Guru — teacher@demo.tadika.my / teacher123</p>
            <p>Ibu Bapa — parent@demo.tadika.my / parent123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
