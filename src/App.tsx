import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Lock,
  Link as LinkIcon
} from 'lucide-react';
import { StudentAccountRecord, SearchQueryParams } from './types';
import { 
  getClasses, 
  getSampleStudents, 
  searchStudentBackend 
} from './api/client';
import { Header } from './components/Header';
import { LookupForm } from './components/LookupForm';
import { AccountResultCard } from './components/AccountResultCard';
import { NotFoundFeedback } from './components/NotFoundFeedback';
import { ActivationGuideModal } from './components/ActivationGuideModal';
import { FaqModal } from './components/FaqModal';
import { PrintSlip } from './components/PrintSlip';
import { AdminPortal } from './components/AdminPortal';

interface SampleStudent {
  id: string;
  nama: string;
  kelas: string;
  tanggalLahir: string;
}

export default function App() {
  // Check if URL has ?admin=1 or ?admin=true
  const [isAdminView, setIsAdminView] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('admin') === '1' || params.get('admin') === 'true';
    }
    return false;
  });

  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [sampleStudents, setSampleStudents] = useState<SampleStudent[]>([]);
  const [sheetName, setSheetName] = useState<string>('Database Sekolah');
  
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'found' | 'not-found'>('idle');
  const [matchedRecord, setMatchedRecord] = useState<StudentAccountRecord | null>(null);
  const [lastQuery, setLastQuery] = useState<SearchQueryParams | null>(null);

  // Sync classes and samples from backend API
  const loadBackendData = async () => {
    try {
      const classesData = await getClasses();
      setAvailableClasses(classesData.classes);
      if (classesData.sheetName) {
        setSheetName(classesData.sheetName);
      }
      const samples = await getSampleStudents();
      setSampleStudents(samples);
    } catch (e) {
      console.warn('Failed loading backend classes', e);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // Listen for browser popstate or query changes
  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      setIsAdminView(params.get('admin') === '1' || params.get('admin') === 'true');
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleSearch = async (query: SearchQueryParams) => {
    setIsLoading(true);
    setLastQuery(query);

    try {
      const res = await searchStudentBackend(query);
      if (res.found && res.data) {
        setMatchedRecord(res.data);
        setSearchStatus('found');
      } else {
        setMatchedRecord(null);
        setSearchStatus('not-found');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setMatchedRecord(null);
      setSearchStatus('not-found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchStatus('idle');
    setMatchedRecord(null);
    setLastQuery(null);
  };

  const handleNavigateToAdmin = () => {
    const newUrl = `${window.location.pathname}?admin=1`;
    window.history.pushState({}, '', newUrl);
    setIsAdminView(true);
  };

  const handleNavigateToSearch = () => {
    const newUrl = window.location.pathname;
    window.history.pushState({}, '', newUrl);
    setIsAdminView(false);
    loadBackendData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Printable slip for printer / PDF view */}
      <PrintSlip record={matchedRecord} />

      {/* Main interactive screen (hidden when printing) */}
      <div className="no-print flex-1 flex flex-col">
        {/* Top Navbar */}
        <Header 
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenFaq={() => setIsFaqOpen(true)}
          onGoToAdmin={handleNavigateToAdmin}
          isAdminView={isAdminView}
        />

        {/* View Switcher: Admin Portal vs Pure Search View */}
        {isAdminView ? (
          <AdminPortal 
            onBackToSearch={handleNavigateToSearch}
            onDatabaseRefreshed={loadBackendData}
          />
        ) : (
          <>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 text-white pt-10 pb-20 sm:pt-14 sm:pb-24">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
              
              <div className="max-w-4xl mx-auto px-4 sm:px-6 relative text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-200 text-xs font-semibold mb-4 backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Layanan Mandiri Akun Pembelajaran (belajar.id)</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto text-balance">
                  Cek Akun Belajar & Kata Sandi Sekolah
                </h1>

                <p className="mt-3.5 text-sm sm:text-base text-blue-100/90 max-w-xl mx-auto leading-relaxed">
                  Cari kredensial akun <span className="font-semibold text-white">@belajar.id</span> dan password awal Anda secara mandiri dengan memasukkan Nama, Kelas, dan Tanggal Lahir.
                </p>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-blue-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Terhubung ke Server Database: <strong className="text-white font-mono">{sheetName}</strong></span>
                </div>
              </div>
            </section>

            {/* Content Container */}
            <main id="cari" className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 -mt-12 sm:-mt-14 pb-16 z-10 space-y-6">
              
              {/* Main Card: Search Form vs Result vs Not Found */}
              {searchStatus === 'idle' && (
                <LookupForm 
                  availableClasses={availableClasses}
                  samples={sampleStudents}
                  onSearch={handleSearch}
                  isLoading={isLoading}
                  onReset={handleResetSearch}
                />
              )}

              {searchStatus === 'found' && matchedRecord && (
                <AccountResultCard 
                  record={matchedRecord}
                  onSearchAnother={handleResetSearch}
                  onOpenGuide={() => setIsGuideOpen(true)}
                />
              )}

              {searchStatus === 'not-found' && lastQuery && (
                <NotFoundFeedback 
                  queryParams={lastQuery}
                  onRetry={handleResetSearch}
                  onOpenFaq={() => setIsFaqOpen(true)}
                />
              )}

              {/* Informational Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Validasi 3 Kriteria</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Mencocokkan nama lengkap, kelas aktif, dan tanggal lahir secara aman melalui backend database.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Sensor Password Terlindungi</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Kata sandi disamarkan dengan tanda bintang, dilengkapi tombol intip sandi dan tombol salin cepat.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Aktivasi Mandiri Cepat</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tersedia panduan resmi untuk langsung login pertama kali dan mengganti password di Google Workspace.
                  </p>
                </div>
              </div>

              {/* Guide Banner */}
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm sm:text-base font-bold text-blue-950">
                    Butuh bantuan mengaktifkan akun belajar.id?
                  </h4>
                  <p className="text-xs text-blue-800">
                    Ikuti langkah aktivasi dan login ke Google Workspace for Education dalam 2 menit.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsGuideOpen(true)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    Buka Panduan Aktivasi
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFaqOpen(true)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Pusat Bantuan
                  </button>
                </div>
              </div>

            </main>
          </>
        )}

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-700">Portal Akun Belajar.id</span>
              <span className="text-slate-300">·</span>
              <span>Layanan Mandiri Sekolah</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                Panduan
              </button>
              <button
                type="button"
                onClick={() => setIsFaqOpen(true)}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                FAQ
              </button>
              <button
                type="button"
                onClick={handleNavigateToAdmin}
                className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                title="Kelola akses Google Sheet di backend"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Kelola Database (Admin)</span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <ActivationGuideModal 
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <FaqModal 
        isOpen={isFaqOpen}
        onClose={() => setIsFaqOpen(false)}
      />

    </div>
  );
}
