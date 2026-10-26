import fs from 'fs';
import path from 'path';

export interface StudentAccountRecord {
  id: string;
  nama: string;
  kelas: string;
  tanggalLahir: string; // YYYY-MM-DD
  tanggalLahirDisplay?: string;
  akunBelajar: string;
  passwordAwal: string;
  nisn?: string;
  peran?: 'Peserta Didik' | 'Pendidik' | 'Tenaga Kependidikan';
  sekolah?: string;
}

export interface SheetConfig {
  sheetUrl: string;
  sheetId: string;
  lastSyncedAt: string | null;
  totalRecords: number;
  isCustom: boolean;
  sheetName?: string;
}

const ID_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(day) && monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${ID_MONTHS[monthIdx]} ${year}`;
    }
  }
  return dateStr;
}

export function normalizeDate(input: string): string {
  if (!input) return '';
  const clean = input.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // YYYY/MM/DD
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(clean)) {
    const [y, m, d] = clean.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD/MM/YYYY or D/M/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD-MM-YYYY or D-M-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split('-');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  for (let i = 0; i < ID_MONTHS.length; i++) {
    const monthName = ID_MONTHS[i];
    if (new RegExp(monthName, 'i').test(clean)) {
      const match = clean.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
      if (match) {
        const d = match[1].padStart(2, '0');
        const m = String(i + 1).padStart(2, '0');
        const y = match[3];
        return `${y}-${m}-${d}`;
      }
    }
  }

  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return clean;
}

export function extractSheetId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  const pubMatch = trimmed.match(/\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (pubMatch && pubMatch[1]) {
    return pubMatch[1];
  }

  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function buildSheetCsvUrl(rawInput: string): string {
  const trimmed = rawInput.trim();

  if (trimmed.includes('pub?output=csv') || trimmed.endsWith('.csv')) {
    return trimmed;
  }

  if (trimmed.includes('/pubhtml') || trimmed.includes('/pub')) {
    return trimmed.replace(/\/pubhtml.*|\/pub\??.*/, '/pub?output=csv');
  }

  const sheetId = extractSheetId(trimmed);
  if (sheetId) {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  }

  return trimmed;
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some(col => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export function mapCsvToRecords(rows: string[][]): StudentAccountRecord[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.toLowerCase().trim());

  const findIndex = (keywords: string[]): number => {
    return headers.findIndex(h => keywords.some(kw => h.includes(kw)));
  };

  const namaIdx = findIndex(['nama lengkap', 'nama', 'name', 'peserta didik', 'siswa']);
  const kelasIdx = findIndex(['kelas', 'rombel', 'tingkat', 'class']);
  const tglIdx = findIndex(['tanggal lahir', 'tgl lahir', 'tgl_lahir', 'ttl', 'birth', 'lahir']);
  const akunIdx = findIndex(['akun belajar', 'akun', 'email', 'user id', 'username', 'belajar.id']);
  const passIdx = findIndex(['password awal', 'password', 'kata sandi', 'sandi', 'pass']);
  const nisnIdx = findIndex(['nisn', 'nis', 'no induk', 'nik']);
  const peranIdx = findIndex(['peran', 'role', 'status', 'jabatan']);
  const sekolahIdx = findIndex(['sekolah', 'nama sekolah', 'instansi']);

  const records: StudentAccountRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const nama = namaIdx !== -1 ? row[namaIdx] || '' : row[0] || '';
    const kelas = kelasIdx !== -1 ? row[kelasIdx] || '' : row[1] || '';
    const rawTgl = tglIdx !== -1 ? row[tglIdx] || '' : row[2] || '';
    const akunBelajar = akunIdx !== -1 ? row[akunIdx] || '' : row[3] || '';
    const passwordAwal = passIdx !== -1 ? row[passIdx] || '' : row[4] || '';
    const nisn = nisnIdx !== -1 ? row[nisnIdx] || '' : undefined;
    const rawPeran = peranIdx !== -1 ? row[peranIdx] || '' : 'Peserta Didik';
    const sekolah = sekolahIdx !== -1 ? row[sekolahIdx] || undefined : undefined;

    if (!nama || !kelas || !akunBelajar) {
      continue;
    }

    const normalizedTgl = normalizeDate(rawTgl);
    let peran: 'Peserta Didik' | 'Pendidik' | 'Tenaga Kependidikan' = 'Peserta Didik';
    if (/guru|pendidik|teacher/i.test(rawPeran)) {
      peran = 'Pendidik';
    } else if (/tendik|staf|karyawan|staff/i.test(rawPeran)) {
      peran = 'Tenaga Kependidikan';
    }

    records.push({
      id: `backend-rec-${i}`,
      nama: nama.trim(),
      kelas: kelas.trim(),
      tanggalLahir: normalizedTgl,
      tanggalLahirDisplay: formatIndonesianDate(normalizedTgl),
      akunBelajar: akunBelajar.trim(),
      passwordAwal: passwordAwal.trim(),
      nisn: nisn?.trim(),
      peran,
      sekolah: sekolah?.trim() || 'Sekolah Resmi'
    });
  }

  return records;
}

export const DEFAULT_STUDENTS: StudentAccountRecord[] = [
  {
    id: "def-001",
    nama: "Muhammad Fauzi Rahman",
    kelas: "VII-A",
    tanggalLahir: "2011-04-15",
    tanggalLahirDisplay: "15 April 2011",
    akunBelajar: "muhammad.fauzi15@smp.belajar.id",
    passwordAwal: "Belajar#2024!",
    nisn: "0011894201",
    peran: "Peserta Didik",
    sekolah: "SMP Negeri 1 Nusantara"
  },
  {
    id: "def-002",
    nama: "Siti Nurhaliza",
    kelas: "VII-A",
    tanggalLahir: "2011-08-22",
    tanggalLahirDisplay: "22 Agustus 2011",
    akunBelajar: "siti.nurhaliza22@smp.belajar.id",
    passwordAwal: "Siti#Edu2024",
    nisn: "0011894202",
    peran: "Peserta Didik",
    sekolah: "SMP Negeri 1 Nusantara"
  },
  {
    id: "def-003",
    nama: "Andi Pratama Wijaya",
    kelas: "VIII-B",
    tanggalLahir: "2010-02-10",
    tanggalLahirDisplay: "10 Februari 2010",
    akunBelajar: "andi.pratama10@smp.belajar.id",
    passwordAwal: "Pratama#882",
    nisn: "0010783311",
    peran: "Peserta Didik",
    sekolah: "SMP Negeri 1 Nusantara"
  },
  {
    id: "def-004",
    nama: "Dewi Lestari Putri",
    kelas: "VIII-B",
    tanggalLahir: "2010-11-05",
    tanggalLahirDisplay: "5 November 2010",
    akunBelajar: "dewi.lestari05@smp.belajar.id",
    passwordAwal: "DewiLestari#1",
    nisn: "0010783312",
    peran: "Peserta Didik",
    sekolah: "SMP Negeri 1 Nusantara"
  },
  {
    id: "def-005",
    nama: "Rizky Ramadhani",
    kelas: "IX-C",
    tanggalLahir: "2009-09-17",
    tanggalLahirDisplay: "17 September 2009",
    akunBelajar: "rizky.ramadhani17@smp.belajar.id",
    passwordAwal: "Rizky#99Aktiv",
    nisn: "0009572101",
    peran: "Peserta Didik",
    sekolah: "SMP Negeri 1 Nusantara"
  },
  {
    id: "def-006",
    nama: "Alya Zahra Kirana",
    kelas: "X-MIPA 1",
    tanggalLahir: "2008-03-28",
    tanggalLahirDisplay: "28 Maret 2008",
    akunBelajar: "alya.zahra28@sma.belajar.id",
    passwordAwal: "Siswa#Sma2024",
    nisn: "0008461099",
    peran: "Peserta Didik",
    sekolah: "SMA Negeri 1 Nusantara"
  },
  {
    id: "def-007",
    nama: "Bima Arya Kusuma",
    kelas: "X-MIPA 1",
    tanggalLahir: "2008-07-12",
    tanggalLahirDisplay: "12 Juli 2008",
    akunBelajar: "bima.arya12@sma.belajar.id",
    passwordAwal: "BimaKusuma#24",
    nisn: "0008461100",
    peran: "Peserta Didik",
    sekolah: "SMA Negeri 1 Nusantara"
  },
  {
    id: "def-008",
    nama: "Citra Dewi Anggraini",
    kelas: "XI-IPS 2",
    tanggalLahir: "2007-06-19",
    tanggalLahirDisplay: "19 Juni 2007",
    akunBelajar: "citra.dewi19@sma.belajar.id",
    passwordAwal: "CitraEdu#77",
    nisn: "0007350021",
    peran: "Peserta Didik",
    sekolah: "SMA Negeri 1 Nusantara"
  },
  {
    id: "def-009",
    nama: "Dimas Saputra",
    kelas: "XII-MIPA 3",
    tanggalLahir: "2006-12-04",
    tanggalLahirDisplay: "4 Desember 2006",
    akunBelajar: "dimas.saputra04@sma.belajar.id",
    passwordAwal: "DimasLulus#24",
    nisn: "0006249912",
    peran: "Peserta Didik",
    sekolah: "SMA Negeri 1 Nusantara"
  },
  {
    id: "def-010",
    nama: "Drs. Bambang Sudarsono, M.Pd.",
    kelas: "Dewan Guru",
    tanggalLahir: "1978-05-10",
    tanggalLahirDisplay: "10 Mei 1978",
    akunBelajar: "bambang.sudarsono78@guru.smp.belajar.id",
    passwordAwal: "GuruMulia#78",
    nisn: "197805102005011003",
    peran: "Pendidik",
    sekolah: "SMP Negeri 1 Nusantara"
  }
];

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

export interface DatabaseState {
  config: SheetConfig;
  records: StudentAccountRecord[];
}

export function loadDatabase(): DatabaseState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.records) && parsed.records.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading database file, using fallback', e);
  }

  return {
    config: {
      sheetUrl: '',
      sheetId: 'default',
      lastSyncedAt: null,
      totalRecords: DEFAULT_STUDENTS.length,
      isCustom: false,
      sheetName: 'Database Sekolah Bawaan'
    },
    records: DEFAULT_STUDENTS
  };
}

export function saveDatabase(state: DatabaseState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed saving database file', e);
  }
}
