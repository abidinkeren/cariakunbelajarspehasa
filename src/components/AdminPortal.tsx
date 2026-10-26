import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  FileSpreadsheet, 
  RotateCcw,
  Info,
  Copy,
  Link,
  ArrowLeft,
  GraduationCap,
  ShieldAlert
} from 'lucide-react';
import { SheetSourceConfig, StudentAccountRecord } from '../types';
import { 
  getAdminConfig, 
  updateAdminSheet, 
  resetAdminSheet 
} from '../api/client';
import { CSV_TEMPLATE_EXAMPLE } from '../data/mockData';

interface AdminPortalProps {
  onBackToSearch: () => void;
  onDatabaseRefreshed: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onBackToSearch,
  onDatabaseRefreshed,
}) => {
  const [config, setConfig] = useState<SheetSourceConfig | null>(null);
  const [sheetInput, setSheetInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingConfig, setIsFetchingConfig] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewRecords, setPreviewRecords] = useState<StudentAccountRecord[] | null>(null);
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);

  const searchPageLink = typeof window !== 'undefined' ? window.location.origin : '';
  const adminPageLink = typeof window !== 'undefined' ? `${window.location.origin}?admin=1` : '';

  const loadCurrentConfig = async () => {
    setIsFetchingConfig(true);
    try {
      const res = await getAdminConfig();
      setConfig(res.config);
      setPreviewRecords(res.sampleRecords);
      if (res.config.sheetUrl) {
        setSheetInput(res.config.sheetUrl);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Gagal mengambil status database dari backend.');
    } finally {
      setIsFetchingConfig(false);
    }
  };

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setPreviewRecords(null);

    const trimmed = sheetInput.trim();
    if (!trimmed) {
      setErrorMsg('Silakan masukkan link Google Sheet atau Spreadsheet ID.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateAdminSheet(trimmed);
      if (result.config) {
        setConfig(result.config);
      }
      if (result.preview) {
        setPreviewRecords(result.preview);
      }
      setSuccessMsg(result.message || 'Google Sheet berhasil dihubungkan ke backend!');
      onDatabaseRefreshed();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat Google Sheet di backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mengembalikan database ke data simulasi bawaan?')) {
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await resetAdminSheet();
      setConfig(res.config);
      setSheetInput('');
      setPreviewRecords(null);
      setSuccessMsg(res.message);
      onDatabaseRefreshed();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mereset database.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLinkType(type);
    setTimeout(() => setCopiedLinkType(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          type="button"
          onClick={onBackToSearch}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Pencarian Siswa</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>Panel Backend Database Google Sheet</span>
        </div>
      </div>

      {/* Shareable Links Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Link className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Tautan Akses Aplikasi
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Gunakan tautan berikut untuk dibagikan kepada peserta didik atau disimpan oleh operator sekolah.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Link Pencarian Siswa */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              1. Link Halaman Pencarian (Untuk Siswa/Guru)
            </span>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={searchPageLink} 
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none select-all"
              />
              <button
                type="button"
                onClick={() => handleCopyLink(searchPageLink, 'search')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedLinkType === 'search' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <span className="text-[11px] text-slate-600 block">
              Tampilan murni pencarian tanpa menu admin.
            </span>
          </div>

          {/* Link Admin Database */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              2. Link Kelola Database (Untuk Operator/Admin)
            </span>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={adminPageLink} 
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none select-all"
              />
              <button
                type="button"
                onClick={() => handleCopyLink(adminPageLink, 'admin')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedLinkType === 'admin' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <span className="text-[11px] text-slate-600 block">
              Simpan link ini untuk memperbarui database Google Sheet sewaktu-waktu.
            </span>
          </div>
        </div>
      </div>

      {/* Backend Database Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Koneksi Google Sheet ke Backend Server</span>
          </h2>
          {config && (
            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              {config.totalRecords} Baris Data
            </span>
          )}
        </div>

        {isFetchingConfig ? (
          <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Memeriksa status database backend...</span>
          </div>
        ) : (
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <div>
                <strong>Status Database:</strong>{' '}
                <span className="font-semibold text-blue-900">
                  {config?.isCustom ? 'Terhubung dengan Google Sheet Kustom' : 'Menggunakan Data Sekolah Bawaan'}
                </span>
              </div>
              <div>
                <strong>Total Data Tersimpan di Server:</strong>{' '}
                <span className="font-mono font-bold">{config?.totalRecords || 0} akun</span>
              </div>
              {config?.lastSyncedAt && (
                <div>
                  <strong>Waktu Sinkronisasi Terakhir:</strong>{' '}
                  <span className="font-mono">{new Date(config.lastSyncedAt).toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form to update Google Sheet URL */}
        <form onSubmit={handleSync} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              URL Google Sheet Sekolah (Publik / Pelihat)
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                required
                value={sheetInput}
                onChange={(e) => setSheetInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5n.../edit?usp=sharing"
                className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sinkronkan Backend...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Simpan & Sinkronkan</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1.5">
              Backend server akan mengambil data spreadsheet, memvalidasi kolom, dan menyimpannya secara terpusat.
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3.5 text-xs rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 text-xs rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}
        </form>

        {/* Preview of detected records in backend */}
        {previewRecords && previewRecords.length > 0 && (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Pratinjau Data yang Tersimpan di Backend:
            </span>
            <div className="space-y-1.5">
              {previewRecords.map((r, i) => (
                <div key={i} className="text-xs bg-white border border-slate-200 rounded-lg p-2.5 flex flex-wrap gap-x-4 gap-y-1">
                  <div><span className="text-slate-600">Nama:</span> <span className="font-semibold text-slate-900">{r.nama}</span></div>
                  <div><span className="text-slate-600">Kelas:</span> <span className="font-semibold text-slate-900">{r.kelas}</span></div>
                  <div><span className="text-slate-600">Tgl:</span> <span className="font-mono text-slate-900">{r.tanggalLahir}</span></div>
                  <div><span className="text-slate-600">Akun:</span> <span className="font-mono text-blue-700">{r.akunBelajar}</span></div>
                  <div><span className="text-slate-600">Password:</span> <span className="font-mono text-slate-700">{r.passwordAwal}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guide for School Admins */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Format Kolom Google Sheet yang Didukung Backend:</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-blue-800">Nama</span>
              <p className="text-slate-600 text-[11px]">Nama Lengkap Siswa</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-blue-800">Kelas</span>
              <p className="text-slate-600 text-[11px]">Rombel (e.g. VII-A)</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-blue-800">Tanggal Lahir</span>
              <p className="text-slate-600 text-[11px]">YYYY-MM-DD / DD/MM/YYYY</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-blue-800">Akun Belajar</span>
              <p className="text-slate-600 text-[11px]">email @belajar.id</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-blue-800">Password Awal</span>
              <p className="text-slate-600 text-[11px]">Kata sandi awal</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-blue-800">NISN</span>
              <p className="text-slate-600 text-[11px]">Nomor Induk Siswa</p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(CSV_TEMPLATE_EXAMPLE);
                setSuccessMsg('Format kolom berhasil disalin!');
                setTimeout(() => setSuccessMsg(null), 3000);
              }}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors cursor-pointer"
            >
              Salin Format Contoh Kolom CSV
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan ke Database Bawaan</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
