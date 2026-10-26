import React, { useState, useEffect } from 'react';
import { Search, User, Layers, Calendar, RotateCcw, Sparkles } from 'lucide-react';
import { SearchQueryParams } from '../types';

interface SampleStudent {
  id: string;
  nama: string;
  kelas: string;
  tanggalLahir: string;
}

interface LookupFormProps {
  availableClasses: string[];
  samples?: SampleStudent[];
  onSearch: (params: SearchQueryParams) => void;
  isLoading: boolean;
  onReset: () => void;
}

export const LookupForm: React.FC<LookupFormProps> = ({
  availableClasses,
  samples = [],
  onSearch,
  isLoading,
  onReset,
}) => {
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Set default class if available and not yet set
  useEffect(() => {
    if (availableClasses.length > 0 && !kelas) {
      setKelas(availableClasses[0]);
    }
  }, [availableClasses, kelas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedNama = nama.trim();
    if (!trimmedNama) {
      setErrorMessage('Silakan masukkan nama lengkap siswa atau guru.');
      return;
    }

    if (!kelas) {
      setErrorMessage('Silakan pilih kelas / rombel.');
      return;
    }

    if (!tanggalLahir) {
      setErrorMessage('Silakan masukkan tanggal lahir.');
      return;
    }

    onSearch({
      nama: trimmedNama,
      kelas,
      tanggalLahir,
    });
  };

  const handleResetForm = () => {
    setNama('');
    setTanggalLahir('');
    setErrorMessage('');
    onReset();
  };

  const handlePickSample = (sample: SampleStudent) => {
    setNama(sample.nama);
    setKelas(sample.kelas);
    setTanggalLahir(sample.tanggalLahir);
    setErrorMessage('');
    onSearch({
      nama: sample.nama,
      kelas: sample.kelas,
      tanggalLahir: sample.tanggalLahir,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Pencarian Akun Pembelajaran
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Masukkan 3 data identitas sesuai data resmi Dapodik sekolah Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Field 1: Nama Lengkap */}
        <div>
          <label 
            htmlFor="input-nama" 
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            1. Nama Lengkap Siswa / Guru
          </label>
          <div className="relative rounded-lg shadow-2xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <input
              id="input-nama"
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Muhammad Fauzi Rahman"
              className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <span className="block mt-1 text-xs text-slate-400">
            Ketik nama lengkap sesuai buku rapor atau akta lahir (tidak sensitif huruf besar/kecil).
          </span>
        </div>

        {/* 2-Column Grid for Kelas & Tanggal Lahir */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Field 2: Kelas */}
          <div>
            <label 
              htmlFor="select-kelas" 
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              2. Kelas / Rombel
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Layers className="h-4 w-4" />
              </div>
              <select
                id="select-kelas"
                required
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-8 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
              >
                <option value="" disabled>Pilih Kelas</option>
                {availableClasses.map((item) => (
                  <option key={item} value={item}>
                    Kelas {item}
                  </option>
                ))}
              </select>
            </div>
            <span className="block mt-1 text-xs text-slate-400">
              Pilih kelas rombel aktif saat ini.
            </span>
          </div>

          {/* Field 3: Tanggal Lahir */}
          <div>
            <label 
              htmlFor="input-tgl-lahir" 
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              3. Tanggal Lahir
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                id="input-tgl-lahir"
                type="date"
                required
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <span className="block mt-1 text-xs text-slate-400">
              Format tanggal lahir: Hari / Bulan / Tahun.
            </span>
          </div>
        </div>

        {/* Error notification if validation fails */}
        {errorMessage && (
          <div className="p-3 text-xs rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Actions Row */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Memvalidasi di Database Server...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Cari Akun Belajar</span>
              </>
            )}
          </button>

          {(nama || tanggalLahir) && (
            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto py-3 px-4 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-sm"
              title="Bersihkan form pencarian"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </form>

      {/* Demo sample helper for immediate evaluation */}
      {samples.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Coba langsung data contoh:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {samples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handlePickSample(sample)}
                className="text-xs py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 text-slate-700 transition-all text-left cursor-pointer"
              >
                <span className="font-semibold">{sample.nama}</span>
                <span className="text-slate-400 mx-1">·</span>
                <span className="text-slate-500">{sample.kelas}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
