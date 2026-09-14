import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDocument } from '../../contexts/DocumentContext';
import { Settings, ShieldCheck, Globe, Database, User, LogOut, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isDemoUser, signOut, signInWithGoogle } = useAuth();
  const { documents } = useDocument();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">System Settings & Security</h2>
            <p className="text-xs text-slate-400">Manage language preferences, authentication, and database security.</p>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-400" />
          <span>User Account & Security</span>
        </h3>

        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/60">
          <div>
            <p className="text-xs font-semibold text-slate-200">
              {user ? user.email : isDemoUser ? 'Demo Account Mode' : 'Not Authenticated'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {user ? 'Signed in via Firebase Auth' : 'Using temporary demo account credentials'}
            </p>
          </div>

          <div>
            {user ? (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition"
              >
                {t.googleSignIn}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Language Settings */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="h-4 w-4 text-indigo-400" />
          <span>Interface Language & RTL Support</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setLanguage('en')}
            className={`flex items-center justify-between p-4 rounded-xl border transition ${
              language === 'en'
                ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold'
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="text-xs">English (LTR)</span>
            {language === 'en' && <CheckCircle2 className="h-4 w-4 text-indigo-400" />}
          </button>

          <button
            onClick={() => setLanguage('ar')}
            className={`flex items-center justify-between p-4 rounded-xl border transition ${
              language === 'ar'
                ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold'
                : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="text-xs">العربية (RTL - Arabic)</span>
            {language === 'ar' && <CheckCircle2 className="h-4 w-4 text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* Database Security & Compliance */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="h-4 w-4 text-indigo-400" />
          <span>Firestore Cloud Database & ABAC Rules</span>
        </h3>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span>Project ID</span>
            <span className="font-mono text-indigo-400">gen-lang-client-0169200374</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span>Attribute-Based Access Control (ABAC)</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Enforced (`firestore.rules`)
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span>Total Stored Documents</span>
            <span className="font-mono text-white">{documents.length}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
