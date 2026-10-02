const BULAN_PANJANG = [
  'Januari',
  'Februari',
  'Mac',
  'April',
  'Mei',
  'Jun',
  'Julai',
  'Ogos',
  'September',
  'Oktober',
  'November',
  'Disember',
];

const BULAN_PENDEK = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

const HARI = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

export function daysAgoISO(n: number): string {
  return toISODate(addDays(-n));
}

export function daysAheadISO(n: number): string {
  return toISODate(addDays(n));
}

/** Date part of an ISO date or datetime string. */
export function datePart(iso: string): string {
  return iso.slice(0, 10);
}

export function parseDate(iso: string): Date {
  return new Date(`${datePart(iso)}T00:00:00`);
}

export function formatRM(amount: number): string {
  const fixed = amount.toFixed(2);
  const [int, dec] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `RM ${grouped}.${dec}`;
}

/** "08:12" (or ISO datetime) → "8:12 pagi" / "12:30 tengah hari" / "2:31 petang". */
export function formatTime(input?: string | null): string {
  if (!input) return '';
  const hm = input.length > 5 ? input.slice(11, 16) : input;
  const parts = hm.split(':');
  let h = Number(parts[0]);
  const m = parts[1] ?? '00';
  if (Number.isNaN(h)) return input;
  h = ((h % 24) + 24) % 24;
  if (h === 12) return `12:${m} tengah hari`;
  if (h < 12) return `${h}:${m} pagi`;
  if (h < 15) return `${h - 12}:${m} tengah hari`;
  if (h < 19) return `${h - 12}:${m} petang`;
  return `${h - 12}:${m} malam`;
}

export function formatDate(iso: string): string {
  const d = parseDate(iso);
  return `${d.getDate()} ${BULAN_PANJANG[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(iso: string): string {
  const d = parseDate(iso);
  return `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}`;
}

export function weekday(iso: string): string {
  return HARI[parseDate(iso).getDay()];
}

export function isWeekend(iso: string): boolean {
  const day = parseDate(iso).getDay();
  return day === 0 || day === 6;
}

export function monthLabel(year: number, monthIdx: number): string {
  return `${BULAN_PANJANG[monthIdx]} ${year}`;
}

export function monthLabelShort(year: number, monthIdx: number): string {
  return `${BULAN_PENDEK[monthIdx]} ${year}`;
}

export function monthLabelOfISO(iso: string): string {
  const d = parseDate(iso);
  return monthLabel(d.getFullYear(), d.getMonth());
}

export function greeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 12) return 'Selamat pagi';
  if (h < 15) return 'Selamat tengah hari';
  if (h < 18) return 'Selamat petang';
  return 'Selamat malam';
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Baru sekarang';
  if (mins < 60) return `${mins} minit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  if (hours < 48) return 'Semalam';
  return formatDateShort(new Date(iso).toISOString());
}

export function ageFrom(dob: string): string {
  const born = parseDate(dob);
  const now = new Date();
  let months = (now.getFullYear() - born.getFullYear()) * 12 + (now.getMonth() - born.getMonth());
  if (now.getDate() < born.getDate()) months -= 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years <= 0) return `${rest} bulan`;
  if (rest === 0) return `${years} tahun`;
  return `${years} tahun ${rest} bulan`;
}

export function initials(name: string): string {
  return name
    .replace(/^(Puan|Encik|Cikgu|Dr\.?|Tuan)\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** "HH:MM" of now — used for daftar masuk / keluar. */
export function nowHM(d: Date = new Date()): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function minutesBetween(start?: string | null, end?: string | null): string {
  if (!start || !end) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (Number.isNaN(mins) || mins < 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} minit`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} minit`;
}

export function minutesAgoISO(mins: number): string {
  return new Date(Date.now() - mins * 60000).toISOString();
}

export function nextSeqNumber(existing: string[], prefix: string): string {
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  let max = 0;
  for (const n of existing) {
    const m = pattern.exec(n);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefix}-${year}-${String(max + 1).padStart(4, '0')}`;
}
