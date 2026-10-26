import { StudentAccountRecord } from '../types';

export const INITIAL_SCHOOL_NAME = "SMP & SMA Negeri Nusantara";

export const MOCK_STUDENTS: StudentAccountRecord[] = [
  {
    id: "rec-001",
    nama: "Muhammad Fauzi Rahman",
    kelas: "VII-A",
    tanggalLahir: "2011-04-15",
    tanggalLahirDisplay: "15 April 2011",
    akunBelajar: "muhammad.fauzi15@smp.belajar.id",
    passwordAwal: "Belajar#2024!",
    nisn: "0011894201",
    peran: "Peserta Didik",
    sekolah: "SMP Negeri 1 Nusantara"
  },
  {
    id: "rec-002",
    nama: "Siti Nurhaliza",
    kelas: "VII-A",
    tanggalLahir: "2011-08-22",
    tanggalLahirDisplay: "22 Agustus 2011",
    akunBelajar: "siti.nurhaliza22@smp.belajar.id",
    passwordAwal: "Siti#Edu2024",
    nisn: "0011894202",
    peran: "Peserta Didik",
    sekolah: "SMP Negeri 1 Nusantara"
  },
  {
    id: "rec-003",
    nama: "Andi Pratama Wijaya",
    kelas: "VIII-B",
    tanggalLahir: "2010-02-10",
    tanggalLahirDisplay: "10 Februari 2010",
    akunBelajar: "andi.pratama10@smp.belajar.id",
    passwordAwal: "Pratama#882",
    nisn: "0010783311",
    peran: "Peserta Didik",
    sekolah: "SMP Negeri 1 Nusantara"
  },
  {
    id: "rec-004",
    nama: "Dewi Lestari Putri",
    kelas: "VIII-B",
    tanggalLahir: "2010-11-05",
    tanggalLahirDisplay: "5 November 2010",
    akunBelajar: "dewi.lestari05@smp.belajar.id",
    passwordAwal: "DewiLestari#1",
    nisn: "0010783312",
    peran: "Peserta Didik",
    sekolah: "SMP Negeri 1 Nusantara"
  },
  {
    id: "rec-005",
    nama: "Rizky Ramadhani",
    kelas: "IX-C",
    tanggalLahir: "2009-09-17",
    tanggalLahirDisplay: "17 September 2009",
    akunBelajar: "rizky.ramadhani17@smp.belajar.id",
    passwordAwal: "Rizky#99Aktiv",
    nisn: "0009572101",
    peran: "Peserta Didik",
    sekolah: "SMP Negeri 1 Nusantara"
  },
  {
    id: "rec-006",
    nama: "Alya Zahra Kirana",
    kelas: "X-MIPA 1",
    tanggalLahir: "2008-03-28",
    tanggalLahirDisplay: "28 Maret 2008",
    akunBelajar: "alya.zahra28@sma.belajar.id",
    passwordAwal: "Siswa#Sma2024",
    nisn: "0008461099",
    peran: "Peserta Didik",
    sekolah: "SMA Negeri 1 Nusantara"
  },
  {
    id: "rec-007",
    nama: "Bima Arya Kusuma",
    kelas: "X-MIPA 1",
    tanggalLahir: "2008-07-12",
    tanggalLahirDisplay: "12 Juli 2008",
    akunBelajar: "bima.arya12@sma.belajar.id",
    passwordAwal: "BimaKusuma#24",
    nisn: "0008461100",
    peran: "Peserta Didik",
    sekolah: "SMA Negeri 1 Nusantara"
  },
  {
    id: "rec-008",
    nama: "Citra Dewi Anggraini",
    kelas: "XI-IPS 2",
    tanggalLahir: "2007-06-19",
    tanggalLahirDisplay: "19 Juni 2007",
    akunBelajar: "citra.dewi19@sma.belajar.id",
    passwordAwal: "CitraEdu#77",
    nisn: "0007350021",
    peran: "Peserta Didik",
    sekolah: "SMA Negeri 1 Nusantara"
  },
  {
    id: "rec-009",
    nama: "Dimas Saputra",
    kelas: "XII-MIPA 3",
    tanggalLahir: "2006-12-04",
    tanggalLahirDisplay: "4 Desember 2006",
    akunBelajar: "dimas.saputra04@sma.belajar.id",
    passwordAwal: "DimasLulus#24",
    nisn: "0006249912",
    peran: "Peserta Didik",
    sekolah: "SMA Negeri 1 Nusantara"
  },
  {
    id: "rec-010",
    nama: "Drs. Bambang Sudarsono, M.Pd.",
    kelas: "Dewan Guru",
    tanggalLahir: "1978-05-10",
    tanggalLahirDisplay: "10 Mei 1978",
    akunBelajar: "bambang.sudarsono78@guru.smp.belajar.id",
    passwordAwal: "GuruMulia#78",
    nisn: "197805102005011003",
    peran: "Pendidik",
    sekolah: "SMP Negeri 1 Nusantara"
  }
];

export const CSV_TEMPLATE_EXAMPLE = `Nama,Kelas,Tanggal Lahir,Akun Belajar,Password Awal,NISN,Peran
Muhammad Fauzi Rahman,VII-A,2011-04-15,muhammad.fauzi15@smp.belajar.id,Belajar#2024!,0011894201,Peserta Didik
Siti Nurhaliza,VII-A,2011-08-22,siti.nurhaliza22@smp.belajar.id,Siti#Edu2024,0011894202,Peserta Didik
Alya Zahra Kirana,X-MIPA 1,2008-03-28,alya.zahra28@sma.belajar.id,Siswa#Sma2024,0008461099,Peserta Didik
Citra Dewi Anggraini,XI-IPS 2,2007-06-19,citra.dewi19@sma.belajar.id,CitraEdu#77,0007350021,Peserta Didik
Drs. Bambang Sudarsono M.Pd,Dewan Guru,1978-05-10,bambang.sudarsono78@guru.smp.belajar.id,GuruMulia#78,197805102005011003,Pendidik`;
