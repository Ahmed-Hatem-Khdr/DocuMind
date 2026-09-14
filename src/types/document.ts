export type DocumentCategory = 
  | 'Education'
  | 'Identification'
  | 'Finance'
  | 'Employment'
  | 'Medical'
  | 'Legal'
  | 'Business'
  | 'Personal'
  | 'Government'
  | 'Certificates'
  | 'Receipts'
  | 'Invoices'
  | 'Contracts'
  | 'Other';

export type DocumentType = 
  | 'Certificate'
  | 'Invoice'
  | 'Receipt'
  | 'Contract'
  | 'CV'
  | 'ID'
  | 'Passport'
  | 'Academic transcript'
  | 'Training certificate'
  | 'Medical report'
  | 'Bank statement'
  | 'Form'
  | 'Letter'
  | 'Other / Unknown';

export type ProcessingStatus = 
  | 'uploading'
  | 'uploaded'
  | 'processing_ocr'
  | 'understanding'
  | 'extracting'
  | 'summarizing'
  | 'ready'
  | 'failed';

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number; // 0 to 100
  isLowConfidence?: boolean;
}

export interface DocumentModel {
  id: string;
  ownerId: string;
  fileName: string;
  fileUrl?: string; // base64 or URL
  fileType: string;
  fileSize: number;
  title: string;
  category: DocumentCategory;
  documentType: DocumentType;
  language: 'English' | 'Arabic' | 'Arabic + English (Mixed)' | string;
  ocrText: string;
  shortSummary: string;
  detailedSummary: string;
  tags: string[];
  extractedData: Record<string, string | number | boolean | string[]>;
  confidenceScores: Record<string, number>;
  documentDate?: string;
  uploadDate: string;
  expiryDate?: string;
  processingStatus: ProcessingStatus;
  processingError?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderModel {
  id: string;
  ownerId: string;
  documentId: string;
  documentTitle: string;
  title: string;
  targetDate: string;
  reminderDate: string;
  period: '1_week_before' | '1_month_before' | '3_months_before' | 'custom';
  status: 'pending' | 'dismissed' | 'notified';
  createdAt: string;
}

export interface QAMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: {
    documentId: string;
    title: string;
    category: string;
    snippet?: string;
  }[];
}

export interface DocumentComparisonResult {
  doc1Title: string;
  doc2Title: string;
  summary: string;
  addedClauses: string[];
  removedClauses: string[];
  changedDates: { field: string; val1: string; val2: string }[];
  changedAmounts: { field: string; val1: string; val2: string }[];
  keyDifferences: string[];
}
