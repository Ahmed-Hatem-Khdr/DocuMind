import React, { useState } from 'react';
import { DocumentModel, QAMessage } from '../../types/document';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

interface AskDocumentChatProps {
  document: DocumentModel;
}

export const AskDocumentChat: React.FC<AskDocumentChatProps> = ({ document }) => {
  const [messages, setMessages] = useState<QAMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Hello! I am your AI assistant for "${document.title}". Ask me any specific question about dates, parties, terms, amounts, or clauses in this document.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: QAMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/documents/ask-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document,
          question: currentInput,
          chatHistory: messages.slice(-6),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to ask document');
      }

      const data = await res.json();

      const aiMsg: QAMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: data.answer || "I couldn't find that information in this document.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'ai',
          text: 'An error occurred while querying this document. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[420px] rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${
              m.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
              }`}
            >
              {m.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-900 border border-slate-800 text-slate-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              <span className="block text-[9px] text-slate-400 mt-1 text-right">{m.timestamp}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analyzing document context...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask anything about "${document.title.substring(0, 30)}..."`}
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
