import React, { useState } from 'react';
import { useDocument } from '../../contexts/DocumentContext';
import { DocumentModel, DocumentComparisonResult } from '../../types/document';
import { GitCompare, FileText, Sparkles, Loader2, ArrowRight, CheckCircle2, MinusCircle, PlusCircle } from 'lucide-react';

export const DocumentCompare: React.FC = () => {
  const { documents } = useDocument();

  const [doc1Id, setDoc1Id] = useState<string>(documents[0]?.id || '');
  const [doc2Id, setDoc2Id] = useState<string>(documents[1]?.id || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DocumentComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doc1 = documents.find((d) => d.id === doc1Id);
  const doc2 = documents.find((d) => d.id === doc2Id);

  const handleCompare = async () => {
    if (!doc1 || !doc2) return;
    if (doc1.id === doc2.id) {
      setError('Please select two different documents to compare.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/documents/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc1, doc2 }),
      });

      if (!res.ok) {
        throw new Error('Failed to run document comparison');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
            <GitCompare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">Document Version & Diff Engine</h2>
            <p className="text-xs text-slate-400">
              Select any two documents to compare additions, deletions, modified dates, and financial terms.
            </p>
          </div>
        </div>
      </div>

      {/* Document Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Document 1 Selector */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
          <label className="block text-xs font-bold text-slate-300">Document 1 (Original / Baseline)</label>
          <select
            value={doc1Id}
            onChange={(e) => setDoc1Id(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.category})
              </option>
            ))}
          </select>

          {doc1 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs space-y-1">
              <p className="font-semibold text-white">{doc1.title}</p>
              <p className="text-slate-400 text-[11px] line-clamp-2">{doc1.shortSummary}</p>
            </div>
          )}
        </div>

        {/* Document 2 Selector */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
          <label className="block text-xs font-bold text-slate-300">Document 2 (Newer / Revised)</label>
          <select
            value={doc2Id}
            onChange={(e) => setDoc2Id(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.category})
              </option>
            ))}
          </select>

          {doc2 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs space-y-1">
              <p className="font-semibold text-white">{doc2.title}</p>
              <p className="text-slate-400 text-[11px] line-clamp-2">{doc2.shortSummary}</p>
            </div>
          )}
        </div>

      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-300 text-center">
          {error}
        </div>
      )}

      {/* Compare Button */}
      <div className="flex justify-center">
        <button
          onClick={handleCompare}
          disabled={loading || !doc1 || !doc2}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing Document Differences...</span>
            </>
          ) : (
            <>
              <GitCompare className="h-4 w-4" />
              <span>Run AI Document Comparison</span>
            </>
          )}
        </button>
      </div>

      {/* Comparison Results Section */}
      {result && (
        <div className="rounded-3xl border border-indigo-500/20 bg-slate-900/90 p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <span>Comparison Results: {result.doc1Title} vs {result.doc2Title}</span>
          </h3>

          {/* Executive Summary */}
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-5 space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Diff Overview</span>
            <p className="text-xs text-slate-200 leading-relaxed">{result.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Added Clauses */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-5 space-y-3">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <PlusCircle className="h-4 w-4" /> Added Clauses / Terms ({result.addedClauses?.length || 0})
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {(result.addedClauses || []).map((clause, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{clause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Removed Clauses */}
            <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-5 space-y-3">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <MinusCircle className="h-4 w-4" /> Removed Clauses / Terms ({result.removedClauses?.length || 0})
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {(result.removedClauses || []).map((clause, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                    <span className="text-red-400 font-bold">•</span>
                    <span>{clause}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Key Differences List */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
            <span className="text-xs font-bold text-slate-200">Key Actionable Differences</span>
            <ul className="space-y-2 text-xs text-slate-300">
              {(result.keyDifferences || []).map((diff, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{diff}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};
