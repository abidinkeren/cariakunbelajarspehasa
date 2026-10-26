import React from 'react';
import { X, HelpCircle } from 'lucide-react';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const faqs = [
    {
      q: "Apa itu Akun Pembelajaran (belajar.id)?",
      a: "Akun Pembelajaran merupakan akun elektronik resmi berupa Google Workspace for Education yang diterbitkan oleh Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (Kemendikbudristek) untuk seluruh peserta didik, pendidik, dan tenaga kependidikan di Indonesia."
    },
    {
      q: "Mengapa nama saya tidak ditemukan saat pencarian?",
      a: "Pencarian memerlukan kecocokan 3 data: Nama Lengkap, Kelas, dan Tanggal Lahir. Pastikan ejaan nama sesuai dengan data Dapodik (bukan nama panggilan). Jika Anda siswa baru, akun mungkin sedang dalam proses antrean penerbitan dari Pusdatin."
    },
    {
      q: "Apakah password awal yang tertera aman?",
      a: "Ya. Password awal di sistem ini disamarkan secara default dan hanya berupa kata sandi sementara. Ketika pertama kali login di Google, Anda akan diwajibkan oleh sistem keamanan Google untuk menggantinya dengan kata sandi pribadi baru."
    },
    {
      q: "Bagaimana jika saya lupa password setelah sempat menggantinya?",
      a: "Password yang tertera di portal ini adalah kata sandi awal/bawaan dari pusat. Jika Anda sudah pernah menggantinya lalu lupa, silakan hubungi Operator Dapodik / Admin Sekolah Anda untuk meminta permohonan Reset Password resmi."
    },
    {
      q: "Apa saja manfaat memiliki akun belajar.id?",
      a: "Kapasitas penyimpanan Google Drive yang luas, akses gratis ke Canva for Education Pro, Google Classroom tanpa batas waktu Google Meet, integrasi ke Rapor Pendidikan, Platform Merdeka Mengajar (PMM), dan layanan asesmen nasional."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full my-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Pusat Bantuan & Tanya Jawab (FAQ)
              </h3>
              <p className="text-xs text-slate-500">
                Informasi seputar penggunaan dan pemecahan masalah akun belajar.id
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

        {/* FAQ list */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600">Q:</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
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
