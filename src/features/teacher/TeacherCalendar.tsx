import { CalendarView } from '@/components/shared/CalendarView';
import { PageHeader } from '@/components/shared/elements';
import { useStore } from '@/hooks/useStore';

export default function TeacherCalendar() {
  useStore();
  return (
    <div>
      <PageHeader title="Kalendar" description="Aktiviti, cuti dan acara tadika." />
      <CalendarView role="TEACHER" />
    </div>
  );
}
