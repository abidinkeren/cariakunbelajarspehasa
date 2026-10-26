export interface StudentAccountRecord {
  id: string;
  nama: string;
  kelas: string;
  tanggalLahir: string; // Standard format YYYY-MM-DD
  tanggalLahirDisplay?: string; // Formatted display, e.g. "15 Mei 2008"
  akunBelajar: string;
  passwordAwal: string;
  nisn?: string;
  peran?: 'Peserta Didik' | 'Pendidik' | 'Tenaga Kependidikan';
  sekolah?: string;
}

export interface SheetSourceConfig {
  sheetUrl: string;
  sheetId: string;
  lastSyncedAt: string | null;
  totalRecords: number;
  isCustom: boolean;
  sheetName?: string;
}

export interface SearchQueryParams {
  nama: string;
  kelas: string;
  tanggalLahir: string; // YYYY-MM-DD
}
