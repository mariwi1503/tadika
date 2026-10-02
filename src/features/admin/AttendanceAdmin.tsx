import { useState } from 'react';
import type { AttendanceStatus } from '@/types';
import { getClasses } from '@/lib/storage/repositories/classes';
import { getStudents, getStudentsByClass } from '@/lib/storage/repositories/students';
import { getAttendanceForDate } from '@/lib/storage/repositories/attendance';
import { ATTENDANCE_LABELS, ATTENDANCE_TONES } from '@/lib/labels';
import { formatDate, todayISO, weekday } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { AttendanceRoster } from '@/components/attendance/AttendanceRoster';
import { PageHeader, StatusPill } from '@/components/shared/elements';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AttendanceAdmin() {
  useStore();
  const classes = getClasses();
  const [date, setDate] = useState(todayISO());
  const [classId, setClassId] = useState('semua');

  const students = classId === 'semua' ? getStudents().filter((s) => s.status === 'approved') : getStudentsByClass(classId);
  const records = getAttendanceForDate(date);
  const count = (st: AttendanceStatus) => records.filter((r) => r.status === st).length;

  return (
    <div>
      <PageHeader description={`${weekday(date)}, ${formatDate(date)}`} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="att-date">Tarikh</Label>
          <Input id="att-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" data-testid="attendance-admin-date-input" />
        </div>
        <div className="space-y-1.5">
          <Label>Kelas</Label>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="w-full sm:w-44" data-testid="attendance-admin-class-filter">
              <SelectValue>{(v: string) => (v === 'semua' ? 'Semua Kelas' : (classes.find((c) => c.id === v)?.name ?? ''))}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Kelas</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          {(['hadir', 'lewat', 'tidak_hadir', 'cuti'] as AttendanceStatus[]).map((st) => (
            <span key={st} data-testid={`attendance-admin-count-${st}`} className="flex items-center gap-1.5">
              <StatusPill label={`${ATTENDANCE_LABELS[st]}: ${count(st)}`} tone={ATTENDANCE_TONES[st]} />
            </span>
          ))}
        </div>
      </div>

      <AttendanceRoster students={students} date={date} />
    </div>
  );
}
