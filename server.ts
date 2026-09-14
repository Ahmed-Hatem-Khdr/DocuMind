import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import {
  handleProcessOCR,
  handleAskDocument,
  handleAskArchive,
  handleCompareDocuments,
} from './src/server/apiHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// API Endpoints
app.post('/api/documents/process-ocr', handleProcessOCR);
app.post('/api/documents/ask-document', handleAskDocument);
app.post('/api/documents/ask-archive', handleAskArchive);
app.post('/api/documents/compare', handleCompareDocuments);

// Static files in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
