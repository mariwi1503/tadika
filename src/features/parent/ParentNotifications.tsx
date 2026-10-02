import { PageHeader } from '@/components/shared/elements';
import { NotificationsInbox } from '@/components/shared/NotificationsInbox';
import { useStore } from '@/hooks/useStore';

export default function ParentNotifications() {
  useStore();
  return (
    <div>
      <PageHeader title="Pemberitahuan" description="Kemaskini tentang anak anda & tadika." />
      <NotificationsInbox role="PARENT" />
    </div>
  );
}
