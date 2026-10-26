import { StudentAccountRecord, SheetSourceConfig } from '../types';
import { MOCK_STUDENTS } from '../data/mockData';

const STORAGE_KEY_CONFIG = 'portal_belajar_sheet_config_v1';
const STORAGE_KEY_RECORDS = 'portal_belajar_sheet_records_v1';

// Indonesian Month Names
const ID_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Format YYYY-MM-DD to Indonesian readable format, e.g. "15 April 2011"
 */
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

/**
 * Normalizes varied date strings into canonical YYYY-MM-DD
 */
export function normalizeDate(input: string): string {
  if (!input) return '';
  const clean = input.trim();

  // Already YYYY-MM-DD
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

  // Check for Indonesian textual date: e.g. "15 April 2011"
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

  // Attempt standard Date parse
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return clean;
}

/**
 * Extracts Google Sheet ID from URL or returns raw ID
 */
export function extractSheetId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Matches /d/{id} in Google Sheets URL
  const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // Matches /e/{pubId} in Google Sheets Publish to web
  const pubMatch = trimmed.match(/\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (pubMatch && pubMatch[1]) {
    return pubMatch[1];
  }

  // Check if user entered direct 40+ alphanumeric ID
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Converts a Google Sheet URL/ID into a reliable CSV export URL
 */
export function buildSheetCsvUrl(rawInput: string): string {
  const trimmed = rawInput.trim();

  // Already a published CSV
  if (trimmed.includes('pub?output=csv') || trimmed.endsWith('.csv')) {
    return trimmed;
  }

  // If published web link ends with /pubhtml or /pub
  if (trimmed.includes('/pubhtml') || trimmed.includes('/pub')) {
    return trimmed.replace(/\/pubhtml.*|\/pub\??.*/, '/pub?output=csv');
  }

  const sheetId = extractSheetId(trimmed);
  if (sheetId) {
    // Google Visualization API CSV export is very fast and reliable for publicly shared sheets
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
  }

  // Fallback to direct input
  return trimmed;
}

/**
 * Robust RFC 4180 CSV parser
 */
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
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
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

/**
 * Maps raw CSV rows into structured StudentAccountRecord objects
 */
export function mapCsvToRecords(rows: string[][]): StudentAccountRecord[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.toLowerCase().trim());

  // Find column indices
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
      continue; // Skip invalid rows
    }

    const normalizedTgl = normalizeDate(rawTgl);
    let peran: 'Peserta Didik' | 'Pendidik' | 'Tenaga Kependidikan' = 'Peserta Didik';
    if (/guru|pendidik|teacher/i.test(rawPeran)) {
      peran = 'Pendidik';
    } else if (/tendik|staf|karyawan|staff/i.test(rawPeran)) {
      peran = 'Tenaga Kependidikan';
    }

    records.push({
      id: `sheet-rec-${i}`,
      nama: nama.trim(),
      kelas: kelas.trim(),
      tanggalLahir: normalizedTgl,
      tanggalLahirDisplay: formatIndonesianDate(normalizedTgl),
      akunBelajar: akunBelajar.trim(),
      passwordAwal: passwordAwal.trim(),
      nisn: nisn?.trim(),
      peran,
      sekolah: sekolah?.trim() || 'Sekolah Terdaftar'
    });
  }

  return records;
}

/**
 * Fetch and parse data from a Google Sheet CSV URL
 */
export async function fetchSheetData(inputUrl: string): Promise<{
  records: StudentAccountRecord[];
  csvUrl: string;
  sheetId: string;
}> {
  const csvUrl = buildSheetCsvUrl(inputUrl);
  const sheetId = extractSheetId(inputUrl) || 'custom-sheet';

  // Use fetch with cors mode
  const response = await fetch(csvUrl, {
    method: 'GET',
    headers: {
      'Accept': 'text/csv, text/plain, */*'
    }
  });

  if (!response.ok) {
    throw new Error(
      `Gagal memuat Google Sheet (${response.status}: ${response.statusText}). Pastikan link spreadsheet dapat diakses oleh "Siapa saja yang memiliki link" (Pelihat) atau telah dipublikasikan ke web.`
    );
  }

  const csvText = await response.text();
  if (!csvText || csvText.trim().length === 0) {
    throw new Error('Spreadsheet kosong atau tidak mengembalikan data yang valid.');
  }

  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    throw new Error('Spreadsheet harus memiliki minimal 1 baris header dan 1 baris data.');
  }

  const records = mapCsvToRecords(rows);
  if (records.length === 0) {
    throw new Error('Kolom Nama, Kelas, atau Akun Belajar tidak terdeteksi pada spreadsheet ini.');
  }

  return {
    records,
    csvUrl,
    sheetId
  };
}

/**
 * Load initial data and config from localStorage or defaults
 */
export function getSavedConfig(): SheetSourceConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read config from localStorage', e);
  }

  return {
    sheetUrl: '',
    sheetId: 'bawaan',
    lastSyncedAt: null,
    totalRecords: MOCK_STUDENTS.length,
    isCustom: false,
    sheetName: 'Data Simulasi Sekolah Resmi'
  };
}

export function saveConfig(config: SheetSourceConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.warn('Could not save config to localStorage', e);
  }
}

export function getSavedRecords(): StudentAccountRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (raw) {
      const records = JSON.parse(raw);
      if (Array.isArray(records) && records.length > 0) {
        return records;
      }
    }
  } catch (e) {
    console.warn('Could not read records from localStorage', e);
  }

  return MOCK_STUDENTS;
}

export function saveRecords(records: StudentAccountRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.warn('Could not save records to localStorage', e);
  }
}

export function resetToDefaultData(): { config: SheetSourceConfig; records: StudentAccountRecord[] } {
  localStorage.removeItem(STORAGE_KEY_CONFIG);
  localStorage.removeItem(STORAGE_KEY_RECORDS);
  const config: SheetSourceConfig = {
    sheetUrl: '',
    sheetId: 'bawaan',
    lastSyncedAt: null,
    totalRecords: MOCK_STUDENTS.length,
    isCustom: false,
    sheetName: 'Data Simulasi Sekolah Resmi'
  };
  return { config, records: MOCK_STUDENTS };
}
