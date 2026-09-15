import { GoogleGenAI, Type } from '@google/genai';
import type { Request, Response } from 'express';

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Resilient Candidates List using non-deprecated Gemini Flash models
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

async function generateWithRetryAndFallback(params: { contents: any; config?: any }) {
  let lastError: any = null;

  for (let round = 1; round <= 2; round++) {
    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || err);

        const isTransientOrUnavailable =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('404') ||
          errMsg.includes('NOT_FOUND') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED');

        if (!isTransientOrUnavailable) {
          // Throw non-transient invalid parameter errors immediately
          throw err;
        }
        // Fallback to next model in CANDIDATE_MODELS
      }
    }
    if (round < 2) {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }

  console.error('All AI candidate models failed after retries:', lastError);
  throw lastError || new Error('The AI service is experiencing temporary high demand. Please try again in a few moments.');
}

export async function handleProcessOCR(req: Request, res: Response) {
  try {
    const { fileName, fileType, fileSize, fileBase64, rawText } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const contents: any[] = [];

    let promptText = `You are an expert Document Intelligence and OCR engine supporting English, Arabic, and mixed-language documents.
Analyze this document thoroughly and produce a structured analysis.

Perform full OCR text extraction preserving structural layout (paragraphs, headings, bullet lists, numbers, tables, dates, names, addresses, emails, phones, URLs).

Identify:
1. Title: A clean, descriptive title for the document.
2. Category: Must select best match from [Education, Identification, Finance, Employment, Medical, Legal, Business, Personal, Government, Certificates, Receipts, Invoices, Contracts, Other].
3. Document Type: Must select best match from [Certificate, Invoice, Receipt, Contract, CV, ID, Passport, Academic transcript, Training certificate, Medical report, Bank statement, Form, Letter, Other / Unknown].
4. Language: Language of the document (e.g. 'English', 'Arabic', or 'Arabic + English (Mixed)').
5. Full OCR Text: Formatted text extracted from document preserving layout, headers, tables, etc.
6. Short Summary: 1-2 sentence quick overview in the primary language of the document.
7. Detailed Summary: Thorough explanation of contents in the primary language of the document.
8. Tags: 5-8 smart tags starting with # (e.g., #Education, #SuezCanalUniversity, #2026).
9. Extracted Fields: Array of key-value fields relevant to this document type (e.g., student_name, institution, total_amount, invoice_number, expiry_date, issue_date, parties_involved, etc.) along with a confidence score (0 to 100) for each field.
10. Document Date: Any issue or creation date found in the document (YYYY-MM-DD or readable text, or empty string).
11. Expiry Date: Any expiration, renewal, or due date found in the document (YYYY-MM-DD or readable text, or empty string).`;

    if (fileBase64 && fileBase64.includes('base64,')) {
      const mimeMatch = fileBase64.match(/^data:(.*?);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : (fileType || 'image/png');
      const base64Data = fileBase64.split('base64,')[1];

      contents.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    } else if (rawText) {
      promptText += `\n\nDocument Text Content:\n${rawText}`;
    } else {
      promptText += `\n\nDocument File Name:\n${fileName}`;
    }

    contents.push({ text: promptText });

    const response = await generateWithRetryAndFallback({
      contents: { parts: contents },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            documentType: { type: Type.STRING },
            language: { type: Type.STRING },
            ocrText: { type: Type.STRING },
            shortSummary: { type: Type.STRING },
            detailedSummary: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            extractedFields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING },
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                },
                required: ['key', 'label', 'value', 'confidence'],
              },
            },
            documentDate: { type: Type.STRING },
            expiryDate: { type: Type.STRING },
          },
          required: [
            'title',
            'category',
            'documentType',
            'language',
            'ocrText',
            'shortSummary',
            'detailedSummary',
            'tags',
            'extractedFields',
          ],
        },
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error in handleProcessOCR:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process document with OCR & AI. Please try again in a few moments.',
    });
  }
}

export async function handleAskDocument(req: Request, res: Response) {
  try {
    const { document, question, chatHistory } = req.body;

    if (!document || !question) {
      return res.status(400).json({ error: 'document and question are required' });
    }

    const historyPrompt = chatHistory && chatHistory.length > 0
      ? chatHistory.map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')
      : '';

    const prompt = `You are a Document Q&A assistant for the document titled "${document.title}".
DOCUMENT CONTEXT:
Category: ${document.category}
Type: ${document.documentType}
Language: ${document.language}
Short Summary: ${document.shortSummary}
Detailed Summary: ${document.detailedSummary}

EXTRACTED STRUCTURED DATA:
${JSON.stringify(document.extractedData || {}, null, 2)}

FULL OCR TEXT:
${document.ocrText || 'No text extracted.'}

USER QUESTION: "${question}"

Previous Chat History:
${historyPrompt}

INSTRUCTIONS:
1. Answer the question accurately using ONLY the information provided in the document context above.
2. If the user asks in Arabic, answer in clear Arabic. If in English, answer in English.
3. If the answer is NOT present or supported by the document text, explicitly say:
   "I couldn't find that information in this document." (or Arabic equivalent: "لم أتمكن من العثور على هذه المعلومة في هذا المستند.")
4. Do NOT hallucinate or guess facts not present in the document.`;

    const response = await generateWithRetryAndFallback({
      contents: prompt,
    });

    return res.json({
      answer: response.text || "I couldn't find that information in this document.",
    });
  } catch (error: any) {
    console.error('Error in handleAskDocument:', error);
    return res.status(500).json({ error: error?.message || 'Failed to query document' });
  }
}

