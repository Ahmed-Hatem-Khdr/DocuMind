import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDocument } from '../../contexts/DocumentContext';
import { DocumentCategory } from '../../types/document';
import {
  FileText,
  FolderArchive,
  UploadCloud,
  MessageSquareCode,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Tag,
  Layers,
} from 'lucide-react';

interface OverviewStatsProps {
  onOpenUpload: () => void;
  setActiveTab: (tab: string) => void;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({ onOpenUpload, setActiveTab }) => {
  const { t } = useLanguage();
  const { documents, reminders, setSelectedDoc } = useDocument();

  // Category statistics calculation
  const categoryCounts: Record<string, number> = {};
  documents.forEach((doc) => {
    categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
  });

  const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI-Powered Personal Digital Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display mb-2">
            Your documents are more than files.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Transform invoices, contracts, IDs, and certificates into structured, searchable, and actionable intelligence.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition active:scale-95"
            >
              <UploadCloud className="h-4 w-4" />
              <span>{t.uploadFirstDoc}</span>
            </button>
            <button
              onClick={() => setActiveTab('ask-archive')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-200 transition"
            >
              <MessageSquareCode className="h-4 w-4 text-indigo-400" />
              <span>{t.navAskArchive}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t.totalDocuments}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <FolderArchive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{documents.length}</span>
            <span className="text-xs text-slate-400">files archived</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t.categories}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{Object.keys(categoryCounts).length}</span>
            <span className="text-xs text-slate-400">active categories</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Deadlines & Reminders</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{reminders.length}</span>
            <span className="text-xs text-slate-400">tracked dates</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Security & Isolation</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xs font-semibold text-emerald-400">ABAC Firestore Enforced</span>
          </div>
        </div>
      </div>

      {/* Categories Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Categories Breakdown Panel */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center justify-between">
            <span>Archive Categories</span>
            <button
              onClick={() => setActiveTab('archive')}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </h3>

          <div className="space-y-3">
            {topCategories.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No categories yet.</p>
            ) : (
              topCategories.map(([category, count]) => {
                const percentage = Math.round((count / documents.length) * 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{category}</span>
                      <span className="text-slate-400 font-mono">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recently Uploaded Documents */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center justify-between">
            <span>Recently Uploaded</span>
            <button
              onClick={() => setActiveTab('archive')}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              Go to Archive <ArrowRight className="h-3 w-3" />
            </button>
          </h3>

          <div className="space-y-2.5">
            {documents.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/40 p-3 hover:bg-slate-800/50 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300">
                        {doc.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{doc.uploadDate}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
