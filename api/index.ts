import express from 'express';
import {
  handleProcessOCR,
  handleAskDocument,
  handleAskArchive,
  handleCompareDocuments,
} from '../src/server/apiHandler';

const app = express();
app.use(express.json({ limit: '25mb' }));

app.post('/api/documents/process-ocr', handleProcessOCR);
app.post('/api/documents/ask-document', handleAskDocument);
app.post('/api/documents/ask-archive', handleAskArchive);
app.post('/api/documents/compare', handleCompareDocuments);

export default app;
