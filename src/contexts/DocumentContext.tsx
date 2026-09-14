import React, { createContext, useContext, useState, useEffect } from 'react';
import { DocumentModel, ReminderModel, DocumentCategory, DocumentType } from '../types/document';
import { useAuth } from './AuthContext';
import {
  fetchUserDocuments,
  saveDocument,
  updateDocumentFields,
  deleteDocumentRecord,
  fetchUserReminders,
  createReminder,
} from '../services/documents/documentStore';

interface UploadProcessingState {
  file: File;
  progress: number;
  statusText: string;
  stage: 'uploading' | 'ocr' | 'understanding' | 'extracting' | 'summarizing' | 'ready' | 'failed';
  error?: string;
  docId?: string;
}

interface DocumentContextType {
  documents: DocumentModel[];
  reminders: ReminderModel[];
  loading: boolean;
  selectedDoc: DocumentModel | null;
  setSelectedDoc: (doc: DocumentModel | null) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  activeType: string;
  setActiveType: (type: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  processingQueue: UploadProcessingState[];
  processNewDocument: (file: File) => Promise<DocumentModel | null>;
  retryProcessing: (file: File) => Promise<DocumentModel | null>;
  updateDocument: (docId: string, updates: Partial<DocumentModel>) => Promise<void>;
  deleteDocument: (docId: string) => Promise<void>;
  addReminder: (reminder: ReminderModel) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoUser } = useAuth();
  const userId = user?.uid || (isDemoUser ? 'demo-user' : '');

  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [reminders, setReminders] = useState<ReminderModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDoc, setSelectedDoc] = useState<DocumentModel | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeType, setActiveType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [processingQueue, setProcessingQueue] = useState<UploadProcessingState[]>([]);

  const refreshData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const docs = await fetchUserDocuments(userId);
      setDocuments(docs);
      const rems = await fetchUserReminders(userId);
      setReminders(rems);
    } catch (err) {
      console.error('Error refreshing document archive:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [userId]);

  // Document Upload & AI Processing Pipeline
  const processNewDocument = async (file: File): Promise<DocumentModel | null> => {
    const queueItem: UploadProcessingState = {
      file,
      progress: 10,
      statusText: 'Uploading file to cloud archive...',
      stage: 'uploading',
    };

    setProcessingQueue((prev) => [queueItem, ...prev]);

    try {
      // Step 1: Convert file to Base64 for processing
      const base64Str = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Step 2: Uploaded -> Processing OCR
      setProcessingQueue((prev) =>
        prev.map((item) =>
          item.file === file
            ? { ...item, progress: 30, stage: 'ocr', statusText: 'Extracting text (OCR) in English & Arabic...' }
            : item
        )
      );

      // Step 3: Call Server API for OCR & AI Understanding
      setProcessingQueue((prev) =>
        prev.map((item) =>
          item.file === file
            ? { ...item, progress: 55, stage: 'understanding', statusText: 'Understanding document structure with AI...' }
            : item
        )
      );

      const apiRes = await fetch('/api/documents/process-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileBase64: base64Str,
        }),
      });

      if (!apiRes.ok) {
        const errData = await apiRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to analyze document with AI');
      }

      setProcessingQueue((prev) =>
        prev.map((item) =>
          item.file === file
            ? { ...item, progress: 80, stage: 'extracting', statusText: 'Extracting key fields & calculating confidence...' }
            : item
        )
      );

      const response = await apiRes.json();
      const aiData = response.data;

      // Format Extracted Data Map & Confidence Map
      const extractedDataMap: Record<string, any> = {};
      const confidenceMap: Record<string, number> = {};

      if (Array.isArray(aiData.extractedFields)) {
        aiData.extractedFields.forEach((field: any) => {
          extractedDataMap[field.key] = field.value;
          confidenceMap[field.key] = field.confidence || 90;
        });
      }

      const newDoc: DocumentModel = {
        id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        ownerId: userId || 'demo-user',
        fileName: file.name,
        fileUrl: base64Str,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        title: aiData.title || file.name.replace(/\.[^/.]+$/, ''),
        category: (aiData.category as DocumentCategory) || 'Other',
        documentType: (aiData.documentType as DocumentType) || 'Other / Unknown',
        language: aiData.language || 'English',
        ocrText: aiData.ocrText || '',
        shortSummary: aiData.shortSummary || '',
        detailedSummary: aiData.detailedSummary || '',
        tags: aiData.tags || ['#Document'],
        extractedData: extractedDataMap,
        confidenceScores: confidenceMap,
        documentDate: aiData.documentDate || new Date().toISOString().split('T')[0],
        uploadDate: new Date().toISOString().split('T')[0],
        expiryDate: aiData.expiryDate || undefined,
        processingStatus: 'ready',
        isDemo: isDemoUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setProcessingQueue((prev) =>
        prev.map((item) =>
          item.file === file
            ? { ...item, progress: 100, stage: 'ready', statusText: 'Document ready in archive!', docId: newDoc.id }
            : item
        )
      );

      // Save to Firestore
      await saveDocument(newDoc);
      setDocuments((prev) => [newDoc, ...prev]);

      return newDoc;
    } catch (error: any) {
      console.error('Error processing document:', error);
      setProcessingQueue((prev) =>
        prev.map((item) =>
          item.file === file
            ? {
                ...item,
                stage: 'failed',
                statusText: 'Processing failed',
                error: error?.message || 'Processing failed. Please retry.',
              }
            : item
        )
      );
      return null;
    }
  };

  const retryProcessing = async (file: File) => {
    setProcessingQueue((prev) => prev.filter((item) => item.file !== file));
    return processNewDocument(file);
  };

  const updateDocument = async (docId: string, updates: Partial<DocumentModel>) => {
    await updateDocumentFields(docId, userId, updates);
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
    );
    if (selectedDoc && selectedDoc.id === docId) {
      setSelectedDoc((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteDocument = async (docId: string) => {
    await deleteDocumentRecord(docId, userId);
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
    }
  };

  const addReminder = async (reminder: ReminderModel) => {
    await createReminder(reminder);
    setReminders((prev) => [reminder, ...prev]);
  };

  const value = {
    documents,
    reminders,
    loading,
    selectedDoc,
    setSelectedDoc,
    activeCategory,
    setActiveCategory,
    activeType,
    setActiveType,
    searchQuery,
    setSearchQuery,
    processingQueue,
    processNewDocument,
    retryProcessing,
    updateDocument,
    deleteDocument,
    addReminder,
    refreshData,
  };

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
};

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
};
