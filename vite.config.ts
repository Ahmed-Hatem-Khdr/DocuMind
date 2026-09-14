import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import express from 'express';
import dotenv from 'dotenv';
import {
  handleProcessOCR,
  handleAskDocument,
  handleAskArchive,
  handleCompareDocuments,
} from './src/server/apiHandler';

dotenv.config();

function expressApiPlugin(): Plugin {
  return {
    name: 'express-api-plugin',
    configureServer(server) {
      const app = express();
      app.use(express.json({ limit: '25mb' }));

      app.post('/api/documents/process-ocr', handleProcessOCR);
      app.post('/api/documents/ask-document', handleAskDocument);
      app.post('/api/documents/ask-archive', handleAskArchive);
      app.post('/api/documents/compare', handleCompareDocuments);

      server.middlewares.use(app);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), expressApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
