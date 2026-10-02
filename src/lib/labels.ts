import type {
  AnnouncementAudience,
  AttendanceStatus,
  EventType,
  Gender,
  IncidentLevel,
  InvoiceStatus,
  MealStatus,
  MilkStatus,
  Mood,
  PaymentMethod,
  Role,
  StudentStatus,
} from '@/types';

export type PillTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Pentadbir',
  TEACHER: 'Guru',
  PARENT: 'Ibu Bapa',
};

export const GENDER_LABELS: Record<Gender, string> = {
  lelaki: 'Lelaki',
  perempuan: 'Perempuan',
};

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  pending: 'Menunggu Semakan',
  approved: 'Diluluskan',
  rejected: 'Ditolak',
};

export const STUDENT_STATUS_TONES: Record<StudentStatus, PillTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  hadir: 'Hadir',
  tidak_hadir: 'Tidak Hadir',
  lewat: 'Lewat',
  cuti: 'Cuti',
};

export const ATTENDANCE_TONES: Record<AttendanceStatus, PillTone> = {
  hadir: 'success',
  tidak_hadir: 'danger',
  lewat: 'warning',
  cuti: 'info',
};

export const MEAL_LABELS: Record<MealStatus, string> = {
  habis: 'Habis',
  sebahagian: 'Sebahagian',
  tidak_makan: 'Tidak Makan',
};

export const MILK_LABELS: Record<MilkStatus, string> = {
  minum: 'Minum Habis',
  sebahagian: 'Sebahagian',
  tidak_minum: 'Tidak Minum',
};

export const MOOD_LABELS: Record<Mood, string> = {
  gembira: 'Gembira',
  tenang: 'Tenang',
  aktif: 'Aktif',
  mengantuk: 'Mengantuk',
  sedih: 'Sedih',
  tidak_selesa: 'Tidak Selesa',
};

export const INCIDENT_LEVEL_LABELS: Record<IncidentLevel, string> = {
  rendah: 'Rendah',
  sederhana: 'Sederhana',
  tinggi: 'Tinggi',
};

export const INCIDENT_LEVEL_TONES: Record<IncidentLevel, PillTone> = {
  rendah: 'info',
  sederhana: 'warning',
  tinggi: 'danger',
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draf: 'Draf',
  belum_dibayar: 'Belum Dibayar',
  sudah_dibayar: 'Sudah Dibayar',
  tertunggak: 'Tertunggak',
  dibatalkan: 'Dibatalkan',
};

export const INVOICE_STATUS_TONES: Record<InvoiceStatus, PillTone> = {
  draf: 'neutral',
  belum_dibayar: 'warning',
  sudah_dibayar: 'success',
  tertunggak: 'danger',
  dibatalkan: 'neutral',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  kad: 'Kad Kredit / Debit',
  pindahan: 'Pemindahan Bank (FPX)',
  ewallet: 'E-Wallet (DuitNow QR)',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  aktiviti: 'Aktiviti Tadika',
  acara: 'Acara',
  cuti: 'Cuti',
  cuti_guru: 'Cuti Guru',
  mesyuarat: 'Mesyuarat Ibu Bapa',
  hari_terbuka: 'Hari Terbuka',
  aktiviti_kelas: 'Aktiviti Kelas',
  penutupan: 'Penutupan Tadika',
};

export const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  semua: 'Semua',
  guru: 'Guru',
  ibu_bapa: 'Ibu Bapa',
  kelas: 'Kelas Tertentu',
};

export const ACTIVITY_SUGGESTIONS = [
  'Mewarna',
  'Membaca',
  'Bermain',
  'Menyanyi',
  'Aktiviti Luar',
  'Motor Halus',
  'Bercerita',
  'Muzik',
];
