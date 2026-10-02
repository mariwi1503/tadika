import { PageHeader } from '@/components/shared/elements';
import { CalendarView } from '@/components/shared/CalendarView';
import { useStore } from '@/hooks/useStore';

export default function ParentCalendar() {
  useStore();
  return (
    <div>
      <PageHeader title="Kalendar" description="Aktiviti, cuti dan acara tadika." />
      <CalendarView role="PARENT" />
    </div>
  );
}
