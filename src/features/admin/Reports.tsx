import { useState } from 'react';
import type { ReportType } from './reportTypes';
import { getStudents } from '@/lib/storage/repositories/students';
import { getClasses } from '@/lib/storage/repositories/classes';
import { getAttendanceRange } from '@/lib/storage/repositories/attendance';
import { getPayments } from '@/lib/storage/repositories/payments';
import { getInvoices } from '@/lib/storage/repositories/invoices';
import { getDailyLogs } from '@/lib/storage/repositories/dailyLogs';
import { getIncidents } from '@/lib/storage/repositories/incidents';
import { REPORT_OPTIONS, type ReportRow } from './reportTypes';
import {
  INCIDENT_LEVEL_LABELS,
  INVOICE_STATUS_LABELS,
  MEAL_LABELS,
  MILK_LABELS,
  MOOD_LABELS,
  PAYMENT_METHOD_LABELS,
  STUDENT_STATUS_LABELS,
} from '@/lib/labels';
import { datePart, daysAgoISO, formatDateShort, formatRM, formatTime, todayISO } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { PageHeader, SectionCard } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function Reports() {
  useStore();
  const classes = getClasses();
  const [reportType, setReportType] = useState<ReportType>('kehadiran');
  const [from, setFrom] = useState(daysAgoISO(30));
  const [to, setTo] = useState(todayISO());
  const [classFilter, setClassFilter] = useState('semua');

  const students = getStudents().filter((s) => (classFilter === 'semua' ? true : s.classId === classFilter));
  const studentName = (id: string) => getStudents().find((s) => s.id === id)?.fullName ?? '—';
  const className = (id: string | null) => classes.find((c) => c.id === id)?.name ?? '—';

  const build = (): { headers: string[]; rows: ReportRow[] } => {
    if (reportType === 'kehadiran') {
      const rows = students
        .filter((s) => s.status === 'approved')
        .map((s) => {
          const recs = getAttendanceRange(from, to).filter((a) => a.studentId === s.id);
          const hadir = recs.filter((r) => r.status === 'hadir').length;
          const lewat = recs.filter((r) => r.status === 'lewat').length;
          const tidak = recs.filter((r) => r.status === 'tidak_hadir').length;
          const cuti = recs.filter((r) => r.status === 'cuti').length;
          const total = recs.length;
          return {
            key: s.id,
            cells: [s.fullName, className(s.classId), hadir, lewat, tidak, cuti, total > 0 ? `${Math.round(((hadir + lewat) / total) * 100)}%` : '—'],
          };
        });
      return { headers: ['Murid', 'Kelas', 'Hadir', 'Lewat', 'Tidak Hadir', 'Cuti', '% Kehadiran'], rows };
    }
    if (reportType === 'bayaran') {
      const rows = getPayments()
        .filter((p) => datePart(p.paidAt) >= from && datePart(p.paidAt) <= to)
        .filter((p) => students.some((s) => s.id === p.studentId))
        .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
        .map((p) => ({ key: p.id, cells: [p.receiptNumber, formatDateShort(p.paidAt), studentName(p.studentId), formatRM(p.amount), PAYMENT_METHOD_LABELS[p.method]] }));
      return { headers: ['Resit', 'Tarikh', 'Murid', 'Jumlah', 'Kaedah'], rows };
    }
    if (reportType === 'tunggakan') {
      const rows = getInvoices()
        .filter((i) => i.status === 'tertunggak')
        .filter((i) => students.some((s) => s.id === i.studentId))
        .map((i) => ({ key: i.id, cells: [i.number, studentName(i.studentId), `${i.title} (${i.periodLabel})`, formatRM(i.amount), formatDateShort(i.dueDate), INVOICE_STATUS_LABELS[i.status]] }));
      return { headers: ['Bil', 'Murid', 'Jenis / Tempoh', 'Jumlah', 'Tarikh Akhir', 'Status'], rows };
    }
    if (reportType === 'murid') {
      const rows = students.map((s) => ({ key: s.id, cells: [s.fullName, className(s.classId), s.nickname, STUDENT_STATUS_LABELS[s.status]] }));
      return { headers: ['Murid', 'Kelas', 'Nama Panggilan', 'Status'], rows };
    }
    if (reportType === 'aktiviti') {
      const rows = getDailyLogs()
        .filter((l) => l.date >= from && l.date <= to)
        .filter((l) => students.some((s) => s.id === l.studentId))
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((l) => ({
          key: l.id,
          cells: [
            formatDateShort(l.date),
            studentName(l.studentId),
            l.breakfast ? MEAL_LABELS[l.breakfast.status] : '—',
            l.lunch ? MEAL_LABELS[l.lunch.status] : '—',
            l.milk ? MILK_LABELS[l.milk.status] : '—',
            l.nap?.start ? `${formatTime(l.nap.start)}–${formatTime(l.nap.end) || '…'}` : '—',
            l.mood ? MOOD_LABELS[l.mood] : '—',
          ],
        }));
      return { headers: ['Tarikh', 'Murid', 'Sarapan', 'Tengah Hari', 'Susu', 'Tidur', 'Perasaan'], rows };
    }
    const rows = getIncidents()
      .filter((i) => i.date >= from && i.date <= to)
      .filter((i) => students.some((s) => s.id === i.studentId))
      .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt))
      .map((i) => ({ key: i.id, cells: [formatDateShort(i.date), studentName(i.studentId), i.type, INCIDENT_LEVEL_LABELS[i.level], i.action] }));
    return { headers: ['Tarikh', 'Murid', 'Jenis Insiden', 'Tahap', 'Tindakan'], rows };
  };

  const { headers, rows } = build();

  const downloadCsv = () => {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [headers.map(esc).join(','), ...rows.map((r) => r.cells.map(esc).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${reportType}-${from}-hingga-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Laporan dimuat turun');
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader description="Laporan dijana daripada data sebenar sistem." />

      <SectionCard testId="reports-filters" className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <Label>Jenis Laporan</Label>
            <Select value={reportType} onValueChange={(v: string) => setReportType(v as ReportType)}>
              <SelectTrigger className="w-full sm:w-52" data-testid="reports-type-select">
                <SelectValue>{(v: string) => REPORT_OPTIONS.find((o) => o.value === v)?.label ?? ''}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {REPORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rep-from">Dari</Label>
            <Input id="rep-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" data-testid="reports-from-input" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rep-to">Hingga</Label>
            <Input id="rep-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" data-testid="reports-to-input" />
          </div>
          <div className="space-y-1.5">
            <Label>Kelas</Label>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-44" data-testid="reports-class-filter">
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
          <div className="flex gap-2 sm:ml-auto">
            <Button variant="outline" onClick={() => window.print()} data-testid="reports-print-button">
              <Printer className="h-4 w-4" /> Cetak
            </Button>
            <Button onClick={downloadCsv} data-testid="reports-download-button">
              <Download className="h-4 w-4" /> Muat Turun
            </Button>
          </div>
        </div>
      </SectionCard>

      <div className="print-area rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]" data-testid="reports-table">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900" data-testid="reports-title">
            {REPORT_OPTIONS.find((o) => o.value === reportType)?.label}
          </h2>
          <p className="text-xs text-slate-500">
            {from === to ? formatDateShort(from) : `${formatDateShort(from)} — ${formatDateShort(to)}`} · {rows.length} rekod
          </p>
        </div>
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">Tiada rekod ditemui untuk tempoh ini.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.key} data-testid={`reports-row-${r.key}`}>
                  {r.cells.map((c, idx) => (
                    <TableCell key={idx} className="text-sm text-slate-700">
                      {c}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
