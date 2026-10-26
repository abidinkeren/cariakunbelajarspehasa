# Portal Pencarian Akun Pembelajaran (belajar.id) Sekolah

Aplikasi web portal pencarian akun pembelajaran (`belajar.id`) siswa dan tenaga pendidik berbasis Google Sheets dengan pencocokan 3 data validasi (Nama, Kelas, dan Tanggal Lahir), proteksi sensor sandi, serta desain antarmuka sekolah formal yang bersih dan intuitif.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Terkonfirmasi dari Tanya Jawab Tahap 1:**
> - **Koneksi Google Sheets**: Menggunakan URL Google Sheet yang dibagikan atau dipublikasikan (format CSV / Google Visualization API) tanpa memerlukan login OAuth yang rumit bagi siswa, serta dilengkapi panel konfigurasi URL bagi operator/admin.
> - **Tampilan Sandi**: Password disensor dengan format bintang (`••••••••`) dan dilengkapi tombol interaktif untuk intip (toggle visibilitas) dan tombol salin (copy to clipboard) dengan toast notifikasi.
> - **Tema Visual & Desain**: Gaya sekolah formal modern (SD, SMP, SMA, SMK) dengan warna biru edukasi terpercaya (`#1E40AF` / `#2563EB`), latar bersih netral, tipografi berhierarki jelas, dan kartu hasil pencarian yang dapat dicetak/disimpan.

---

## 1. Overview & Core Concept

- **Apa yang Dibuat**: Portal web mandiri bagi peserta didik, orang tua, dan guru untuk mencari dan mengambil kredensial Akun Pembelajaran (`belajar.id`) mereka tanpa perlu antre ke operator Dapodik sekolah.
- **Mekanisme Validasi**: Pengguna memasukkan 3 parameter pencocokan:
  1. *Nama Lengkap* (pencarian toleran huruf besar/kecil dan spasi)
  2. *Kelas / Rombel* (pilihan dinamis dari data spreadsheet)
  3. *Tanggal Lahir* (input tanggal terstandarisasi)
- **Keluaran**: Menampilkan kartu identitas akun yang mencakup Nama, NISN/ID Siswa, Kelas, Email Akun Pembelajaran (`@belajar.id`), dan Password awal, disertai panduan langkah aktivasi akun pertama kali.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│  Halaman Utama  │ ───>  │ Form Pencarian Siswa │ ───>  │  Hasil Pencocokan    │
│  Hero & Panduan │       │ Nama + Kelas + Tgl   │       │  Data Ditemukan:     │
└─────────────────┘       └──────────────────────┘       │  • Detail Identitas  │
                                   │                     │  • Email belajar.id  │
                                   ▼                     │  • Sandi (Disensor)  │
                          ┌──────────────────────┐       │  • Tombol Salin/Cetak│
                          │   Data Tidak Ada:    │       └──────────────────────┘
                          │   Tips cek Dapodik   │
                          │   & kontak Operator  │
                          └──────────────────────┘
```

### Visual Identity & Theme
- **Aesthetic Direction**: *Institutional Edu-Clean* — Mengadopsi prinsip desain institusi pendidikan nasional yang terpercaya, tenang, dan bebas dari ornamen yang tidak perlu.
- **Color Palette (60-30-10 Rule)**:
  - **60% Neutral Canvas**: Latar belakang putih bersih (`#FFFFFF`) dan abu-abu lembut (`#F8FAFC`).
  - **30% Structural Surfaces**: Kartu putih dengan garis batas halus (`border-slate-200`), aksen slate profesional (`#0F172A`, `#334155`), dan teks kontras tinggi.
  - **10% Semantic Accents**: Biru Kemendikbudristek/Edu (`#1E40AF` & `#2563EB`) untuk tombol utama dan status verifikasi, serta hijau emerald (`#059669`) untuk konfirmasi salin berhasil.
- **Typography & Hierarchy**:
  - Headings: `Plus Jakarta Sans` (font modern Indonesia yang ramah dan formal).
  - Body & Form Controls: `Plus Jakarta Sans` / `DM Sans` (14px–16px, nyaman dibaca).
  - Data Numerik & Password: `font-mono tabular-nums` untuk tanggal lahir, NISN, dan karakter sandi.
- **Zero-Pill Discipline**:
  - Metadata seperti jenjang kelas dan status data ditampilkan dengan teks bersih berspasi tipis atau pembatas titik (`·`).
  - Tombol aksi menggunakan proporsi padding `px-4 py-2` yang tegas dan terstruktur.

---

## 3. Key Product Decisions & Trade-Offs