export async function handleAskArchive(req: Request, res: Response) {
  try {
    const { documents, question } = req.body;

    if (!documents || !Array.isArray(documents) || !question) {
      return res.status(400).json({ error: 'documents array and question are required' });
    }

    const archiveDocsFormatted = documents.map((doc: any, index: number) => `
--- DOCUMENT #${index + 1} ---
ID: ${doc.id}
Title: ${doc.title}
Category: ${doc.category}
Document Type: ${doc.documentType}
Upload Date: ${doc.uploadDate || doc.createdAt}
Expiry Date: ${doc.expiryDate || 'N/A'}
Short Summary: ${doc.shortSummary}
Tags: ${(doc.tags || []).join(', ')}
Extracted Data: ${JSON.stringify(doc.extractedData || {})}
OCR Text Excerpt: ${(doc.ocrText || '').substring(0, 800)}
`).join('\n\n');

    const prompt = `You are an AI Personal Digital Archive assistant called DocuMind.
The user is asking a question across their entire personal document collection.

USER QUESTION: "${question}"

STORED ARCHIVE DOCUMENTS (${documents.length} documents total):
${archiveDocsFormatted}

INSTRUCTIONS:
1. Synthesize a direct, helpful, and concise response answering the user's question based on their archived documents.
2. If the user asks in Arabic, reply in Arabic. Otherwise in English.
3. Identify which specific documents were used as sources to answer the question.
4. Return a structured JSON response containing:
   - "answer": String text answer.
   - "sourceIds": Array of document IDs (strings) that were directly referenced.
   - "sourceReasons": Object mapping document ID to a short snippet/reason why it was referenced.`;

    const response = await generateWithRetryAndFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            sourceIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            sourceReasons: {
              type: Type.OBJECT,
            },
          },
          required: ['answer', 'sourceIds'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    
    const sources = (parsed.sourceIds || [])
      .map((id: string) => {
        const found = documents.find((d: any) => d.id === id);
        if (!found) return null;
        return {
          documentId: found.id,
          title: found.title,
          category: found.category,
          snippet: parsed.sourceReasons?.[id] || found.shortSummary,
        };
      })
      .filter(Boolean);

    return res.json({
      answer: parsed.answer || "I checked your archive, but couldn't find matching information for your request.",
      sources,
    });
  } catch (error: any) {
    console.error('Error in handleAskArchive:', error);
    return res.status(500).json({ error: error?.message || 'Failed to query digital archive' });
  }
}

export async function handleCompareDocuments(req: Request, res: Response) {
  try {
    const { doc1, doc2 } = req.body;

    if (!doc1 || !doc2) {
      return res.status(400).json({ error: 'doc1 and doc2 are required for comparison' });
    }

    const prompt = `You are a Document Intelligence Comparison Specialist.
Compare the following two documents and identify all differences, changes, additions, and deletions.

DOCUMENT 1:
Title: ${doc1.title}
Category: ${doc1.category}
Date: ${doc1.documentDate || 'N/A'}
Text:
${doc1.ocrText}

DOCUMENT 2:
Title: ${doc2.title}
Category: ${doc2.category}
Date: ${doc2.documentDate || 'N/A'}
Text:
${doc2.ocrText}

Produce a detailed comparison JSON with:
1. summary: A high-level summary of how the two documents differ.
2. addedClauses: List of clauses, sentences, or terms added in Doc 2.
3. removedClauses: List of clauses, sentences, or terms present in Doc 1 but removed in Doc 2.
4. changedDates: List of date modifications { field, val1, val2 }.
5. changedAmounts: List of financial / numeric modifications { field, val1, val2 }.
6. keyDifferences: Bullet points of main actionable differences.`;

    const response = await generateWithRetryAndFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            addedClauses: { type: Type.ARRAY, items: { type: Type.STRING } },
            removedClauses: { type: Type.ARRAY, items: { type: Type.STRING } },
            changedDates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  field: { type: Type.STRING },
                  val1: { type: Type.STRING },
                  val2: { type: Type.STRING },
                },
              },
            },
            changedAmounts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  field: { type: Type.STRING },
                  val1: { type: Type.STRING },
                  val2: { type: Type.STRING },
                },
              },
            },
            keyDifferences: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['summary', 'addedClauses', 'removedClauses', 'changedDates', 'changedAmounts', 'keyDifferences'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      doc1Title: doc1.title,
      doc2Title: doc2.title,
      ...parsed,
    });
  } catch (error: any) {
    console.error('Error in handleCompareDocuments:', error);
    return res.status(500).json({ error: error?.message || 'Failed to compare documents' });
  }
}
