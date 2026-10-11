import React, { useState } from 'react';
import { X, NotebookPen, Workflow, Plus } from 'lucide-react';
import { NotebookType } from '../../types';

interface NewNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (type: NotebookType, title: string, colorDot: string) => void;
  currentCount: number;
  maxLimit: number;
}

export const NewNotebookModal: React.FC<NewNotebookModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  currentCount,
  maxLimit
}) => {
  const [type, setType] = useState<NotebookType>('notebook');
  const [title, setTitle] = useState('');
  const [colorDot, setColorDot] = useState('#1F4E79');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(type, title.trim(), colorDot);
    setTitle('');
    onClose();
  };

  const colors = ['#1F4E79', '#2E9E5B', '#D9822B', '#8E44AD', '#C0392B', '#16A085'];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-[420px] max-w-full rounded-xl border shadow-2xl overflow-hidden flex flex-col text-xs"
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
            <Plus className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">
              Create New Research Workspace
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Workspace Type Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[var(--text-primary)]">Workspace Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('notebook')}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  type === 'notebook'
                    ? 'border-[var(--accent)] bg-[var(--bg-active)] shadow-xs'
                    : 'border-[var(--border)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                  <NotebookPen className="w-4 h-4 text-[var(--accent)]" />
                  <span>Normal Notebook</span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] leading-tight">
                  Paper layout with KaTeX formulas, APA citations & mentions
                </span>
              </button>

              <button
                type="button"
                onClick={() => setType('canvas')}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  type === 'canvas'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 shadow-xs'
                    : 'border-[var(--border)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                  <Workflow className="w-4 h-4 text-orange-500" />
                  <span>Infinite Canvas</span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] leading-tight">
                  Node graph with bezier wires, ports & hand-drawn strokes
                </span>
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[var(--text-primary)]">Workspace Title</label>
            <input
              type="text"
              required
              autoFocus
              placeholder={type === 'notebook' ? 'e.g. Theoretical Derivations' : 'e.g. System Topology Map'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-lg border bg-[var(--bg-paper)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>

          {/* Color Dot Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[var(--text-primary)]">Color Tag</label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorDot(c)}
                  className={`w-6 h-6 rounded-full border transition-transform ${
                    colorDot === c ? 'scale-125 ring-2 ring-offset-2 ring-[var(--accent)]' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c, borderColor: 'rgba(0,0,0,0.1)' }}
                />
              ))}
            </div>
          </div>

          {/* Limit information */}
          <div className="text-[11px] text-[var(--text-muted)]">
            Slot {currentCount + 1} of {maxLimit} allowed per PDF.
          </div>

          {/* Footer */}
          <div
            className="pt-3 border-t flex items-center justify-end gap-2"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border hover:bg-[var(--bg-hover)]"
              style={{ borderColor: 'var(--border)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || currentCount >= maxLimit}
              className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 disabled:opacity-40"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
