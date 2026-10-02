import { useNavigate } from '@/lib/router';
import { getClassById } from '@/lib/storage/repositories/classes';
import { getTeacherById } from '@/lib/storage/repositories/teachers';
import { getSession, logout } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/labels';
import { useStore } from '@/hooks/useStore';
import { Avatar, GreetingCard, SectionCard } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { LogOut, Phone, Mail } from 'lucide-react';

export default function TeacherProfile() {
  useStore();
  const navigate = useNavigate();
  const session = getSession();
  const teacher = getTeacherById(session?.teacherId ?? '');
  const cls = getClassById(teacher?.classId ?? '');

  return (
    <div className="space-y-5">
      <GreetingCard title={session?.name ?? 'Cikgu'} subtitle={ROLE_LABELS.TEACHER} testId="teacher-profile-hero" />

      <SectionCard title="Maklumat Guru" testId="teacher-profile-info">
        <div className="flex items-center gap-4">
          <Avatar name={session?.name ?? ''} size="lg" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{teacher?.fullName ?? session?.name}</p>
            <p className="text-sm text-slate-500">{cls ? `Guru Kelas ${cls.name}` : 'Guru'}</p>
          </div>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600" data-testid="teacher-profile-email">
            <Mail className="h-4 w-4 text-slate-400" /> {teacher?.email ?? session?.email}
          </div>
          <div className="flex items-center gap-2 text-slate-600" data-testid="teacher-profile-phone">
            <Phone className="h-4 w-4 text-slate-400" /> {teacher?.phone ?? '—'}
          </div>
        </dl>
      </SectionCard>

      <SectionCard title="Sesi" testId="teacher-profile-session">
        <p className="text-sm text-slate-600">
          Log masuk sebagai <span className="font-semibold text-slate-900">{session?.email}</span>
        </p>
        <Button
          variant="destructive"
          className="mt-4 w-full"
          data-testid="teacher-logout-button"
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
