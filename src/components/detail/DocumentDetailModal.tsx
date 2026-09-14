import React, { useState } from 'react';
import { DocumentModel } from '../../types/document';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDocument } from '../../contexts/DocumentContext';
import { AskDocumentChat } from './AskDocumentChat';
import { ReminderModal } from './ReminderModal';
import {
  FileText,
  X,
  Sparkles,
  Table,
  AlignLeft,
  MessageSquareCode,
  AlertTriangle,
  Clock,
  Trash2,
  Download,
  Copy,
  Check,
  Edit2,
  Save,
  Globe,
  Tag,
} from 'lucide-react';

interface DocumentDetailModalProps {
  document: DocumentModel | null;
  onClose: () => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({ document: docModel, onClose }) => {
  const { t, isRTL } = useLanguage();
  const { updateDocument, deleteDocument } = useDocument();

  const [activeTab, setActiveTab] = useState<'summary' | 'fields' | 'ocr' | 'ask'>('summary');
  const [isReminderOpen, setIsReminderOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Field editing state
  const [isEditingFields, setIsEditingFields] = useState<boolean>(false);
  const [editedFields, setEditedFields] = useState<Record<string, any>>({});

  if (!docModel) return null;

  const isArabic = docModel.language?.includes('Arabic');

  const handleCopyOCR = () => {
    navigator.clipboard.writeText(docModel.ocrText || '');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleStartEditFields = () => {
    setEditedFields({ ...docModel.extractedData });
    setIsEditingFields(true);
  };

  const handleSaveFields = async () => {
    await updateDocument(docModel.id, {
      extractedData: editedFields,
    });
    setIsEditingFields(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${docModel.title}" from your archive?`)) {
      await deleteDocument(docModel.id);
      onClose();
    }
  };

  const handleDownload = () => {
    if (docModel.fileUrl) {
      const a = window.document.createElement('a');
      a.href = docModel.fileUrl;
      a.download = docModel.fileName || 'document.pdf';
      a.click();
    } else {
      // Fallback text download
      const blob = new Blob([docModel.ocrText || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${docModel.title}.txt`;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-bold">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="rounded-lg bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
                  {docModel.category}
                </span>
                <span className="rounded-lg bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                  {docModel.documentType}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono bg-slate-950/60 px-2 py-0.5 rounded">
                  <Globe className="h-3 w-3 text-indigo-400" /> {docModel.language}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white truncate">{docModel.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setIsReminderOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              title="Set Deadline Reminder"
            >
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Set Reminder</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              title="Download File"
            >
              <Download className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition"
              title="Delete Document"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'summary'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Summary & Insights
          </button>

          <button
            onClick={() => setActiveTab('fields')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'fields'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Table className="h-3.5 w-3.5" /> Extracted Fields
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'ocr'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <AlignLeft className="h-3.5 w-3.5" /> Full OCR Text
          </button>

          <button
            onClick={() => setActiveTab('ask')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'ask'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-indigo-400 hover:bg-indigo-900/40'
            }`}
          >
            <MessageSquareCode className="h-3.5 w-3.5" /> Ask Document
          </button>
        </div>

        {/* Tab Content Panes */}
        <div>
          {/* Tab 1: AI Summary & Insights */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              
              {/* Short Summary Card */}
              <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/30 to-slate-900 p-5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Quick AI Executive Summary
                </span>
                <p className="text-sm font-medium text-slate-100 leading-relaxed" dir={isArabic ? 'rtl' : 'ltr'}>
                  {docModel.shortSummary}
                </p>
              </div>

              {/* Detailed Summary */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-2">
                <span className="text-xs font-bold text-slate-300">Detailed Contextual Summary</span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap" dir={isArabic ? 'rtl' : 'ltr'}>
                  {docModel.detailedSummary}
                </p>
              </div>

              {/* Smart Tags */}
              <div>
                <span className="block text-xs font-bold text-slate-400 mb-2">Smart Tags</span>
                <div className="flex flex-wrap gap-2">
                  {(docModel.tags || []).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-800 border border-slate-700/60 px-3 py-1 text-xs font-medium text-slate-200"
                    >
                      <Tag className="h-3 w-3 text-indigo-400" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: Extracted Fields & Confidence */}
          {activeTab === 'fields' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Extracted Key-Value Intelligence
                </span>

                {isEditingFields ? (
                  <button
                    onClick={handleSaveFields}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
                  >
                    <Save className="h-3.5 w-3.5" /> Save Changes
                  </button>
                ) : (
                  <button
                    onClick={handleStartEditFields}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-indigo-400" /> Edit Fields
                  </button>
                )}
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                    <tr>
                      <th className="p-3.5">Field / Attribute</th>
                      <th className="p-3.5">Extracted Value</th>
                      <th className="p-3.5">Confidence Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {Object.entries(
                      isEditingFields ? editedFields : docModel.extractedData || {}
                    ).map(([key, val]) => {
                      const confidence = docModel.confidenceScores?.[key] ?? 92;
                      const isLowConfidence = confidence < 80;

                      return (
                        <tr key={key} className="hover:bg-slate-900/40">
                          <td className="p-3.5 font-medium text-slate-300 capitalize">
                            {key.replace(/_/g, ' ')}
                          </td>
                          <td className="p-3.5">
                            {isEditingFields ? (
                              <input
                                type="text"
                                value={String(val)}
                                onChange={(e) =>
                                  setEditedFields((prev) => ({
                                    ...prev,
                                    [key]: e.target.value,
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none"
                              />
                            ) : (
                              <span className="font-semibold text-white" dir={isArabic ? 'rtl' : 'ltr'}>
                                {String(val)}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {isLowConfidence ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] font-bold text-amber-300" title={t.confidenceWarning}>
                                <AlertTriangle className="h-3 w-3" /> {confidence}% (Verify)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                                {confidence}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Full OCR Text */}
          {activeTab === 'ocr' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Structured OCR Output
                </span>
                <button
                  onClick={handleCopyOCR}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                >
                  {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy OCR Text'}</span>
                </button>
              </div>

              <div
                className="max-h-96 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-5 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap scrollbar-thin"
                dir={isArabic ? 'rtl' : 'ltr'}
              >
                {docModel.ocrText || 'No OCR text available for this document.'}
              </div>
            </div>
          )}

          {/* Tab 4: Ask This Document */}
          {activeTab === 'ask' && <AskDocumentChat document={docModel} />}
        </div>

        {/* Set Reminder Sub-Modal */}
        <ReminderModal
          isOpen={isReminderOpen}
          onClose={() => setIsReminderOpen(false)}
          document={docModel}
        />
      </div>
    </div>
  );
};
