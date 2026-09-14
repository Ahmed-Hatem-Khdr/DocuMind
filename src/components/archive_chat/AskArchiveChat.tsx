import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDocument } from '../../contexts/DocumentContext';
import { DocumentModel, QAMessage } from '../../types/document';
import {
  MessageSquareCode,
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  ExternalLink,
  Loader2,
  HelpCircle,
} from 'lucide-react';

export const AskArchiveChat: React.FC = () => {
  const { t } = useLanguage();
  const { documents, setSelectedDoc } = useDocument();

  const [messages, setMessages] = useState<QAMessage[]>([
    {
      id: 'welcome-global',
      sender: 'ai',
      text: `Hello! I am DocuMind AI. I can search across all ${documents.length} document(s) in your digital archive to answer questions, cross-reference invoices, verify contract terms, check expiration dates, or find certificates.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const samplePrompts = [
    'What certificates do I have from Suez Canal University?',
    'When is my AWS cloud invoice due and how much is it?',
    'What are the key terms in my employment contract?',
    'هل توجد أي نتائج غير طبيعية في تقرير الفحص الطبي؟',
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: QAMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/documents/ask-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents,
          question: textToSend,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to ask archive');
      }

      const data = await res.json();

      const aiMsg: QAMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: data.answer || "I checked your archive, but couldn't find matching information for your request.",
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'ai',
          text: 'An error occurred while searching your archive. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
            <MessageSquareCode className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">Ask My Digital Archive</h2>
            <p className="text-xs text-slate-400">
              Query across all {documents.length} stored documents with full cross-referencing and source citations.
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Prompt Pills */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-indigo-400" /> Suggested Queries
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-300 hover:border-indigo-500/50 hover:bg-slate-850 hover:text-white transition"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex flex-col h-[520px] rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                }`}
              >
                {m.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 space-y-3'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>

                {/* Source Document Citations */}
                {m.sources && m.sources.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-400 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Cited Source Documents ({m.sources.length})
                    </span>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {m.sources.map((src, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            const found = documents.find((d) => d.id === src.documentId);
                            if (found) setSelectedDoc(found);
                          }}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-2.5 hover:border-indigo-500/50 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-200 truncate">{src.title}</p>
                              <p className="text-[9px] text-slate-400 truncate">{src.category}</p>
                            </div>
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <span className="block text-[9px] text-slate-400 mt-1 text-right">{m.timestamp}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-indigo-400 p-3 bg-slate-950/60 rounded-2xl border border-slate-800 w-fit">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cross-referencing digital archive documents...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-800">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything across your entire archive..."
            className="flex-1 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition shadow-md"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
