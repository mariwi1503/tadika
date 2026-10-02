import { useState } from 'react';
import { getClassById } from '@/lib/storage/repositories/classes';
import { getStudentsByClass } from '@/lib/storage/repositories/students';
import { getTeacherById } from '@/lib/storage/repositories/teachers';
import { getSession } from '@/lib/auth';
import { todayISO } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { AttendanceRoster } from '@/components/attendance/AttendanceRoster';
import { EmptyState, SectionCard } from '@/components/shared/elements';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardCheck } from 'lucide-react';

export default function TeacherAttendance() {
  useStore();
  const session = getSession();
  const teacher = getTeacherById(session?.teacherId ?? '');
  const cls = getClassById(teacher?.classId ?? '');
  const students = cls ? getStudentsByClass(cls.id) : [];
  const [date, setDate] = useState(todayISO());

  if (!cls) {
    return <EmptyState icon={ClipboardCheck} title="Tiada kelas ditetapkan" description="Hubungi pentadbir untuk menetapkan kelas anda." testId="teacher-attendance-no-class" />;
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title={`Kehadiran — ${cls.name}`}
        description="Ketik status untuk setiap murid. Masa daftar masuk/keluar direkodkan secara automatik."
        testId="teacher-attendance-card"
      >
        <div className="space-y-1.5">
          <Label htmlFor="teacher-att-date">Tarikh</Label>
          <Input id="teacher-att-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" data-testid="teacher-attendance-date-input" />
        </div>
      </SectionCard>
      <AttendanceRoster students={students} date={date} />
    </div>
  );
}
