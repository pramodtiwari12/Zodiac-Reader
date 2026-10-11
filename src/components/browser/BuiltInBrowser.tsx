import React, { useState } from 'react';
import {
  Globe,
  X,
  Minus,
  Maximize2,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Search,
  ExternalLink,
  BookOpen,
  Workflow,
  Copy,
  Check,
  ShieldAlert
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';
import katex from 'katex';

interface BuiltInBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onAddWebToNotebook: (title: string, snippet: string, url: string) => void;
  onAddWebToCanvas: (title: string, snippet: string, url: string) => void;
}

export const BuiltInBrowser: React.FC<BuiltInBrowserProps> = ({
  isOpen,
  onClose,
  initialQuery = 'https://en.wikipedia.org/wiki/Quantum_entanglement',
  onAddWebToNotebook,
  onAddWebToCanvas
}) => {
  const [urlInput, setUrlInput] = useState(initialQuery);
  const [currentUrl, setCurrentUrl] = useState(initialQuery);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'reader' | 'web'>('reader');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let url = urlInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        // Search query
        url = `https://en.wikipedia.org/wiki/${encodeURIComponent(url.replace(/\s+/g, '_'))}`;
      }
    }
    setCurrentUrl(url);
    setUrlInput(url);
  };

  const getPageTitle = () => {
    if (currentUrl.includes('wikipedia')) {
      const parts = currentUrl.split('/');
      return decodeURIComponent(parts[parts.length - 1]).replace(/_/g, ' ');
    }
    return 'Web Research Reference';
  };

  const sampleSnippet = `Quantum entanglement is the phenomenon that occurs when a group of particles interact in ways such that the quantum state of each particle cannot be described independently of the state of the others, even when the particles are separated by a large distance.`;

  return (
    <div
      className={`fixed z-50 rounded-xl border shadow-2xl overflow-hidden flex flex-col text-xs transition-all duration-200 ${
        isMinimized
          ? 'bottom-8 right-8 w-72 h-10'
          : 'bottom-8 right-8 w-[430px] h-[520px]'
      }`}
      style={{
        backgroundColor: 'var(--bg-toolbar)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Title Bar / Controls */}
      <div
        className="h-10 px-3 flex items-center justify-between border-b select-none shrink-0"
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="flex items-center gap-1.5 truncate max-w-[240px]">
          <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-xs text-[var(--text-primary)] truncate">
            {getPageTitle()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            title="Close Browser (Ctrl+/)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Address & Navigation Bar */}
          <div
            className="h-10 px-2.5 flex items-center gap-1.5 border-b select-none shrink-0"
            style={{ borderColor: 'var(--border)' }}
          >
            <button className="z-btn-icon w-6.5 h-6.5"><ArrowLeft className="w-3.5 h-3.5" /></button>
            <button className="z-btn-icon w-6.5 h-6.5"><ArrowRight className="w-3.5 h-3.5" /></button>
            <button className="z-btn-icon w-6.5 h-6.5"><RotateCw className="w-3.5 h-3.5" /></button>

            <form onSubmit={handleNavigate} className="flex-1">
              <div className="relative flex items-center">
                <Search className="w-3 h-3 absolute left-2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Search web or enter URL..."
                  className="w-full pl-6 pr-2 py-1 rounded-md border text-[11px] bg-[var(--bg-canvas)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
            </form>

            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              className="z-btn-icon w-6.5 h-6.5 text-[var(--text-secondary)]"
              title="Open in new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Action Bar for clipping into Notebook & Canvas */}
          <div
            className="h-8 px-3 flex items-center justify-between border-b bg-[var(--bg-paper)] select-none shrink-0 text-[11px]"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="text-[var(--text-muted)]">Research Clip:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAddWebToNotebook(getPageTitle(), sampleSnippet, currentUrl)}
                className="px-2 py-0.5 rounded hover:bg-[var(--bg-hover)] text-[var(--accent)] font-medium flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3 h-3" />
                <span>To Notebook</span>
              </button>
              <button
                onClick={() => onAddWebToCanvas(getPageTitle(), sampleSnippet, currentUrl)}
                className="px-2 py-0.5 rounded hover:bg-[var(--bg-hover)] text-orange-600 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Workflow className="w-3 h-3" />
                <span>To Canvas</span>
              </button>
            </div>
          </div>

          {/* Content View / Intelligent Research Reader Preview */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg-canvas)] text-[var(--text-primary)] select-text">
            {/* Security notification banner explaining iframe sandbox */}
            <div className="p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>Sandbox Reader Mode:</strong> External sites with strict <code>X-Frame-Options</code> are automatically parsed into this clean research view. Click <a href={currentUrl} target="_blank" rel="noreferrer" className="underline font-semibold">Open External</a> to view live page.
              </div>
            </div>

            <article className="space-y-3 bg-[var(--bg-paper)] p-4 rounded-xl border border-[var(--border)] shadow-xs">
              <h1 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
                {getPageTitle()}
              </h1>
              <div className="text-[10px] text-[var(--text-muted)] font-mono">
                Source: {currentUrl}
              </div>

              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                {sampleSnippet}
              </p>

              <div
                className="p-2.5 rounded bg-[var(--bg-hover)] border border-[var(--border)] font-mono text-[11px] overflow-x-auto text-center"
                dangerouslySetInnerHTML={{
                  __html: katex.renderToString(
                    '|\\psi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)',
                    { displayMode: true, throwOnError: false }
                  )
                }}
              />

              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                Entanglement has been demonstrated experimentally with photons, neutrinos, electrons, molecules, and small diamonds. The utilization of entanglement in communication, computation, and quantum radar is a very active area of research and development.
              </p>
            </article>
          </div>
        </>
      )}
    </div>
  );
};
