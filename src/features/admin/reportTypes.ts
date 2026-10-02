export type ReportType = 'kehadiran' | 'bayaran' | 'tunggakan' | 'murid' | 'aktiviti' | 'insiden';

export const REPORT_OPTIONS: { value: ReportType; label: string }[] = [
  { value: 'kehadiran', label: 'Laporan Kehadiran' },
  { value: 'bayaran', label: 'Laporan Bayaran' },
  { value: 'tunggakan', label: 'Laporan Bil Tertunggak' },
  { value: 'murid', label: 'Laporan Murid' },
  { value: 'aktiviti', label: 'Laporan Aktiviti Harian' },
  { value: 'insiden', label: 'Laporan Insiden' },
];

export interface ReportRow {
  key: string;
  cells: (string | number)[];
}
