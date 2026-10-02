import type {
  ActivityLogEntry,
  Announcement,
  AppNotification,
  Attendance,
  AttendanceStatus,
  CalendarEvent,
  Class,
  DailyLog,
  Gender,
  Incident,
  Invoice,
  InvoiceStatus,
  Parent,
  Payment,
  PaymentMethod,
  Student,
  StudentStatus,
  Teacher,
  UserAccount,
} from '@/types';
import { daysAgoISO, daysAheadISO, formatDate, monthLabelOfISO, toISODate, todayISO } from '@/lib/format';
import { KEYS } from './keys';
import { commit, write } from './storage';

const SEED_VERSION = 'v1';

export function seedDemoData(opts: { force?: boolean } = {}): void {
  if (!opts.force && localStorage.getItem(KEYS.seeded) === SEED_VERSION) return;

  const now = new Date();
  const today = todayISO();

  const hm = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const at = (dayOffset: number, h: number, m: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - dayOffset);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const minsAgo = (mins: number) => new Date(Date.now() - mins * 60000).toISOString();

  // ---------------- Kelas ----------------
  const classes: Class[] = [
    { id: 'cl-melur', name: 'Kelas Melur', ageGroup: '4 - 5 tahun', room: 'Bilik Melur (Tingkat 1)', teacherId: 'tc-sarah' },
    { id: 'cl-mawar', name: 'Kelas Mawar', ageGroup: '5 - 6 tahun', room: 'Bilik Mawar (Tingkat 1)', teacherId: 'tc-farah' },
    { id: 'cl-cempaka', name: 'Kelas Cempaka', ageGroup: '3 - 4 tahun', room: 'Bilik Cempaka (Tingkat 2)', teacherId: 'tc-aiman' },
  ];

  const teachers: Teacher[] = [
    { id: 'tc-sarah', fullName: 'Cikgu Sarah Ahmad', email: 'teacher@demo.tadika.my', phone: '012-345 6789', classId: 'cl-melur', active: true },
    { id: 'tc-farah', fullName: 'Cikgu Farah Nadia', email: 'farah@tadicakeria.my', phone: '013-456 7890', classId: 'cl-mawar', active: true },
    { id: 'tc-aiman', fullName: 'Cikgu Aiman Hakim', email: 'aiman@tadicakeria.my', phone: '014-567 8901', classId: 'cl-cempaka', active: true },
    { id: 'tc-nabilah', fullName: 'Cikgu Nabilah Yusof', email: 'nabilah@tadicakeria.my', phone: '017-890 1234', classId: null, active: true },
  ];

  // ---------------- Ibu Bapa ----------------
  const parents: Parent[] = [
    { id: 'pa-sarah', fullName: 'Puan Sarah Ibrahim', relationship: 'Ibu', phone: '012-888 1122', email: 'parent@demo.tadika.my', address: 'No. 8, Jalan Ceria 5, Taman Seri Ceria, 43200 Cheras, Selangor', studentIds: ['st-adam'] },
    { id: 'pa-munirah', fullName: 'Puan Munirah Abdullah', relationship: 'Ibu', phone: '012-911 2233', email: 'munirah.abdullah@gmail.com', address: 'No. 21, Jalan Melati 2, Taman Melati, 53100 Kuala Lumpur', studentIds: ['st-aina'] },
    { id: 'pa-zubir', fullName: 'Encik Zubir Hassan', relationship: 'Bapa', phone: '013-220 3344', email: 'zubir.hassan@gmail.com', address: 'No. 5, Jalan Kenanga 9, Taman Kenanga, 43000 Kajang, Selangor', studentIds: ['st-faiz', 'st-rania'] },
    { id: 'pa-latifah', fullName: 'Puan Latifah Omar', relationship: 'Ibu', phone: '012-456 7788', email: 'latifah.omar@gmail.com', address: 'No. 17, Jalan Ceria 8, Taman Seri Ceria, 43200 Cheras, Selangor', studentIds: ['st-zara'] },
    { id: 'pa-rosnan', fullName: 'Encik Rosnan Ali', relationship: 'Bapa', phone: '019-321 4455', email: 'rosnan.ali@yahoo.com', address: 'No. 33, Jalan Mawar 4, Taman Mawar, 43200 Cheras, Selangor', studentIds: ['st-harith'] },
    { id: 'pa-kamarul', fullName: 'Encik Kamarul Zaman', relationship: 'Bapa', phone: '016-555 6677', email: 'kamarul.zaman@gmail.com', address: 'No. 2, Jalan Cempaka 6, Taman Cempaka, 43300 Seri Kembangan, Selangor', studentIds: ['st-danish'] },
    { id: 'pa-halimah', fullName: 'Puan Halimah Said', relationship: 'Ibu', phone: '012-777 8899', email: 'halimah.said@gmail.com', address: 'No. 44, Jalan Indah 1, Taman Indah, 43200 Cheras, Selangor', studentIds: ['st-alia'] },
    { id: 'pa-yusof', fullName: 'Encik Yusof Bakar', relationship: 'Bapa', phone: '011-123 4567', email: 'yusof.bakar@gmail.com', address: 'No. 9, Jalan Anggerik 7, Taman Anggerik, 43200 Cheras, Selangor', studentIds: ['st-irfan'] },
    { id: 'pa-marina', fullName: 'Puan Marina Tan', relationship: 'Ibu', phone: '012-234 5678', email: 'marina.tan@gmail.com', address: 'No. 12, Jalan Ceria 2, Taman Seri Ceria, 43200 Cheras, Selangor', studentIds: ['st-qistina'] },
    { id: 'pa-firdaus', fullName: 'Encik Firdaus Ismail', relationship: 'Bapa', phone: '013-876 5432', email: 'firdaus.ismail@gmail.com', address: 'No. 28, Jalan Melur 5, Taman Seri Ceria, 43200 Cheras, Selangor', studentIds: ['st-zayn'] },
    { id: 'pa-nadia', fullName: 'Puan Nadia Rahim', relationship: 'Ibu', phone: '012-987 6543', email: 'nadia.rahim@gmail.com', address: 'No. 3, Jalan Cempaka 2, Taman Cempaka, 43300 Seri Kembangan, Selangor', studentIds: ['st-arissa'] },
    { id: 'pa-shahrul', fullName: 'Encik Shahrul Nizam', relationship: 'Bapa', phone: '014-654 3210', email: 'shahrul.nizam@gmail.com', address: 'No. 19, Jalan Kenanga 3, Taman Kenanga, 43000 Kajang, Selangor', studentIds: ['st-izzat'] },
    { id: 'pa-emilia', fullName: 'Puan Emilia Wong', relationship: 'Ibu', phone: '016-246 8135', email: 'emilia.wong@gmail.com', address: 'No. 7, Jalan Mawar 8, Taman Mawar, 43200 Cheras, Selangor', studentIds: ['st-sofea'] },
    { id: 'pa-hazwan', fullName: 'Encik Hazwan Aziz', relationship: 'Bapa', phone: '017-135 7924', email: 'hazwan.aziz@gmail.com', address: 'No. 25, Jalan Indah 4, Taman Indah, 43200 Cheras, Selangor', studentIds: ['st-amir'] },
  ];

  // ---------------- Murid ----------------
  const dobOf = (years: number, monthIdx: number) =>
    toISODate(new Date(now.getFullYear() - years, monthIdx, 12));

  const mkDocs = (enrolledDaysAgo: number) => [
    { id: 'doc-birth', name: 'Sijil Kelahiran', fileType: 'PDF', size: '241 KB', uploadedAt: at(enrolledDaysAgo, 9, 0) },
    { id: 'doc-ic', name: 'Salinan MyKad Ibu Bapa', fileType: 'JPG', size: '890 KB', uploadedAt: at(enrolledDaysAgo, 9, 5) },
    { id: 'doc-immun', name: 'Sijil Imunisasi', fileType: 'PDF', size: '312 KB', uploadedAt: at(enrolledDaysAgo, 9, 10) },
  ];

  const mkStudent = (
    id: string,
    fullName: string,
    nickname: string,
    birth: string,
    gender: Gender,
    classId: string,
    status: StudentStatus,
    address: string,
    allergies: string,
    healthConditions: string,
    healthNotes: string,
    enrolledDaysAgo: number,
  ): Student => ({
    id,
    fullName,
    nickname,
    dob: birth,
    gender,
    address,
    classId,
    status,
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    allergies,
    healthConditions,
    healthNotes,
    documents: mkDocs(enrolledDaysAgo),
    enrolledAt: daysAgoISO(enrolledDaysAgo),
  });

  const students: Student[] = [
    mkStudent('st-adam', 'Muhammad Adam Hakimi', 'Adam', dobOf(5, (now.getMonth() + 9) % 12), 'lelaki', 'cl-melur', 'approved', 'No. 8, Jalan Ceria 5, Taman Seri Ceria, 43200 Cheras, Selangor', 'Alergi telur', 'Tiada', 'Jangan beri makanan berasaskan telur — bekalan makanan dari rumah.', 320),
    mkStudent('st-aina', 'Nur Aina Batrisyia', 'Aina', dobOf(4, (now.getMonth() + 2) % 12), 'perempuan', 'cl-melur', 'approved', 'No. 21, Jalan Melati 2, Taman Melati, 53100 Kuala Lumpur', 'Tiada', 'Tiada', '', 310),
    mkStudent('st-faiz', 'Ahmad Faizuddin', 'Faiz', dobOf(5, (now.getMonth() + 5) % 12), 'lelaki', 'cl-melur', 'approved', 'No. 5, Jalan Kenanga 9, Taman Kenanga, 43000 Kajang, Selangor', 'Alergi habuk', 'Tiada', 'Bantal lateks diganti dengan bantal kapas.', 300),
    mkStudent('st-zara', 'Siti Nur Zara', 'Zara', dobOf(4, (now.getMonth() + 7) % 12), 'perempuan', 'cl-melur', 'approved', 'No. 17, Jalan Ceria 8, Taman Seri Ceria, 43200 Cheras, Selangor', 'Tiada', 'Tiada', '', 295),
    mkStudent('st-harith', 'Muhammad Harith', 'Harith', dobOf(5, (now.getMonth() + 1) % 12), 'lelaki', 'cl-melur', 'approved', 'No. 33, Jalan Mawar 4, Taman Mawar, 43200 Cheras, Selangor', 'Tiada', 'Asma ringan', 'Inhaler disimpan di pejabat tadika — gunakan mengikut arahan.', 280),
    mkStudent('st-rania', 'Aisyah Rania', 'Rania', dobOf(4, (now.getMonth() + 11) % 12), 'perempuan', 'cl-melur', 'approved', 'No. 5, Jalan Kenanga 9, Taman Kenanga, 43000 Kajang, Selangor', 'Tiada', 'Tiada', '', 270),
    mkStudent('st-danish', 'Muhammad Danish Ikram', 'Danish', dobOf(6, (now.getMonth() + 3) % 12), 'lelaki', 'cl-mawar', 'approved', 'No. 2, Jalan Cempaka 6, Taman Cempaka, 43300 Seri Kembangan, Selangor', 'Tiada', 'Tiada', '', 400),
    mkStudent('st-alia', 'Nur Alia Batrisyia', 'Alia', dobOf(5, (now.getMonth() + 6) % 12), 'perempuan', 'cl-mawar', 'approved', 'No. 44, Jalan Indah 1, Taman Indah, 43200 Cheras, Selangor', 'Alergi kacang', 'Tiada', 'Alergi kacang tanah — semak semua bekalan makanan dengan teliti.', 390),
    mkStudent('st-irfan', 'Muhammad Irfan', 'Irfan', dobOf(6, now.getMonth()), 'lelaki', 'cl-mawar', 'approved', 'No. 9, Jalan Anggerik 7, Taman Anggerik, 43200 Cheras, Selangor', 'Tiada', 'Tiada', '', 380),
    mkStudent('st-qistina', 'Nur Qistina Damia', 'Qistina', dobOf(5, (now.getMonth() + 8) % 12), 'perempuan', 'cl-mawar', 'approved', 'No. 12, Jalan Ceria 2, Taman Seri Ceria, 43200 Cheras, Selangor', 'Tiada', 'Tiada', '', 370),
    mkStudent('st-zayn', 'Muhammad Zayn Aidan', 'Zayn', dobOf(6, (now.getMonth() + 4) % 12), 'lelaki', 'cl-mawar', 'approved', 'No. 28, Jalan Melur 5, Taman Seri Ceria, 43200 Cheras, Selangor', 'Tiada', 'Tiada', '', 360),
    mkStudent('st-arissa', 'Nur Arissa Qaleesa', 'Arissa', dobOf(4, (now.getMonth() + 10) % 12), 'perempuan', 'cl-cempaka', 'approved', 'No. 3, Jalan Cempaka 2, Taman Cempaka, 43300 Seri Kembangan, Selangor', 'Tiada', 'Tiada', '', 260),
    mkStudent('st-izzat', 'Izzat Haziq', 'Izzat', dobOf(3, (now.getMonth() + 5) % 12), 'lelaki', 'cl-cempaka', 'approved', 'No. 19, Jalan Kenanga 3, Taman Kenanga, 43000 Kajang, Selangor', 'Tiada', 'Tiada', '', 250),
    mkStudent('st-sofea', 'Sofia Nur Adlina', 'Sofea', dobOf(4, (now.getMonth() + 2) % 12), 'perempuan', 'cl-cempaka', 'approved', 'No. 7, Jalan Mawar 8, Taman Mawar, 43200 Cheras, Selangor', 'Tiada', 'Riwayat sawan demam', 'Pantau suhu badan; maklumkan ibu bapa jika demam.', 240),
    mkStudent('st-amir', 'Amir Rayyan', 'Amir', dobOf(3, (now.getMonth() + 1) % 12), 'lelaki', 'cl-cempaka', 'pending', 'No. 25, Jalan Indah 4, Taman Indah, 43200 Cheras, Selangor', 'Tiada', 'Tiada', '', 2),
  ];

  // Kontak kecemasan diambil daripada ibu bapa utama
  students.forEach((s) => {
    const p = parents.find((pa) => pa.studentIds.includes(s.id));
    if (p) {
      s.emergencyName = p.fullName;
      s.emergencyRelationship = p.relationship;
      s.emergencyPhone = p.phone;
    }
  });

  // ---------------- Kehadiran (14 hari ke belakang) ----------------
  const attendance: Attendance[] = [];
  for (let off = 13; off >= 0; off--) {
    const date = daysAgoISO(off);
    const dt = new Date(`${date}T00:00:00`);
    const dow = dt.getDay();
    if (dow === 0 || dow === 6) continue;
    students.forEach((s, i) => {
      if (s.status !== 'approved') return;
      const recordedToday = off > 0 || s.classId === 'cl-melur' || s.id === 'st-danish' || s.id === 'st-alia';
      if (!recordedToday) return;
      let status: AttendanceStatus = 'hadir';
      if (s.id === 'st-adam') status = 'hadir';
      else if (off === 0 && s.id === 'st-zara') status = 'cuti';
      else {
        const v = (i * 3 + off) % 11;
        if (v === 0) status = 'lewat';
        else if (v === 1) status = 'tidak_hadir';
      }
      const cls = classes.find((c) => c.id === s.classId);
      const recorder = teachers.find((t) => t.id === cls?.teacherId)?.fullName ?? 'Pentadbir';
      const checkIn =
        status === 'hadir'
          ? s.id === 'st-adam' && off === 0
            ? hm(8, 12)
            : hm(7, 30 + ((i * 5) % 40))
          : status === 'lewat'
            ? hm(8, 40 + ((i * 3) % 15))
            : null;
      const checkOut = off > 0 && (status === 'hadir' || status === 'lewat') ? hm(14, 10 + ((i * 7) % 45)) : null;
      attendance.push({
        id: `att-${s.id.slice(3)}-${date}`,
        studentId: s.id,
        date,
        status,
        checkIn,
        checkOut,
        note: status === 'cuti' && s.id === 'st-zara' ? 'Bercuti bersama keluarga' : '',
        recordedBy: recorder,
        recordedAt: at(off, 8, 10 + ((i * 2) % 25)),
      });
    });
  }

  // ---------------- Rekod Harian ----------------
  const dailyLogs: DailyLog[] = [];
  const pushLog = (
    studentId: string,
    off: number,
    data: {
      breakfast?: DailyLog['breakfast'];
      lunch?: DailyLog['lunch'];
      milk?: DailyLog['milk'];
      nap?: DailyLog['nap'];
      activities?: DailyLog['activities'];
      mood?: DailyLog['mood'];
      note?: string;
    },
    recordedBy = 'Cikgu Sarah Ahmad',
  ) => {
    const date = daysAgoISO(off);
    if (dailyLogs.some((l) => l.studentId === studentId && l.date === date)) return;
    dailyLogs.push({
      id: `log-${studentId.slice(3)}-${date}`,
      studentId,
      date,
      breakfast: data.breakfast ?? null,
      lunch: data.lunch ?? null,
      milk: data.milk ?? null,
      nap: data.nap ?? null,
      activities: data.activities ?? [],
      mood: data.mood ?? null,
      note: data.note ?? '',
      recordedBy,
      recordedAt: at(off, 12, 0),
    });
  };

  // Hari ini — Kelas Melur (2 murid belum lengkap supaya guru boleh demo)
  pushLog('st-adam', 0, {
    breakfast: { status: 'habis', time: '09:30' },
    lunch: { status: 'habis', time: '14:15' },
    milk: { status: 'minum', time: '11:30' },
    nap: { start: '12:30', end: '14:00' },
    activities: [{ name: 'Mewarna', time: '10:15' }, { name: 'Membaca', time: '10:50' }, { name: 'Menyanyi', time: '11:05' }],
    mood: 'gembira',
    note: 'Adam makan dengan berselera dan bangun tidur dengan ceria.',
  });
  pushLog('st-aina', 0, {
    breakfast: { status: 'habis', time: '09:25' },
    lunch: { status: 'sebahagian', time: '14:10' },
    milk: { status: 'sebahagian', time: '11:35' },
    nap: { start: '12:35', end: '13:55' },
    activities: [{ name: 'Mewarna', time: '10:15' }],
    mood: 'tenang',
  });
  pushLog('st-faiz', 0, {
    breakfast: { status: 'sebahagian', time: '09:20' },
    milk: { status: 'minum', time: '11:40' },
    activities: [{ name: 'Bermain', time: '10:30' }],
    mood: 'aktif',
    note: 'Faiz masih menunggu giliran rehat tengah hari.',
  });
  pushLog('st-harith', 0, {
    breakfast: { status: 'habis', time: '09:35' },
    lunch: { status: 'tidak_makan', time: '14:15' },
    nap: { start: '12:30', end: '13:40' },
    activities: [{ name: 'Membaca', time: '10:45' }],
    mood: 'tidak_selesa',
    note: 'Harith sedang selsema ringan, suhu badan dipantau.',
  });

  // Hari-hari lepas
  pushLog('st-adam', 1, {
    breakfast: { status: 'habis', time: '09:30' },
    lunch: { status: 'habis', time: '14:05' },
    milk: { status: 'minum', time: '11:25' },
    nap: { start: '12:30', end: '14:05' },
    activities: [{ name: 'Menyanyi', time: '10:00' }, { name: 'Aktiviti Luar', time: '10:40' }],
    mood: 'aktif',
    note: 'Sangat ceria semasa aktiviti luar.',
  });
  pushLog('st-adam', 2, {
    breakfast: { status: 'sebahagian', time: '09:28' },
    lunch: { status: 'habis', time: '14:10' },
    milk: { status: 'tidak_minum', time: '11:30' },
    nap: { start: '12:40', end: '13:50' },
    activities: [{ name: 'Mewarna', time: '10:20' }],
    mood: 'gembira',
  });
  pushLog('st-adam', 3, {
    breakfast: { status: 'habis', time: '09:32' },
    lunch: { status: 'sebahagian', time: '14:00' },
    milk: { status: 'minum', time: '11:28' },
    nap: { start: '12:30', end: '13:45' },
    activities: [{ name: 'Bermain', time: '10:10' }, { name: 'Membaca', time: '11:00' }],
    mood: 'tenang',
    note: 'Adam membawa buku cerita dari rumah dan bercerita di depan kelas.',
  });
  pushLog('st-aina', 2, {
    breakfast: { status: 'habis', time: '09:30' },
    milk: { status: 'minum', time: '11:30' },
    nap: { start: '12:30', end: '14:00' },
    activities: [{ name: 'Mewarna', time: '10:15' }, { name: 'Menyanyi', time: '11:00' }],
    mood: 'gembira',
  });
  pushLog('st-faiz', 1, {
    breakfast: { status: 'habis', time: '09:22' },
    milk: { status: 'sebahagian', time: '11:33' },
    nap: { start: '12:35', end: '13:50' },
    activities: [{ name: 'Aktiviti Luar', time: '10:30' }],
    mood: 'aktif',
  });
  pushLog(
    'st-danish',
    1,
    {
      breakfast: { status: 'habis', time: '09:15' },
      lunch: { status: 'habis', time: '14:00' },
      milk: { status: 'minum', time: '11:20' },
      nap: { start: '12:30', end: '14:10' },
      activities: [{ name: 'Membaca', time: '10:30' }],
      mood: 'gembira',
      note: 'Danish sudah boleh membaca ayat mudah.',
    },
    'Cikgu Farah Nadia',
  );

  // ---------------- Insiden ----------------
  const incidents: Incident[] = [
    { id: 'inc-1', studentId: 'st-harith', date: today, time: '10:05', type: 'Jatuh semasa bermain', description: 'Harith terjatuh di taman permainan semasa berlari dengan rakan-rakan.', action: 'Luka dilekap dan dibersihkan. Ibu bapa dimaklumkan melalui telefon.', level: 'rendah', reportedBy: 'Cikgu Sarah Ahmad', reportedAt: at(0, 10, 10) },
    { id: 'inc-2', studentId: 'st-irfan', date: daysAgoISO(1), time: '11:45', type: 'Tidak selesa / demam', description: 'Irfan kelihatan lesu dan suhu badan 37.9°C.', action: 'Ibu bapa dihubungi dan Irfan dibawa pulang awal.', level: 'sederhana', reportedBy: 'Cikgu Farah Nadia', reportedAt: at(1, 11, 50) },
    { id: 'inc-3', studentId: 'st-danish', date: daysAgoISO(3), time: '09:40', type: 'Gaduh semasa bermain', description: 'Danish dan rakan berebut mainan blok di sudut permainan.', action: 'Kedua-dua murid didamai dan diminta bergilir-gilir.', level: 'rendah', reportedBy: 'Cikgu Farah Nadia', reportedAt: at(3, 9, 45) },
    { id: 'inc-4', studentId: 'st-sofea', date: daysAgoISO(6), time: '12:15', type: 'Kesihatan — sawan demam', description: 'Sofea mengalami sawan demam selama kira-kira satu minit.', action: 'Pertolongan cemas diberikan. Sofea dibawa ke klinik bersama penjaga.', level: 'tinggi', reportedBy: 'Cikgu Aiman Hakim', reportedAt: at(6, 12, 20) },
  ];

  // ---------------- Yuran & Bayaran ----------------
  const invoices: Invoice[] = [];
  const payments: Payment[] = [];
  const year = now.getFullYear();
  const monthInfo = (offset: number) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return { label: monthLabelOfISO(toISODate(d)), due: toISODate(new Date(d.getFullYear(), d.getMonth(), 15)) };
  };
  const m2 = monthInfo(2);
  const m1 = monthInfo(1);
  const m0 = monthInfo(0);
  const overdueStudents = new Set(['st-faiz', 'st-irfan', 'st-qistina']);
  const paidThisMonth = new Set(['st-harith', 'st-alia', 'st-arissa']);
  const methods: PaymentMethod[] = ['kad', 'pindahan', 'ewallet'];
  let invSeq = 0;
  let rcpSeq = 0;

  const addInvoice = (
    studentId: string,
    title: string,
    periodLabel: string,
    amount: number,
    dueDate: string,
    status: InvoiceStatus,
    createdOffsetDays: number,
  ) => {
    invSeq += 1;
    invoices.push({
      id: `inv-${String(invSeq).padStart(3, '0')}`,
      number: `INV-${year}-${String(invSeq).padStart(4, '0')}`,
      studentId,
      title,
      periodLabel,
      amount,
      dueDate,
      status,
      createdAt: at(createdOffsetDays, 9, 0),
    });
  };
  const addPayment = (invoiceId: string, studentId: string, payer: string, amount: number, method: PaymentMethod, dayOffset: number) => {
    rcpSeq += 1;
    payments.push({
      id: `pay-${String(rcpSeq).padStart(3, '0')}`,
      receiptNumber: `RCP-${year}-${String(rcpSeq).padStart(4, '0')}`,
      invoiceId,
      studentId,
      payerName: payer,
      amount,
      method,
      paidAt: at(dayOffset, 10, 30 + ((rcpSeq * 7) % 25)),
    });
  };

  students.forEach((s) => {
    if (s.status !== 'approved') {
      addInvoice(s.id, 'Yuran Pendaftaran', m0.label, 800, m0.due, 'draf', 1);
      return;
    }
    const payer = parents.find((p) => p.studentIds.includes(s.id))?.fullName ?? 'Ibu Bapa';
    addInvoice(s.id, 'Yuran Bulanan', m2.label, 500, m2.due, 'sudah_dibayar', 60);
    addPayment(invoices[invoices.length - 1].id, s.id, payer, 500, methods[invSeq % 3], 48 - (invSeq % 5));
    const lastPaid = !overdueStudents.has(s.id);
    addInvoice(s.id, 'Yuran Bulanan', m1.label, 500, m1.due, lastPaid ? 'sudah_dibayar' : 'tertunggak', 30);
    if (lastPaid) addPayment(invoices[invoices.length - 1].id, s.id, payer, 500, methods[invSeq % 3], 25 - (invSeq % 6));
    const curStatus: InvoiceStatus = paidThisMonth.has(s.id) ? 'sudah_dibayar' : 'belum_dibayar';
    addInvoice(s.id, 'Yuran Bulanan', m0.label, 500, m0.due, curStatus, 2);
    if (curStatus === 'sudah_dibayar') addPayment(invoices[invoices.length - 1].id, s.id, payer, 500, methods[invSeq % 3], 1);
  });
  addInvoice('st-irfan', 'Yuran Seragam', m0.label, 250, m0.due, 'dibatalkan', 3);

  // ---------------- Pengumuman ----------------
  const announcements: Announcement[] = [
    { id: 'ann-1', title: 'Hari Terbuka Tadika Ceria', content: 'Dijemput semua ibu bapa dan penjaga untuk menghadiri Hari Terbuka Tadika Ceria. Terdapat pelbagai gerai aktiviti kanak-kanak, pameran karya murid dan sesi pendaftaran 2027.', audience: 'semua', classId: null, date: daysAheadISO(14), authorName: 'Puan Aisyah', createdAt: at(1, 9, 0) },
    { id: 'ann-2', title: 'Mesyuarat Ibu Bapa & Guru', content: 'Mesyuarat suku tahun kedua akan diadakan di Dewan Seri Ceria pada pukul 9:00 pagi. Kehadiran semua ibu bapa sangat dihargai.', audience: 'ibu_bapa', classId: null, date: daysAheadISO(8), authorName: 'Puan Aisyah', createdAt: at(2, 10, 0) },
    { id: 'ann-3', title: 'Taklimat Keselamatan Kanak-Kanak', content: 'Semua guru dikehendaki menghadiri taklimat keselamatan kanak-kanak anjuran Jabatan Kebajikan pada pukul 3:00 petang di Bilik Mawar.', audience: 'guru', classId: null, date: daysAheadISO(4), authorName: 'Puan Aisyah', createdAt: at(3, 16, 0) },
    { id: 'ann-4', title: 'Aktiviti Mewarna Bersama', content: 'Kelas Melur akan mengadakan aktiviti mewarna bersama pada hari ini. Sila bawa kotak krayen sendiri.', audience: 'kelas', classId: 'cl-melur', date: today, authorName: 'Cikgu Sarah Ahmad', createdAt: at(0, 7, 30) },
  ];

  // ---------------- Kalendar ----------------
  const events: CalendarEvent[] = [
    { id: 'ev-1', title: 'Lawatan Edukasi ke Zoo Negara', date: daysAgoISO(3), type: 'aktiviti', audience: 'semua', note: 'Murid dibenarkan memakai pakaian sukan.' },
    { id: 'ev-2', title: 'Penutupan Awal (Penyelenggaraan)', date: daysAgoISO(1), type: 'penutupan', audience: 'semua', note: 'Tadika ditutup pada pukul 12:30 tengah hari.' },
    { id: 'ev-3', title: 'Aktiviti Mewarna Kelas Melur', date: daysAheadISO(2), type: 'aktiviti_kelas', audience: 'ibu_bapa', note: '' },
    { id: 'ev-4', title: 'Sukaneka Tadika Ceria', date: daysAheadISO(4), type: 'acara', audience: 'semua', note: 'Pakaian: baju sukan tadika.' },
    { id: 'ev-5', title: 'Mesyuarat Ibu Bapa & Guru', date: daysAheadISO(8), type: 'mesyuarat', audience: 'ibu_bapa', note: 'Dewan Seri Ceria, 9:00 pagi.' },
    { id: 'ev-6', title: 'Cuti Guru (Latihan Profesional)', date: daysAheadISO(9), type: 'cuti_guru', audience: 'semua', note: 'Tadika beroperasi seperti biasa dengan guru ganti.' },
    { id: 'ev-7', title: 'Hari Terbuka Tadika', date: daysAheadISO(14), type: 'hari_terbuka', audience: 'semua', note: '' },
    { id: 'ev-8', title: 'Cuti Perayaan', date: daysAheadISO(18), type: 'cuti', audience: 'semua', note: 'Tadika tutup — cuti perayaan.' },
    { id: 'ev-9', title: 'Sesi Foto Graduasi', date: daysAheadISO(32), type: 'aktiviti', audience: 'semua', note: 'Untuk kelas Mawar (6 tahun).' },
  ];

  // ---------------- Pemberitahuan ----------------
  const notifications: AppNotification[] = [
    { id: 'not-1', targetRoles: ['ADMIN'], title: 'Bayaran diterima', body: 'Puan Sarah telah membuat bayaran yuran bulan lalu sebanyak RM 500.00.', read: false, createdAt: minsAgo(26) },
    { id: 'not-2', targetRoles: ['ADMIN'], title: 'Pendaftaran baharu', body: 'Amir Rayyan daripada Encik Hazwan Aziz menunggu semakan pendaftaran.', read: false, createdAt: minsAgo(55) },
    { id: 'not-3', targetRoles: ['ADMIN'], title: 'Insiden dilaporkan', body: 'Cikgu Sarah melaporkan insiden tahap rendah melibatkan Muhammad Harith.', read: true, createdAt: minsAgo(150) },
    { id: 'not-4', targetRoles: ['ADMIN'], title: 'Bil tertunggak', body: '3 bil yuran bulan lalu masih belum dijelaskan.', read: true, createdAt: minsAgo(300) },
    { id: 'not-5', targetRoles: ['TEACHER'], title: 'Pengumuman baharu', body: 'Taklimat Keselamatan Kanak-Kanak — Khamis ini pukul 3:00 petang.', read: false, createdAt: minsAgo(200) },
    { id: 'not-6', targetRoles: ['TEACHER'], title: 'Peringatan', body: 'Rekod harian untuk Aisyah Rania masih belum lengkap.', read: false, createdAt: minsAgo(65) },
    { id: 'not-7', targetRoles: ['PARENT'], title: 'Rekod harian Adam telah dikemaskini', body: 'Cikgu Sarah menambah rekod makanan, susu dan tidur untuk Adam.', read: false, createdAt: minsAgo(75) },
    { id: 'not-8', targetRoles: ['PARENT'], title: 'Yuran bulan ini kini tersedia', body: `Yuran Bulanan ${m0.label} sebanyak RM 500.00 — tarikh akhir ${formatDate(m0.due)}.`, read: false, createdAt: minsAgo(2880) },
    { id: 'not-9', targetRoles: ['PARENT'], title: 'Pengumuman baharu daripada tadika', body: 'Mesyuarat Ibu Bapa & Guru akan diadakan dalam masa terdekat.', read: true, createdAt: minsAgo(4300) },
  ];

  // ---------------- Log Aktiviti ----------------
  const activityLogs: ActivityLogEntry[] = [
    { id: 'al-1', actorName: 'Cikgu Sarah', actorRole: 'TEACHER', action: 'Merekodkan kehadiran', detail: 'Kelas Melur — 5 murid hadir', createdAt: minsAgo(3) },
    { id: 'al-2', actorName: 'Cikgu Sarah', actorRole: 'TEACHER', action: 'Menambah rekod harian', detail: 'Nur Aina Batrisyia — makanan, susu & tidur', createdAt: minsAgo(14) },
    { id: 'al-3', actorName: 'Puan Sarah', actorRole: 'PARENT', action: 'Membuat bayaran', detail: `RM 500.00 — Yuran Bulanan ${m1.label}`, createdAt: minsAgo(26) },
    { id: 'al-4', actorName: 'Pentadbir', actorRole: 'ADMIN', action: 'Meluluskan pendaftaran', detail: 'Muhammad Harith', createdAt: minsAgo(55) },
    { id: 'al-5', actorName: 'Cikgu Sarah', actorRole: 'TEACHER', action: 'Melaporkan insiden', detail: 'Jatuh di taman permainan — tahap rendah', createdAt: minsAgo(150) },
    { id: 'al-6', actorName: 'Pentadbir', actorRole: 'ADMIN', action: 'Menambah murid baharu', detail: 'Aisyah Rania — Kelas Melur', createdAt: minsAgo(240) },
    { id: 'al-7', actorName: 'Pentadbir', actorRole: 'ADMIN', action: 'Menjana bil bulanan', detail: `Yuran Bulanan ${m1.label} — semua kelas`, createdAt: at(1, 9, 30) },
    { id: 'al-8', actorName: 'Cikgu Farah', actorRole: 'TEACHER', action: 'Merekodkan kehadiran', detail: 'Kelas Mawar', createdAt: at(1, 8, 20) },
  ];

  // ---------------- Akaun Demo ----------------
  const users: UserAccount[] = [
    { id: 'us-admin', role: 'ADMIN', name: 'Puan Aisyah', email: 'admin@demo.tadika.my', password: 'admin123' },
    { id: 'us-teacher', role: 'TEACHER', name: 'Cikgu Sarah', email: 'teacher@demo.tadika.my', password: 'teacher123', teacherId: 'tc-sarah' },
    { id: 'us-parent', role: 'PARENT', name: 'Puan Sarah', email: 'parent@demo.tadika.my', password: 'parent123', parentId: 'pa-sarah' },
  ];

  write(KEYS.classes, classes);
  write(KEYS.teachers, teachers);
  write(KEYS.parents, parents);
  write(KEYS.students, students);
  write(KEYS.attendance, attendance);
  write(KEYS.dailyLogs, dailyLogs);
  write(KEYS.incidents, incidents);
  write(KEYS.invoices, invoices);
  write(KEYS.payments, payments);
  write(KEYS.announcements, announcements);
  write(KEYS.events, events);
  write(KEYS.notifications, notifications);
  write(KEYS.activityLogs, activityLogs);
  write(KEYS.users, users);
  localStorage.setItem(KEYS.seeded, SEED_VERSION);
  commit();
}
