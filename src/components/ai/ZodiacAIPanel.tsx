import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Trash2,
  BookOpen,
  Workflow,
  Copy,
  Paperclip,
  Check,
  FileText
} from 'lucide-react';
import { GeminiMessage, askGemini } from '../../utils/gemini';
import { Tooltip } from '../common/Tooltip';
import katex from 'katex';

interface ZodiacAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pdfTitle: string;
  currentPage: number;
  selectedText?: string;
  onAddAiToNotebook: (text: string) => void;
  onAddAiToCanvas: (text: string, prompt: string) => void;
  apiKeyOverride?: string;
}

export const ZodiacAIPanel: React.FC<ZodiacAIPanelProps> = ({
  isOpen,
  onClose,
  pdfTitle,
  currentPage,
  selectedText = '',
  onAddAiToNotebook,
  onAddAiToCanvas,
  apiKeyOverride
}) => {
  const [messages, setMessages] = useState<GeminiMessage[]>([
    {
      role: 'model',
      content: `Hello! I am **Zodiac AI**, powered by Google Gemini.\n\nI can derive mathematical equations in KaTeX LaTeX, synthesize complex sections of **${pdfTitle || 'your document'}**, or extract key lemmas. What are you investigating today?`
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachPage, setAttachPage] = useState(true);
  const [attachSelection, setAttachSelection] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedText) {
      setAttachSelection(true);
    }
  }, [selectedText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || isLoading) return;

    const userText = inputPrompt.trim();
    setInputPrompt('');

    const newHistory: GeminiMessage[] = [...messages, { role: 'user', content: userText }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const context = {
        pdfTitle,
        currentPage: attachPage ? currentPage : undefined,
        selectedText: attachSelection && selectedText ? selectedText : undefined
      };

      const responseText = await askGemini(
        userText,
        newHistory,
        context,
        apiKeyOverride
      );

      setMessages((prev) => [...prev, { role: 'model', content: responseText }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: 'Unable to reach Gemini at this moment. Please check your network connection or provide an API key in Settings.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div
      className="w-[380px] h-[calc(100vh-40px-24px)] border-l flex flex-col justify-between select-none z-30 shrink-0 text-xs shadow-2xl relative"
      style={{
        backgroundColor: 'var(--bg-toolbar)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Top Header */}
      <div
        className="h-11 px-3.5 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, var(--ai-from) 0%, var(--ai-to) 100%)'
            }}
          >
            <Sparkles className="w-3 h-3 fill-current" />
          </div>
          <span className="font-semibold text-sm text-[var(--text-primary)]">Zodiac AI</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-muted)]">
            gemini-3.8-flash
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip content="Clear conversation">
            <button
              onClick={() => setMessages([])}
              className="z-btn-icon w-6.5 h-6.5 text-[var(--text-muted)]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Close panel (Ctrl+Shift+A)">
            <button
              onClick={onClose}
              className="z-btn-icon w-6.5 h-6.5 text-[var(--text-muted)]"
            >
              <X className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';

          return (
            <div key={idx} className={`space-y-1.5 ${isUser ? 'pl-6' : 'pr-4'}`}>
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed select-text ${
                  isUser
                    ? 'bg-[var(--accent-soft)] text-[var(--text-primary)] border-[var(--accent)]/30 rounded-tr-xs'
                    : 'bg-[var(--bg-paper)] text-[var(--text-primary)] border-[var(--border)] rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {/* Action buttons under AI response */}
              {!isUser && (
                <div className="flex items-center gap-1 pl-1 text-[11px] text-[var(--text-secondary)]">
                  <Tooltip content="Add to current Notebook">
                    <button
                      onClick={() => onAddAiToNotebook(msg.content)}
                      className="px-2 py-0.5 rounded hover:bg-[var(--bg-hover)] flex items-center gap-1 text-[var(--accent)]"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>To Notebook</span>
                    </button>
                  </Tooltip>

                  <Tooltip content="Add to Canvas as node">
                    <button
                      onClick={() => onAddAiToCanvas(msg.content, 'Gemini Research Synthesis')}
                      className="px-2 py-0.5 rounded hover:bg-[var(--bg-hover)] flex items-center gap-1 text-orange-600"
                    >
                      <Workflow className="w-3 h-3" />
                      <span>To Canvas</span>
                    </button>
                  </Tooltip>

                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="p-1 rounded hover:bg-[var(--bg-hover)] ml-auto"
                    title="Copy text"
                  >
                    {copiedIdx === idx ? (
                      <Check className="w-3 h-3 text-[var(--success)]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--bg-paper)] border border-[var(--border)] text-xs text-[var(--text-muted)] animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
            <span>Analyzing document with Gemini...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
        {/* Context Attachment Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setAttachPage(!attachPage)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 transition-all ${
              attachPage
                ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'bg-[var(--bg-hover)] border-transparent text-[var(--text-muted)]'
            }`}
          >
            <Paperclip className="w-2.5 h-2.5" />
            <span>Attach Page {currentPage}</span>
          </button>

          {selectedText && (
            <button
              onClick={() => setAttachSelection(!attachSelection)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 transition-all ${
                attachSelection
                  ? 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                  : 'bg-[var(--bg-hover)] border-transparent text-[var(--text-muted)]'
              }`}
            >
              <FileText className="w-2.5 h-2.5" />
              <span>Attach Selection ({selectedText.slice(0, 15)}...)</span>
            </button>
          )}
        </div>

        {/* Input box */}
        <div
          className="flex items-end gap-1.5 p-2 rounded-xl border bg-[var(--bg-paper)] focus-within:ring-1 focus-within:ring-[var(--accent)]"
          style={{ borderColor: 'var(--border)' }}
        >
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask anything about the document, equations, or concepts..."
            rows={2}
            className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none"
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputPrompt.trim() || isLoading}
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 disabled:opacity-40 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--ai-from) 0%, var(--ai-to) 100%)',
              color: '#ffffff'
            }}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
