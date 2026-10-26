import React from 'react';
import { AlertCircle, ArrowLeft, HelpCircle, CheckCircle } from 'lucide-react';
import { SearchQueryParams } from '../types';

interface NotFoundFeedbackProps {
  queryParams: SearchQueryParams;
  onRetry: () => void;
  onOpenFaq: () => void;
}

export const NotFoundFeedback: React.FC<NotFoundFeedbackProps> = ({
  queryParams,
  onRetry,
  onOpenFaq,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center max-w-2xl mx-auto">
      <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">
        Data Akun Belajar Tidak Ditemukan
      </h3>
      <p className="text-sm text-slate-600 mb-6 max-w-lg mx-auto">
        Kombinasi data nama <span className="font-semibold text-slate-900">"{queryParams.nama}"</span>, kelas <span className="font-semibold text-slate-900">"{queryParams.kelas}"</span>, dan tanggal lahir <span className="font-semibold text-slate-900">"{queryParams.tanggalLahir}"</span> tidak cocok dengan database sekolah.
      </p>

      {/* Helpful Checklist Tips */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left mb-6 space-y-3">
        <span className="text-xs uppercase tracking-wider font-bold text-slate-700 block">
          Langkah Pengecekan Mandiri:
        </span>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>Pastikan penulisan nama sesuai dengan nama di buku rapor atau data Dapodik (hindari nama panggilan).</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>Pastikan memilih rombel kelas saat ini, bukan kelas tahun ajaran sebelumnya.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>Periksa kembali tanggal, bulan, dan tahun lahir yang dimasukkan.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>Bagi siswa baru atau mutasi, penerbitan akun belajar.id oleh Pusdatin membutuhkan waktu sinkronisasi berkala.</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ubah Kata Kunci Pencarian</span>
        </button>

        <button
          type="button"
          onClick={onOpenFaq}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>Pusat Bantuan & Operator</span>
        </button>
      </div>
    </div>
  );
};
