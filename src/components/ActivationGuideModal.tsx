import React from 'react';
import { X, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ActivationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivationGuideModal: React.FC<ActivationGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: "01",
      title: "Buka Laman Login Google",
      desc: "Kunjungi laman accounts.google.com atau mail.google.com pada peramban (Chrome, Edge, Safari, dll.). Jika sudah ada akun pribadi, klik profil akun di pojok kanan atas lalu pilih 'Tambahkan Akun Lain'.",
    },
    {
      num: "02",
      title: "Masukkan Alamat Email Akun Belajar",
      desc: "Ketik User ID lengkap yang didapatkan dari portal ini, misalnya nama.siswa15@smp.belajar.id atau nama.siswa@sma.belajar.id lalu klik Berikutnya.",
    },
    {
      num: "03",
      title: "Ketik Password Awal",
      desc: "Ketikkan kata sandi awal yang muncul di portal ini (perhatikan kombinasi huruf besar, kecil, angka, dan tanda baca).",
    },
    {
      num: "04",
      title: "Setujui Syarat & Ketentuan Layanan",
      desc: "Akan muncul jendela persetujuan Google Workspace for Education. Baca ringkasan ketentuan lalu klik 'Saya Setuju' (Accept / I agree).",
    },
    {
      num: "05",
      title: "Buat Kata Sandi Baru Anda Sendiri",
      desc: "Sistem akan mewajibkan Anda untuk membuat kata sandi baru. Gunakan minimal 8 karakter dengan kombinasi huruf, angka, dan simbol. Catat kata sandi baru tersebut di tempat aman.",
    },
    {
      num: "06",
      title: "Akun Siap Digunakan Sepuasnya",
      desc: "Selamat! Akun belajar.id Anda telah aktif dan dapat langsung digunakan untuk Google Classroom, Google Drive, Canva for Education gratis, Quizizz, dan platform pembelajaran lainnya.",
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full my-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Panduan Aktivasi Akun Belajar.id
              </h3>
              <p className="text-xs text-blue-100">
                Langkah resmi mengaktifkan akun Google Workspace for Education pertama kali
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                {step.num}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Useful Tips */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Tips Tambahan dari Tim Sekolah:</span>
            </span>
            <p className="text-amber-800 leading-relaxed">
              Jika mengalami kendala gagal login (misal kata sandi salah), pastikan tidak ada spasi di awal atau akhir saat menyalin akun maupun kata sandi. Jika masih terkendala, hubungi staf operator sekolah Anda untuk permohonan reset password di portal admin Kemendikbudristek.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <a
            href="https://accounts.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>Buka Laman Login Google Sekarang</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            Mengerti & Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
