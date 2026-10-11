import React from 'react';
import { X, Shield, Lock } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  view: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, view }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-[520px] max-w-full rounded-xl border shadow-2xl overflow-hidden flex flex-col text-xs"
        style={{
          backgroundColor: 'var(--bg-toolbar)',
          borderColor: 'var(--border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="h-11 px-4 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">
              {view === 'privacy' ? 'Privacy Policy & Local Storage' : 'Terms of Use'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 max-h-[60vh] overflow-y-auto text-[var(--text-secondary)] leading-relaxed">
          {view === 'privacy' ? (
            <>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">Local-First Data Privacy</h4>
              <p>
                Zodiac Reader by Rizen is engineered around the principle of data sovereignty. All uploaded PDF documents, TipTap notebooks, annotations, and DaVinci-style infinite node graphs are stored directly in your browser's private local IndexedDB.
              </p>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">AI Model Processing</h4>
              <p>
                When you interact with Zodiac AI (Google Gemini), only the specific prompts, excerpts, or page fragments you deliberately attach are transmitted over encrypted TLS connections to Google Gemini APIs. No background scraping occurs.
              </p>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">Contact and Data Inquiries</h4>
              <p>
                For questions regarding data protection or software licenses, please contact Pramod Tiwari at <a href="mailto:pramodtiwari2612@gmail.com" className="text-[var(--accent)] underline">pramodtiwari2612@gmail.com</a>.
              </p>
            </>
          ) : (
            <>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">Terms of Use</h4>
              <p>
                Zodiac Reader is provided for scholarly, academic, and personal note-taking. You retain full ownership and intellectual rights over any original research, LaTeX formulations, or note archives created within Zodiac Reader.
              </p>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">Acceptable Use</h4>
              <p>
                Users agree not to submit malicious scripts or violate copyright laws regarding distributed third-party academic literature.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t flex items-center justify-end bg-[var(--bg-paper)]"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