- **Metode Integrasi Google Sheets**:
  - *Pendekatan*: Aplikasi mendukung pembacaan otomatis via URL Google Sheets publik (Publish to Web / Export CSV) atau Sheet ID langsung.
  - *Kelebihan*: Siswa dan orang tua tidak memerlukan akun Google login untuk melakukan pencarian di perangkat HP/laptop mereka. Operator sekolah cukup membagikan sheet atau memasukkan link sheet pada modal pengaturan admin.
  - *Fallback & Demo Ready*: Tersedia data simulasi bawaan (dummy siswa & guru SD/SMP/SMA/SMK) yang langsung berfungsi tanpa konfigurasi awal, sehingga aplikasi langsung siap pakai dan diuji coba.
- **Toleransi Pencarian Nama**:
  - Mengabaikan sensitivitas huruf besar/kecil (case-insensitive) dan kelebihan spasi ganda agar memudahkan siswa atau orang tua yang mengetik dengan ponsel.
- **Keamanan Data & Privasi**:
  - Password disamarkan secara default dengan bulatan sensor.
  - Pengguna harus mengklik ikon mata untuk melihat password atau tombol salin cepat.
  - Data hanya dicocokkan ketika ketiga variabel (Nama + Kelas + Tanggal Lahir) cocok, mencegah pengguna mengintip data milik orang lain secara massal.
- **Fitur Ekstra yang Bernilai**:
  - Tombol "Cetak / Simpan Kartu" (PDF/Print preview) yang siap dicetak untuk arsip siswa.
  - Langkah-langkah panduan aktivasi pertama kali di Google Workspace.
  - Modal FAQ & Bantuan untuk kendala data tidak sinkron dengan Dapodik.

---

## 4. Technical Architecture & Data Strategy

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Client                        │
├───────────────────────────────┬─────────────────────────────┤
│   UI Components:              │   State & Services:         │
│   • TopNavbar & SchoolHeader  │   • SheetSyncService        │
│   • SearchLookupCard          │   • LookupFilterEngine      │
│   • ResultAccountCard         │   • LocalStorage Persistence│
│   • ActivationGuideModal      │   • Notification Toast      │
│   • AdminSheetConfigModal     │                             │
└───────────────┬───────────────┴──────────────┬──────────────┘
                │                              │
                ▼                              ▼
    ┌──────────────────────┐       ┌──────────────────────┐
    │   Google Sheets      │       │   Local Fallback &   │
    │   CSV / Pub Link     │       │   Cached School Data │
    └──────────────────────┘       └──────────────────────┘
```

### Data Model (`StudentAccountRecord`)

```typescript
interface StudentAccountRecord {
  id: string;
  nama: string;           // Nama lengkap siswa / guru
  kelas: string;          // Contoh: "X-MIPA 1", "VII-B", "5-A"
  tanggalLahir: string;   // Format YYYY-MM-DD atau DD/MM/YYYY
  akunBelajar: string;    // Contoh: siswa123@sma.belajar.id
  passwordAwal: string;   // Contoh: Belajar#2024
  nisn?: string;          // Nomor Induk Siswa Nasional (opsional)
  peran: 'Siswa' | 'Guru' | 'Tendik';
}
```

### Component Breakdown
1. **`App.tsx`**: State utama penampung data sheet, status pemuatan, form input, dan hasil pencarian.
2. **`Header.tsx`**: Navigasi bersih dengan logo institusi pendidikan dan tombol Pengaturan Sumber Data / Bantuan.
3. **`LookupForm.tsx`**: Input Nama, dropdown Kelas dinamis, input Tanggal Lahir, serta tombol "Cari Akun Belajar".
4. **`AccountResultCard.tsx`**: Kartu representasi akun belajar resmi dengan sensor password, tombol copy, dan tombol cetak kartu.
5. **`ActivationGuide.tsx`**: Panduan visual cara login pertama kali dan mengganti password di `accounts.google.com`.
6. **`SheetConfigModal.tsx`**: Modal konfigurasi URL Google Sheets dengan instruksi langkah-langkah mempublikasikan spreadsheet ke web dalam 3 langkah mudah.

---

## Verification & Testing Plan

1. **Pencarian Berhasil**:
   - Memasukkan Nama, Kelas, dan Tanggal Lahir yang sesuai dari data contoh maupun data Google Sheet asli.
   - Verifikasi bahwa akun belajar dan password awal muncul dengan benar dalam kondisi tersensor.
   - Menguji tombol toggle lihat/sembunyikan sandi dan tombol salin.
2. **Pencarian Gagal / Validasi**:
   - Memasukkan data salah satu komponen yang tidak cocok dan memastikan pesan informatif yang ramah tampil.
3. **Responsivitas**:
   - Menguji tampilan pada lebar layar smartphone (375px–430px) hingga desktop (1440px).
4. **Koneksi Google Sheet**:
   - Memasukkan link Google Sheet baru, menekan tombol Sinkronkan, dan memastikan parsing kolom otomatis mengenali data dengan rapi.
