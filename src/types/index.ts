export type Role = 'ADMIN' | 'TEACHER' | 'PARENT';

export interface UserAccount {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string;
  teacherId?: string;
  parentId?: string;
}

export interface Session {
  userId: string;
  role: Role;
  name: string;
  email: string;
  teacherId?: string;
  parentId?: string;
  studentIds?: string[];
}

export type Gender = 'lelaki' | 'perempuan';
export type StudentStatus = 'pending' | 'approved' | 'rejected';

export interface StudentDocument {
  id: string;
  name: string;
  fileType: string;
  size: string;
  uploadedAt: string;
}

export interface Student {
  id: string;
  fullName: string;
  nickname: string;
  dob: string; // YYYY-MM-DD
  gender: Gender;
  address: string;
  classId: string | null;
  status: StudentStatus;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  allergies: string;
  healthConditions: string;
  healthNotes: string;
  documents: StudentDocument[];
  enrolledAt: string;
}

export interface Parent {
  id: string;
  fullName: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  studentIds: string[];
}

export interface Teacher {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  classId: string | null;
  active: boolean;
}

export interface Class {
  id: string;
  name: string;
  ageGroup: string;
  room: string;
  teacherId: string | null;
}

export type AttendanceStatus = 'hadir' | 'tidak_hadir' | 'lewat' | 'cuti';

export interface Attendance {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkIn?: string | null; // HH:MM
  checkOut?: string | null;
  note?: string;
  recordedBy: string;
  recordedAt: string;
}

export type MealStatus = 'habis' | 'sebahagian' | 'tidak_makan';
export type MilkStatus = 'minum' | 'sebahagian' | 'tidak_minum';
export type Mood = 'gembira' | 'tenang' | 'aktif' | 'mengantuk' | 'sedih' | 'tidak_selesa';

export interface ActivityEntry {
  name: string;
  time?: string;
}

export interface DailyLog {
  id: string;
  studentId: string;
  date: string;
  breakfast?: { status: MealStatus; time?: string } | null;
  lunch?: { status: MealStatus; time?: string } | null;
  milk?: { status: MilkStatus; time?: string } | null;
  nap?: { start?: string; end?: string } | null;
  activities: ActivityEntry[];
  mood?: Mood | null;
  note?: string;
  recordedBy: string;
  recordedAt: string;
}

export type IncidentLevel = 'rendah' | 'sederhana' | 'tinggi';

export interface Incident {
  id: string;
  studentId: string;
  date: string;
  time?: string;
  type: string;
  description: string;
  action: string;
  level: IncidentLevel;
  reportedBy: string;
  reportedAt: string;
}

export type InvoiceStatus = 'draf' | 'belum_dibayar' | 'sudah_dibayar' | 'tertunggak' | 'dibatalkan';
export type PaymentMethod = 'kad' | 'pindahan' | 'ewallet';

export interface Invoice {
  id: string;
  number: string;
  studentId: string;
  title: string;
  periodLabel: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  studentId: string;
  payerName: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
}

export interface AppNotification {
  id: string;
  targetRoles: Role[];
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export type AnnouncementAudience = 'semua' | 'guru' | 'ibu_bapa' | 'kelas';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  classId?: string | null;
  date: string;
  authorName: string;
  createdAt: string;
}

export type EventType =
  | 'aktiviti'
  | 'acara'
  | 'cuti'
  | 'cuti_guru'
  | 'mesyuarat'
  | 'hari_terbuka'
  | 'aktiviti_kelas'
  | 'penutupan';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: EventType;
  note?: string;
  audience: 'semua' | 'guru' | 'ibu_bapa';
}

export interface ActivityLogEntry {
  id: string;
  actorName: string;
  actorRole: Role;
  action: string;
  detail: string;
  createdAt: string;
}

export interface AppSettings {
  nurseryName: string;
  address: string;
  phone: string;
  email: string;
}
