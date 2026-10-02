import { useState } from 'react';
import { getActivityLogs } from '@/lib/storage/repositories/activityLogs';
import { ROLE_LABELS } from '@/lib/labels';
import { relativeTime } from '@/lib/format';
import type { Role } from '@/types';
import { useStore } from '@/hooks/useStore';
import { EmptyState, PageHeader } from '@/components/shared/elements';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { GraduationCap, History, ShieldCheck, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ROLE_ICONS: Record<Role, LucideIcon> = {
  ADMIN: ShieldCheck,
  TEACHER: GraduationCap,
  PARENT: UsersRound,
};

export default function ActivityLogPage() {
  useStore();
  const logs = getActivityLogs();
  const [roleFilter, setRoleFilter] = useState('semua');
  const filtered = logs.filter((l) => (roleFilter === 'semua' ? true : l.actorRole === roleFilter));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader description="Rekod tindakan penting dalam sistem." />

      <div className="mb-4 space-y-1.5">
        <Label>Tapis Mengikut Peranan</Label>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-52" data-testid="activity-log-role-filter">
            <SelectValue>{(v: string) => (v === 'semua' ? 'Semua Peranan' : ROLE_LABELS[v as Role])}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Peranan</SelectItem>
            <SelectItem value="ADMIN">Pentadbir</SelectItem>
            <SelectItem value="TEACHER">Guru</SelectItem>
            <SelectItem value="PARENT">Ibu Bapa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={History} title="Tiada rekod aktiviti" description="Log aktiviti akan dipaparkan di sini." testId="activity-log-empty" />
      ) : (
        <ul className="space-y-2" data-testid="activity-log-list">
          {filtered.map((l) => {
            const Icon = ROLE_ICONS[l.actorRole];
            return (
              <li key={l.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4" data-testid={`activity-log-item-${l.id}`}>
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{l.actorName}</span> {l.action.toLowerCase()}
                  </p>
                  <p className="truncate text-xs text-slate-500">{l.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{relativeTime(l.createdAt)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
