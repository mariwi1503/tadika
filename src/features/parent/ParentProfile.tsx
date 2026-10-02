import { useNavigate } from '@/lib/router';
import { getParentById } from '@/lib/storage/repositories/parents';
import { getStudentsForParent } from '@/lib/storage/repositories/students';
import { getSession, logout } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/labels';
import { useStore } from '@/hooks/useStore';
import { Avatar, GreetingCard, SectionCard } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { LogOut, Mail, Phone } from 'lucide-react';

export default function ParentProfile() {
  useStore();
  const navigate = useNavigate();
  const session = getSession();
  const parent = session?.parentId ? getParentById(session.parentId) : undefined;
  const children = parent ? getStudentsForParent(parent.studentIds) : [];

  return (
    <div className="space-y-5">
      <GreetingCard title={session?.name ?? 'Ibu Bapa'} subtitle={ROLE_LABELS.PARENT} testId="parent-profile-hero" />

      <SectionCard title="Maklumat Penjaga" testId="parent-profile-info">
        <div className="flex items-center gap-4">
          <Avatar name={session?.name ?? ''} size="lg" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{parent?.fullName ?? session?.name}</p>
            <p className="text-sm text-slate-500">{parent?.relationship ?? 'Penjaga'}</p>
          </div>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600" data-testid="parent-profile-email">
            <Mail className="h-4 w-4 text-slate-400" /> {parent?.email ?? session?.email}
          </div>
          <div className="flex items-center gap-2 text-slate-600" data-testid="parent-profile-phone">
            <Phone className="h-4 w-4 text-slate-400" /> {parent?.phone ?? '—'}
          </div>
        </dl>
      </SectionCard>

      <SectionCard title="Anak Berdaftar" testId="parent-profile-children">
        {children.length === 0 ? (
          <p className="text-sm text-slate-500">Tiada anak berdaftar.</p>
        ) : (
          <ul className="space-y-2">
            {children.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                <Avatar name={c.fullName} size="sm" />
                <span className="text-sm font-medium text-slate-800">{c.fullName}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Sesi" testId="parent-profile-session">
        <p className="text-sm text-slate-600">
          Log masuk sebagai <span className="font-semibold text-slate-900">{session?.email}</span>
        </p>
        <Button
          variant="destructive"
          className="mt-4 w-full"
          data-testid="parent-logout-button"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          <LogOut className="h-4 w-4" /> Log Keluar
        </Button>
      </SectionCard>
    </div>
  );
}
