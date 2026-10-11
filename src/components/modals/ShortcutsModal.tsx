import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + /', desc: 'Toggle Built-in Research Browser' },
    { key: 'Ctrl + K', desc: 'Global Search across document and notes' },
    { key: 'Ctrl + Shift + A', desc: 'Toggle Zodiac AI slide-over assistant' },
    { key: 'Ctrl + L', desc: 'Open KaTeX LaTeX Formula Editor' },
    { key: 'Ctrl + S', desc: 'Force autosave checkpoint' },
    { key: 'Ctrl + T', desc: 'Open new workspace tab' },
    { key: 'Ctrl + W', desc: 'Close active tab' },
    { key: 'Ctrl + E', desc: 'Export project / notes / canvas' },
    { key: 'V / H', desc: 'Canvas: Switch between Select (V) and Pan (H)' },
    { key: 'P / N', desc: 'Canvas: Pen drawing (P) / New node (N)' },
    { key: 'Space + Drag', desc: 'Pan infinite canvas smoothly' },
    { key: '@', desc: 'Link internal notebook or canvas item' },
    { key: '@@', desc: 'Cross-document link to other open tabs' },
    { key: 'Ctrl + Shift + /', desc: 'Open this Keyboard Shortcuts cheat-sheet' }
  ];

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
            <Command className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">Keyboard Shortcuts</span>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-4 grid grid-cols-1 gap-2 max-h-[65vh] overflow-y-auto">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-lg border border-[var(--border)] bg-[var(--bg-paper)]"
            >
              <span className="text-[var(--text-secondary)]">{sc.desc}</span>
              <kbd className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-[var(--bg-hover)] text-[var(--accent)] border border-[var(--border)]">
                {sc.key}
              </kbd>
            </div>
          ))}
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
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
