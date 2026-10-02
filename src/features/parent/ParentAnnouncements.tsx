import { getParentById } from '@/lib/storage/repositories/parents';
import { getStudentsForParent } from '@/lib/storage/repositories/students';
import { getAnnouncementsFor } from '@/lib/storage/repositories/announcements';
import { getSession } from '@/lib/auth';
import { AUDIENCE_LABELS } from '@/lib/labels';
import { formatDateShort } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { EmptyState, PageHeader, StatusPill } from '@/components/shared/elements';
import { Megaphone } from 'lucide-react';

export default function ParentAnnouncements() {
  useStore();
  const session = getSession();
  const parent = session?.parentId ? getParentById(session.parentId) : undefined;
  const children = parent ? getStudentsForParent(parent.studentIds) : [];
  // Gabung pengumuman umum, khusus ibu bapa dan kelas anak-anak
  const items = Array.from(
    new Map(
      children.flatMap((c) => getAnnouncementsFor('PARENT', c.classId)).map((a) => [a.id, a]),
    ).values(),
  ).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <PageHeader title="Pengumuman" description="Makluman daripada pengurusan tadika." />
      {items.length === 0 ? (
        <EmptyState icon={Megaphone} title="Belum ada pengumuman" description="Pengumuman daripada tadika akan dipaparkan di sini." testId="parent-announcements-empty" />
      ) : (
        <ul className="space-y-3" data-testid="parent-announcements-list">
          {items.map((a) => (
            <li key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5" data-testid={`parent-announcement-${a.id}`}>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-slate-900">{a.title}</h2>
                <StatusPill label={AUDIENCE_LABELS[a.audience]} tone="brand" />
              </div>
              <p className="mt-2 text-sm text-slate-600">{a.content}</p>
              <p className="mt-2 text-xs text-slate-400">
                {formatDateShort(a.date)} · Oleh {a.authorName}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
