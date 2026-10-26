import React, { useState } from 'react';
import { 
  X, 
  Database, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  FileSpreadsheet, 
  RotateCcw,
  Info
} from 'lucide-react';
import { SheetSourceConfig, StudentAccountRecord } from '../types';
import { 
  fetchSheetData, 
  saveConfig, 
  saveRecords, 
  resetToDefaultData 
} from '../services/sheetService';
import { CSV_TEMPLATE_EXAMPLE } from '../data/mockData';

interface SheetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SheetSourceConfig;
  onConfigUpdated: (newConfig: SheetSourceConfig, newRecords: StudentAccountRecord[]) => void;
}

export const SheetConfigModal: React.FC<SheetConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
}) => {
  const [sheetInput, setSheetInput] = useState(config.sheetUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewRecords, setPreviewRecords] = useState<StudentAccountRecord[] | null>(null);

  if (!isOpen) return null;

  const handleSync = async () => {
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
      const result = await fetchSheetData(trimmed);
      const newConfig: SheetSourceConfig = {
        sheetUrl: trimmed,
        sheetId: result.sheetId,
        lastSyncedAt: new Date().toISOString(),
        totalRecords: result.records.length,
        isCustom: true,
        sheetName: 'Google Sheets Sinkron'
      };

      saveConfig(newConfig);
      saveRecords(result.records);
      setPreviewRecords(result.records.slice(0, 3));
      setSuccessMsg(`Berhasil menghubungkan dan membaca ${result.records.length} data siswa dari Google Sheet!`);
      onConfigUpdated(newConfig, result.records);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat Google Sheet. Pastikan link dapat diakses secara publik sebagai Pelihat.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefault = () => {
    const { config: defConfig, records: defRecords } = resetToDefaultData();
    setSheetInput('');
    setErrorMsg(null);
    setSuccessMsg('Berhasil mengembalikan ke Data Simulasi Bawaan.');
    setPreviewRecords(null);
    onConfigUpdated(defConfig, defRecords);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(CSV_TEMPLATE_EXAMPLE);
    setSuccessMsg('Format kolom CSV berhasil disalin ke clipboard!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full my-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Pengaturan Database Google Sheet
              </h3>
              <p className="text-xs text-slate-500">
                Hubungkan spreadsheet sekolah Anda untuk sumber data pencarian akun belajar.id
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Current Status */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <div className="font-semibold text-slate-900">
                Status Data Saat Ini: {config.isCustom ? 'Google Sheet Kustom' : 'Data Simulasi Bawaan'}
              </div>
              <div>
                Total data tersimpan: <span className="font-mono font-bold">{config.totalRecords}</span> akun.
                {config.lastSyncedAt && (
                  <span className="text-slate-500 ml-2">
                    (Sinkronisasi terakhir: {new Date(config.lastSyncedAt).toLocaleString('id-ID')})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Input Google Sheet URL */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Link Berbagi Google Sheet atau Publikasi CSV
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sheetInput}
                onChange={(e) => setSheetInput(e.target.value)}
                placeholder="Contoh: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5n.../edit?usp=sharing"
                className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <button
                type="button"
                onClick={handleSync}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sinkron...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sinkronkan</span>
                  </>
                )}
              </button>
            </div>
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

          {/* Preview of detected records */}
          {previewRecords && previewRecords.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Pratinjau Kolom Terdeteksi (3 Baris Teratas):
              </span>
              <div className="space-y-1.5">
                {previewRecords.map((r, i) => (
                  <div key={i} className="text-xs bg-white border border-slate-200 rounded-lg p-2.5 flex flex-wrap gap-x-4 gap-y-1">
                    <div><span className="text-slate-400">Nama:</span> <span className="font-semibold text-slate-800">{r.nama}</span></div>
                    <div><span className="text-slate-400">Kelas:</span> <span className="font-semibold text-slate-800">{r.kelas}</span></div>
                    <div><span className="text-slate-400">Tgl:</span> <span className="font-mono text-slate-800">{r.tanggalLahir}</span></div>
                    <div><span className="text-slate-400">Akun:</span> <span className="font-mono text-blue-700">{r.akunBelajar}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guide for School Admins */}
          <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Panduan Format Kolom Google Sheet:</span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Pastikan baris pertama (header) spreadsheet Anda memiliki kolom-kolom berikut:
            </p>

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

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors cursor-pointer"
              >
                Salin Format Template CSV
              </button>
              <a
                href="https://support.google.com/docs/answer/183965?hl=id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Cara Membagikan Google Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kembalikan ke Data Simulasi Bawaan</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
