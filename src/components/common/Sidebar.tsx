import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDocument } from '../../contexts/DocumentContext';
import {
  LayoutDashboard,
  FolderArchive,
  UploadCloud,
  MessageSquareCode,
  GitCompare,
  Settings,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenUpload }) => {
  const { t } = useLanguage();
  const { documents, reminders } = useDocument();

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'archive', label: t.navArchive, icon: FolderArchive, badge: documents.length },
    { id: 'upload', label: t.navUpload, icon: UploadCloud, action: onOpenUpload },
    { id: 'ask-archive', label: t.navAskArchive, icon: MessageSquareCode, highlight: true },
    { id: 'compare', label: t.navCompare, icon: GitCompare },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/60 p-4 hidden md:block">
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : item.highlight
                  ? 'bg-gradient-to-r from-indigo-900/40 to-slate-800/80 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-900/60'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                  {item.badge}
                </span>
              )}

              {item.highlight && (
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Expiry Reminders Banner Card */}
      {reminders.length > 0 && (
        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
            Smart Expiry Reminders
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            You have {reminders.length} upcoming document deadline(s).
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-full rounded-lg bg-amber-500/10 hover:bg-amber-500/20 py-1.5 text-center text-amber-300 font-medium transition border border-amber-500/30"
          >
            View Reminders
          </button>
        </div>
      )}

      {/* Core Principle Footer */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
        <p className="text-[11px] font-semibold text-indigo-400 tracking-wider uppercase mb-1">
          DocuMind Principle
        </p>
        <p className="text-xs text-slate-400 italic">
          "Scan it. Understand it. Organize it. Find it. Use it."
        </p>
      </div>
    </aside>
  );
};
