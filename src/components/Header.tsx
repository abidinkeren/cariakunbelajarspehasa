import React from 'react';
import { HelpCircle, BookOpen, ExternalLink, GraduationCap, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
  onOpenFaq: () => void;
  onGoToAdmin?: () => void;
  isAdminView?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGuide,
  onOpenFaq,
  onGoToAdmin,
  isAdminView = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6 md:gap-8">
        
        {/* Zone 1: Single Brand element */}
        <a 
          href="/" 
          className="flex items-center gap-2.5 text-slate-900 font-bold text-lg tracking-tight whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="flex items-center gap-1.5 font-bold">
            Portal Akun <span className="text-blue-600">belajar.id</span>
          </span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="/" className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0">
            Pencarian Akun
          </a>
          <button 
            type="button"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Panduan Aktivasi</span>
          </button>
          <button 
            type="button"
            onClick={onOpenFaq}
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Bantuan & FAQ</span>
          </button>
          <a 
            href="https://accounts.google.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Login Google</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {isAdminView ? (
            <a
              href="/"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Mode Pencarian Siswa
            </a>
          ) : (
            <button
              type="button"
              onClick={onOpenGuide}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
            >
              Panduan Siswa
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
