import React from 'react';
import { DocumentModel } from '../../types/document';
import { FileText, Calendar, Tag, AlertTriangle, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface DocumentCardProps {
  document: DocumentModel;
  onSelect: (doc: DocumentModel) => void;
  viewMode?: 'grid' | 'list';
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onSelect, viewMode = 'grid' }) => {
  const isArabic = document.language?.includes('Arabic');

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onSelect(document)}
        className="group flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-4 hover:border-indigo-500/50 hover:bg-slate-850 cursor-pointer transition shadow-sm"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">
                {document.category}
              </span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                {document.documentType}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {document.language}
              </span>
            </div>

            <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition truncate">
              {document.title}
            </h4>

            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" dir={isArabic ? 'rtl' : 'ltr'}>
              {document.shortSummary}
            </p>
          </div>
        </div>

        <div className="mt-3 sm:mt-0 flex items-center gap-3 shrink-0 self-end sm:self-center">
          {document.expiryDate && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
              <Calendar className="h-3 w-3" /> Exp: {document.expiryDate}
            </span>
          )}
          <span className="text-[11px] text-slate-400">{document.uploadDate}</span>
          <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(document)}
      className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 hover:border-indigo-500/50 hover:bg-slate-850 cursor-pointer transition shadow-sm hover:shadow-indigo-500/5"
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 border border-indigo-500/20">
            {document.category}
          </span>
          <span className="text-[10px] font-mono text-slate-400 rounded bg-slate-800/80 px-2 py-0.5">
            {document.language}
          </span>
        </div>

        {/* File Icon & Document Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition line-clamp-2 leading-snug">
              {document.title}
            </h4>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{document.fileName}</p>
          </div>
        </div>

        {/* Short Summary Preview */}
        <p
          className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {document.shortSummary}
        </p>

        {/* Smart Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(document.tags || []).slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md"
            >
              <Tag className="h-2.5 w-2.5 text-indigo-400" />
              {tag}
            </span>
          ))}
          {(document.tags || []).length > 3 && (
            <span className="text-[10px] text-slate-500 px-1 py-0.5">
              +{(document.tags || []).length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer Meta Row */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          <span>{document.uploadDate}</span>
        </div>

        {document.expiryDate ? (
          <span className="flex items-center gap-1 font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-[10px]">
            <AlertTriangle className="h-3 w-3" /> Due {document.expiryDate}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-emerald-400 font-medium text-[10px]">
            <ShieldCheck className="h-3 w-3" /> Extracted
          </span>
        )}
      </div>
    </div>
  );
};
