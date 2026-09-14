import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDocument } from '../../contexts/DocumentContext';
import { DocumentModel } from '../../types/document';
import { FilterBar } from './FilterBar';
import { DocumentCard } from './DocumentCard';
import { FolderArchive, UploadCloud, SearchX } from 'lucide-react';

interface DocumentGridProps {
  onOpenUpload: () => void;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({ onOpenUpload }) => {
  const { t } = useLanguage();
  const {
    documents,
    selectedDoc,
    setSelectedDoc,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
  } = useDocument();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Filter documents based on active category and search query
  const filteredDocuments = documents.filter((doc) => {
    // Category match
    const matchesCategory = activeCategory === 'All' || doc.category === activeCategory;

    // Search match across Title, OCR text, Category, Tags, Summaries, Extracted Fields, Document Type
    if (!searchQuery.trim()) return matchesCategory;

    const query = searchQuery.toLowerCase();
    const titleMatch = doc.title?.toLowerCase().includes(query);
    const fileNameMatch = doc.fileName?.toLowerCase().includes(query);
    const ocrMatch = doc.ocrText?.toLowerCase().includes(query);
    const categoryMatch = doc.category?.toLowerCase().includes(query);
    const typeMatch = doc.documentType?.toLowerCase().includes(query);
    const summaryMatch =
      doc.shortSummary?.toLowerCase().includes(query) ||
      doc.detailedSummary?.toLowerCase().includes(query);
    const tagMatch = (doc.tags || []).some((tag) => tag.toLowerCase().includes(query));

    const extractedDataMatch = Object.entries(doc.extractedData || {}).some(
      ([k, v]) => String(k).toLowerCase().includes(query) || String(v).toLowerCase().includes(query)
    );

    return (
      matchesCategory &&
      (titleMatch ||
        fileNameMatch ||
        ocrMatch ||
        categoryMatch ||
        typeMatch ||
        summaryMatch ||
        tagMatch ||
        extractedDataMatch)
    );
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.uploadDate || b.createdAt).getTime() - new Date(a.uploadDate || a.createdAt).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.uploadDate || a.createdAt).getTime() - new Date(b.uploadDate || b.createdAt).getTime();
    } else if (sortBy === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      
      {/* Filters & Search Header */}
      <FilterBar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing <strong className="text-white">{sortedDocuments.length}</strong> document(s)
          {activeCategory !== 'All' && ` in ${activeCategory}`}
        </span>
      </div>

      {/* Grid or List Container */}
      {sortedDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center my-8">
          {searchQuery ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 mb-3">
                <SearchX className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">No documents found</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                No archived documents matched your search term "{searchQuery}". Try searching by entity name, date, tag, or institution.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-3">
                <FolderArchive className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">{t.noDocsTitle}</h3>
              <p className="text-xs text-slate-400 max-w-md mb-6">{t.noDocsSub}</p>
              <button
                onClick={onOpenUpload}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition active:scale-95"
              >
                <UploadCloud className="h-4 w-4" />
                <span>{t.startBuilding}</span>
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-3'
          }
        >
          {sortedDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onSelect={setSelectedDoc}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

    </div>
  );
};
