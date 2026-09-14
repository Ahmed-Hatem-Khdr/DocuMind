import React, { useState, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDocument } from '../../contexts/DocumentContext';
import { CameraModal } from './CameraModal';
import {
  UploadCloud,
  FileText,
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface FileDropzoneProps {
  onDocumentProcessed?: (docId: string) => void;
  setActiveTab?: (tab: string) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onDocumentProcessed, setActiveTab }) => {
  const { t } = useLanguage();
  const { processNewDocument, retryProcessing, processingQueue, setSelectedDoc, documents } = useDocument();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      for (const file of files) {
        const createdDoc = await processNewDocument(file);
        if (createdDoc && onDocumentProcessed) {
          onDocumentProcessed(createdDoc.id);
        }
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        const createdDoc = await processNewDocument(file);
        if (createdDoc && onDocumentProcessed) {
          onDocumentProcessed(createdDoc.id);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Subtitle */}
      <div>
        <h2 className="text-xl font-bold text-white font-display">Upload & Intelligent OCR Pipeline</h2>
        <p className="text-xs text-slate-400 mt-1">
          Upload PDF, JPG, or PNG files. Support for English, Arabic, and mixed documents with structural understanding.
        </p>
      </div>

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
          <UploadCloud className="h-8 w-8" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          Drag and drop your documents here
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          Supports PDF, JPG, PNG, WebP up to 25MB. English and Arabic OCR supported seamlessly.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition active:scale-95"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Browse Computer Files</span>
          </button>

          <button
            onClick={() => setIsCameraOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 px-5 py-2.5 text-xs font-semibold text-slate-200 transition active:scale-95"
          >
            <Camera className="h-4 w-4 text-indigo-400" />
            <span>Scan via Camera</span>
          </button>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={async (file) => {
          const createdDoc = await processNewDocument(file);
          if (createdDoc && onDocumentProcessed) {
            onDocumentProcessed(createdDoc.id);
          }
        }}
      />

      {/* Real-time Processing Queue & Status Tracker */}
      {processingQueue.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400 animate-spin" />
            <span>Document Processing States</span>
          </h3>

          <div className="space-y-4">
            {processingQueue.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{item.file.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB • {item.file.type || 'Document'}
                      </p>
                    </div>
                  </div>

                  <div>
                    {item.stage === 'ready' ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Ready
                      </span>
                    ) : item.stage === 'failed' ? (
                      <button
                        onClick={() => retryProcessing(item.file)}
                        className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                      >
                        <RefreshCw className="h-3 w-3" /> Retry
                      </button>
                    ) : (
                      <span className="text-xs font-mono font-semibold text-indigo-400">
                        {item.progress}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.stage === 'ready'
                        ? 'bg-emerald-500'
                        : item.stage === 'failed'
                        ? 'bg-red-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>

                {/* Status text */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    {item.stage === 'failed' && <AlertCircle className="h-3.5 w-3.5 text-red-400" />}
                    {item.statusText}
                  </span>

                  {item.stage === 'ready' && item.docId && (
                    <button
                      onClick={() => {
                        const found = documents.find((d) => d.id === item.docId);
                        if (found) {
                          setSelectedDoc(found);
                        } else if (setActiveTab) {
                          setActiveTab('archive');
                        }
                      }}
                      className="text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      View Document <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
