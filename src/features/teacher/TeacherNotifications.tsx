import { PageHeader } from '@/components/shared/elements';
import { NotificationsInbox } from '@/components/shared/NotificationsInbox';
import { useStore } from '@/hooks/useStore';

export default function TeacherNotifications() {
  useStore();
  return (
    <div>
      <PageHeader title="Pemberitahuan" description="Mesej daripada pentadbir & sistem." />
      <NotificationsInbox role="TEACHER" />
    </div>
  );
}
