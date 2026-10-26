import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Printer, 
  ExternalLink, 
  ShieldCheck, 
  ArrowLeft,
  KeyRound,
  Mail,
  GraduationCap
} from 'lucide-react';
import { StudentAccountRecord } from '../types';

interface AccountResultCardProps {
  record: StudentAccountRecord;
  onSearchAnother: () => void;
  onOpenGuide: () => void;
}

export const AccountResultCard: React.FC<AccountResultCardProps> = ({
  record,
  onSearchAnother,
  onOpenGuide,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(record.akunBelajar);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(record.passwordAwal);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-500/20 shadow-md overflow-hidden transition-all">
      {/* Official Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold block">
                Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi
              </span>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Kartu Akun Pembelajaran (belajar.id)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Identitas Terverifikasi</span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Identity Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-600 block mb-1">
              Nama Lengkap
            </span>
            <p className="text-base font-bold text-slate-900">
              {record.nama}
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-600 block mb-1">
              Kelas / Rombel
            </span>
            <p className="text-base font-semibold text-slate-800">
              Kelas {record.kelas}
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-600 block mb-1">
              Tanggal Lahir
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {record.tanggalLahirDisplay || record.tanggalLahir}
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-600 block mb-1">
              NISN / ID
            </span>
            <p className="text-sm font-mono font-semibold text-slate-800">
              {record.nisn || '-'}
            </p>
          </div>
        </div>

        {/* Credentials Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 pb-2 border-b border-slate-200">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <span>Kredensial Akses Akun Pembelajaran</span>
          </div>

          {/* Email Akun Belajar */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>User ID / Nama Akun (Email)</span>
            </label>
            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-2.5 sm:p-3 shadow-2xs">
              <span className="font-mono text-sm sm:text-base font-semibold text-blue-900 select-all break-all flex-1">
                {record.akunBelajar}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
                title="Salin email akun belajar"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Password Awal dengan Sensor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Password Awal (Kata Sandi)</span>
              </label>
              <span className="text-xs text-slate-600">
                {showPassword ? 'Terlihat' : 'Disensor untuk keamanan'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-2.5 sm:p-3 shadow-2xs">
              <div className="font-mono text-sm sm:text-base font-semibold text-slate-900 select-all flex-1">
                {showPassword ? (
                  <span>{record.passwordAwal}</span>
                ) : (
                  <span className="tracking-widest text-slate-400">
                    ••••••••••••
                  </span>
                )}
              </div>

              {/* View / Hide Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">Tutup</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">Lihat</span>
                  </>
                )}
              </button>

              {/* Copy Password Button */}
              <button
                type="button"
                onClick={handleCopyPassword}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
                title="Salin password awal"
              >
                {copiedPass ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-700 bg-amber-50/70 border border-amber-200/80 rounded-lg p-3">
            <span className="font-bold text-amber-900">Perhatian Keamanan:</span> Password di atas merupakan kata sandi bawaan dari Kemendikbudristek. Saat login pertama kali di Google, sistem akan mewajibkan Anda untuk membuat password baru yang hanya diketahui oleh Anda sendiri.
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onSearchAnother}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cari Siswa Lain</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              type="button"
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer"
            >
              <span>Cara Aktivasi</span>
            </button>

            <a
              href="https://accounts.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              <span>Buka Akun Google</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
