import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DocumentProvider, useDocument } from './contexts/DocumentContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { OverviewStats } from './components/dashboard/OverviewStats';
import { DocumentGrid } from './components/library/DocumentGrid';
import { FileDropzone } from './components/upload/FileDropzone';
import { AskArchiveChat } from './components/archive_chat/AskArchiveChat';
import { DocumentCompare } from './components/comparison/DocumentCompare';
import { SettingsPage } from './components/settings/SettingsPage';
import { DocumentDetailModal } from './components/detail/DocumentDetailModal';
import { X, UploadCloud } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const { selectedDoc, setSelectedDoc } = useDocument();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        onOpenUpload={() => setIsUploadModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenUpload={() => setIsUploadModalOpen(true)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <OverviewStats
              onOpenUpload={() => setIsUploadModalOpen(true)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'archive' && (
            <DocumentGrid onOpenUpload={() => setIsUploadModalOpen(true)} />
          )}

          {activeTab === 'upload' && (
            <FileDropzone
              setActiveTab={setActiveTab}
              onDocumentProcessed={(docId) => {
                setActiveTab('archive');
              }}
            />
          )}

          {activeTab === 'ask-archive' && <AskArchiveChat />}

          {activeTab === 'compare' && <DocumentCompare />}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Upload Modal (Triggered from Top Nav or Sidebar) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Upload New Document to Archive</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <FileDropzone
              setActiveTab={setActiveTab}
              onDocumentProcessed={(docId) => {
                setIsUploadModalOpen(false);
                setActiveTab('archive');
              }}
            />
          </div>
        </div>
      )}

      {/* Document Detail Viewer Modal */}
      {selectedDoc && (
        <DocumentDetailModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <DocumentProvider>
          <MainLayout />
        </DocumentProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
