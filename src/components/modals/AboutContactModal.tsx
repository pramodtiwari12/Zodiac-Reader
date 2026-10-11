import React from 'react';
import { X, Mail, Globe, Shield, Sparkles, BookOpen, Layers } from 'lucide-react';
import { ZodiacLogo } from '../common/ZodiacLogo';

interface AboutContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutContactModal: React.FC<AboutContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-[480px] max-w-full rounded-xl border shadow-2xl overflow-hidden flex flex-col text-xs"
        style={{
          backgroundColor: 'var(--bg-toolbar)',
          borderColor: 'var(--border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="h-12 px-4 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <ZodiacLogo size={24} showWordmark={true} />
          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-[var(--text-secondary)] leading-relaxed">
          <div>
            <h3 className="font-semibold text-sm text-[var(--text-primary)]">
              Zodiac Reader (by Rizen)
            </h3>
            <p className="mt-1 text-xs">
              A PDF-first research and note-taking workspace with linked notebooks, an infinite node canvas, built-in Gemini AI, KaTeX LaTeX and an in-app browser.
            </p>
          </div>

          <div
            className="p-3 rounded-lg border bg-[var(--bg-paper)] space-y-2"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-[var(--text-primary)]">Developer / Company</span>
              <span className="font-semibold text-[var(--accent)]">Rizen</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-[var(--text-primary)]">Developer Contact</span>
              <a
                href="mailto:pramodtiwari2612@gmail.com"
                className="text-[var(--accent)] hover:underline flex items-center gap-1 font-mono"
              >
                <Mail className="w-3 h-3" />
                <span>pramodtiwari2612@gmail.com</span>
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-[var(--text-primary)]">Document Standard</span>
              <span className="font-mono text-[var(--text-primary)]">.zodiac bundle (ZIP)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-[var(--text-primary)]">App Version</span>
              <span className="font-mono">v1.0.0</span>
            </div>
          </div>

          <div className="space-y-1 text-[11px] text-[var(--text-muted)]">
            <p>• Fast local-first IndexedDB storage ensures your documents never leave your browser.</p>
            <p>• Gemini AI assistance is strictly client-directed with your consent.</p>
            <p>• Project bundles can be fully archived and migrated across devices in seconds.</p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t flex items-center justify-between bg-[var(--bg-paper)]"
          style={{ borderColor: 'var(--border)' }}
        >
          <a
            href="mailto:pramodtiwari2612@gmail.com?subject=Zodiac%20Reader%20Feedback"
            className="text-[var(--accent)] font-medium flex items-center gap-1.5 hover:underline"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Inquiries & Feedback</span>
          </a>

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
