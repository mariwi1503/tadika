import { BellOff, CheckCheck } from 'lucide-react';
import type { Role } from '@/types';
import {
  getNotificationsForRole,
  markAllRead,
  markNotificationRead,
} from '@/lib/storage/repositories/notifications';
import { relativeTime } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/elements';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function NotificationsInbox({ role }: { role: Role }) {
  useStore();
  const items = getNotificationsForRole(role);
  const unread = items.filter((n) => !n.read).length;

  if (items.length === 0) {
    return <EmptyState icon={BellOff} title="Belum ada pemberitahuan baharu" description="Pemberitahuan daripada tadika akan dipaparkan di sini." testId="notifications-empty" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {unread > 0 ? `${unread} belum dibaca` : 'Semua sudah dibaca'}
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={unread === 0}
          data-testid="notifications-mark-all-read"
          onClick={() => {
            markAllRead(role);
            toast.success('Semua pemberitahuan ditandakan sebagai dibaca');
          }}
        >
          <CheckCheck className="h-4 w-4" /> Tandakan semua dibaca
        </Button>
      </div>
      <ul className="space-y-2">
        {items.map((n) => (
          <li key={n.id}>
            <button
              data-testid={`notification-item-${n.id}`}
              onClick={() => markNotificationRead(n.id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors',
                n.read ? 'border-slate-200 bg-white' : 'border-teal-200 bg-teal-50/50',
              )}
            >
              <span
                className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-slate-200' : 'bg-teal-500')}
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">{n.title}</span>
                <span className="mt-0.5 block text-sm text-slate-600">{n.body}</span>
                <span className="mt-1 block text-xs text-slate-400">{relativeTime(n.createdAt)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
