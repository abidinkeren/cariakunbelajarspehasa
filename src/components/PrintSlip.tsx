import React from 'react';
import { StudentAccountRecord } from '../types';

interface PrintSlipProps {
  record: StudentAccountRecord | null;
}

export const PrintSlip: React.FC<PrintSlipProps> = ({ record }) => {
  if (!record) return null;

  return (
    <div className="hidden print:block p-8 max-w-xl mx-auto border-2 border-slate-900 rounded-xl my-4 text-slate-900 bg-white">
      {/* Print Slip Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center">
        <h2 className="text-xs uppercase tracking-widest font-bold text-slate-600">
          KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
        </h2>
        <h1 className="text-lg font-bold uppercase mt-1">
          KARTU BUKTI KREDENSIAL AKUN PEMBELAJARAN (BELAJAR.ID)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {record.sekolah || 'Satuan Pendidikan Resmi Terdaftar'}
        </p>
      </div>

      {/* Identity Table */}
      <table className="w-full text-xs mb-4 border-collapse">
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="py-1.5 font-bold w-1/3 text-slate-600">Nama Lengkap</td>
            <td className="py-1.5 font-semibold text-slate-900">: {record.nama}</td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-1.5 font-bold text-slate-600">Kelas / Rombel</td>
            <td className="py-1.5 text-slate-900">: Kelas {record.kelas}</td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-1.5 font-bold text-slate-600">Tanggal Lahir</td>
            <td className="py-1.5 text-slate-900">: {record.tanggalLahirDisplay || record.tanggalLahir}</td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-1.5 font-bold text-slate-600">NISN / Nomor Induk</td>
            <td className="py-1.5 font-mono text-slate-900">: {record.nisn || '-'}</td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-1.5 font-bold text-slate-600">Peran</td>
            <td className="py-1.5 text-slate-900">: {record.peran || 'Peserta Didik'}</td>
          </tr>
        </tbody>
      </table>

      {/* Credentials Box */}
      <div className="border border-slate-900 rounded-lg p-3 bg-slate-50 mb-4 space-y-2">
        <div className="text-xs font-bold uppercase text-slate-700">
          Informasi Akun Pembelajaran:
        </div>
        <div className="text-xs">
          <span className="text-slate-500">Email Akun (User ID): </span>
          <span className="font-mono font-bold text-sm text-slate-900">{record.akunBelajar}</span>
        </div>
        <div className="text-xs">
          <span className="text-slate-500">Password Awal: </span>
          <span className="font-mono font-bold text-sm text-slate-900">{record.passwordAwal}</span>
        </div>
      </div>

      {/* Official Footnote */}
      <div className="text-[10px] text-slate-600 space-y-1 border-t border-slate-200 pt-3">
        <p className="font-semibold">Catatan Penting:</p>
        <ol className="list-decimal pl-4 space-y-0.5">
          <li>Segera lakukan aktivasi di laman https://accounts.google.com.</li>
          <li>Ubah password awal ini saat login pertama kali dan simpan kata sandi baru Anda di tempat aman.</li>
          <li>Kartu ini dicetak sebagai tanda bukti resmi dan tidak boleh disebarluaskan kepada pihak lain.</li>
        </ol>
      </div>

      <div className="mt-6 flex justify-between items-end text-[11px] pt-4">
        <div>
          <p className="text-slate-500">Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
        </div>
        <div className="text-center w-40">
          <p className="text-slate-500 mb-10">Staf Operator Sekolah</p>
          <div className="border-b border-slate-400 w-32 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};
