import { StudentAccountRecord, SheetSourceConfig, SearchQueryParams } from '../types';

export interface SearchResponse {
  found: boolean;
  data?: StudentAccountRecord;
  message?: string;
}

export interface ClassesResponse {
  classes: string[];
  totalRecords: number;
  sheetName?: string;
}

export interface AdminConfigResponse {
  config: SheetSourceConfig;
  totalRecords: number;
  sampleRecords: StudentAccountRecord[];
}

export interface UpdateSheetResponse {
  success: boolean;
  message?: string;
  error?: string;
  config?: SheetSourceConfig;
  totalRecords?: number;
  preview?: StudentAccountRecord[];
}

export async function getClasses(): Promise<ClassesResponse> {
  const res = await fetch('/api/classes');
  if (!res.ok) {
    throw new Error('Gagal memuat daftar kelas dari server.');
  }
  return res.json();
}

export async function searchStudentBackend(params: SearchQueryParams): Promise<SearchResponse> {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal memproses pencarian di server.');
  }
  return res.json();
}

export async function getSampleStudents(): Promise<Array<{ id: string; nama: string; kelas: string; tanggalLahir: string }>> {
  const res = await fetch('/api/sample-students');
  if (!res.ok) return [];
  const data = await res.json();
  return data.samples || [];
}

export async function getAdminConfig(): Promise<AdminConfigResponse> {
  const res = await fetch('/api/admin/config');
  if (!res.ok) {
    throw new Error('Gagal memuat status database dari server.');
  }
  return res.json();
}

export async function updateAdminSheet(sheetUrl: string): Promise<UpdateSheetResponse> {
  const res = await fetch('/api/admin/sheet-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheetUrl })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal menyinkronkan Google Sheet di backend.');
  }
  return data;
}

export async function resetAdminSheet(): Promise<{ success: boolean; message: string; config: SheetSourceConfig }> {
  const res = await fetch('/api/admin/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal mengembalikan database bawaan.');
  }
  return data;
}
