import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDocument } from '../../contexts/DocumentContext';
import {
  FileText,
  Search,
  Globe,
  User as UserIcon,
  Sparkles,
  LogOut,
  UploadCloud,
} from 'lucide-react';

interface NavbarProps {
  onOpenUpload: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUpload, activeTab, setActiveTab }) => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, isDemoUser, signOut, signInWithGoogle, signInDemoAccount } = useAuth();
  const { searchQuery, setSearchQuery, documents } = useDocument();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex cursor-pointer items-center gap-2.5 transition hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 font-bold text-white shadow-lg shadow-indigo-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-display">
                  {t.appName}
                </span>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                  AI Archive
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden flex-1 max-w-md mx-6 md:block">
          <div className="relative">
            <Search className={`absolute top-2.5 h-4 w-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'archive') setActiveTab('archive');
              }}
              placeholder={t.searchPlaceholder}
              className={`w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'
              }`}
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="h-3.5 w-3.5 text-indigo-400" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="hidden sm:flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition active:scale-95"
          >
            <UploadCloud className="h-4 w-4" />
            <span>{t.navUpload}</span>
          </button>

          {/* User Account / Auth Menu */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden text-right lg:block">
                <p className="text-xs font-semibold text-slate-200">{user.displayName || user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-slate-400">{documents.length} Documents</p>
              </div>
              <button
                onClick={() => signOut()}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
                title={t.signOut}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : isDemoUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline font-mono text-[11px] rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-amber-300 font-semibold">
                ✨ Demo Mode
              </span>
              <button
                onClick={() => signInWithGoogle()}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                {t.signIn}
              </button>
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition"
            >
              {t.googleSignIn}
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
