# Tadika Ceria

Demo frontend sistem pengurusan tadika yang dibangun dengan Next.js App Router, TypeScript, dan Tailwind CSS. Seluruh data demo tersimpan di `localStorage`; proyek ini tidak memakai atau membutuhkan backend.

## Menjalankan proyek

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Pada layar login tersedia tombol masuk cepat untuk setiap peran.

| Peran | Email | Kata sandi |
| --- | --- | --- |
| Pentadbir | `admin@demo.tadika.my` | `admin123` |
| Guru | `teacher@demo.tadika.my` | `teacher123` |
| Ibu Bapa | `parent@demo.tadika.my` | `parent123` |

## Struktur

```text
src/
├── app/                    # Entry point Next.js App Router dan metadata
├── components/
│   ├── attendance/         # Komponen fitur kehadiran
│   ├── billing/            # Alur pembayaran dan resit
│   ├── daily-log/          # Form dan timeline rekod harian
│   ├── layout/             # Layout portal dan penjaga peran
│   ├── routing/            # Komposisi rute portal
│   ├── shared/             # Komponen lintas fitur
│   └── ui/                 # Primitif UI reusable
├── features/
│   ├── admin/              # Layar portal pentadbir
│   ├── parent/             # Layar portal ibu bapa
│   └── teacher/            # Layar portal guru
├── hooks/                  # Hooks aplikasi
├── lib/
│   ├── storage/            # Seed, adapter, dan repository localStorage
│   └── router.tsx          # Adapter navigasi untuk komponen frontend
└── types/                  # Model data TypeScript
```

Komponen layar hanya mengakses data melalui repository dalam `src/lib/storage/repositories`. Pemisahan ini membuat implementasi demo tetap sederhana dan memungkinkan lapisan data diganti kelak tanpa menulis ulang tampilan.

## Perintah pemeriksaan

```bash
npm run lint
npm run typecheck
npm run build
```

Data awal dibuat otomatis saat aplikasi pertama kali dibuka. Gunakan **Tetapan → Reset Data Demo** dari portal pentadbir untuk mengembalikan seluruh data dummy ke kondisi awal.
