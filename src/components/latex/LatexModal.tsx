import React, { useState, useEffect } from 'react';
import { X, Sigma, Check, Copy, AlertTriangle } from 'lucide-react';
import katex from 'katex';

interface LatexModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLatex?: string;
  onInsertInline: (latex: string) => void;
  onInsertBlock: (latex: string) => void;
  onInsertOnCanvas: (latex: string) => void;
}

export const LatexModal: React.FC<LatexModalProps> = ({
  isOpen,
  onClose,
  initialLatex = '\\mathcal{H} = \\sum_{k=1}^N \\frac{p_k^2}{2m} + V(x)',
  onInsertInline,
  onInsertBlock,
  onInsertOnCanvas
}) => {
  const [latexSource, setLatexSource] = useState(initialLatex);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setLatexSource(initialLatex);
  }, [initialLatex]);

  useEffect(() => {
    try {
      const html = katex.renderToString(latexSource, {
        displayMode: true,
        throwOnError: true
      });
      setRenderedHtml(html);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Syntax Error');
      try {
        setRenderedHtml(katex.renderToString(latexSource, { displayMode: true, throwOnError: false }));
      } catch (e) {}
    }
  }, [latexSource]);

  if (!isOpen) return null;

  const quickSymbols = [
    { label: 'Fraction', latex: '\\frac{a}{b}' },
    { label: 'Integral', latex: '\\int_{a}^{b} f(x)\\,dx' },
    { label: 'Sum', latex: '\\sum_{k=1}^{\\infty} a_k' },
    { label: 'Sqrt', latex: '\\sqrt{x^2 + y^2}' },
    { label: '∂ Partial', latex: '\\frac{\\partial \\psi}{\\partial t}' },
    { label: 'Matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
    { label: 'α', latex: '\\alpha' },
    { label: 'β', latex: '\\beta' },
    { label: 'ψ', latex: '\\psi' },
    { label: 'ω', latex: '\\omega' },
    { label: 'ħ', latex: '\\hbar' },
    { label: '∞', latex: '\\infty' },
    { label: '∇', latex: '\\nabla' }
  ];

  const appendSymbol = (symLatex: string) => {
    setLatexSource((prev) => prev + ' ' + symLatex);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-[540px] max-w-full rounded-xl border shadow-2xl overflow-hidden flex flex-col text-xs select-none"
        style={{
          backgroundColor: 'var(--bg-toolbar)',
          borderColor: 'var(--border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="h-10 px-4 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <Sigma className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">LaTeX Math Editor</span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">KaTeX Live</span>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Insert Symbols Palette */}
        <div
          className="p-2 border-b flex flex-wrap gap-1 bg-[var(--bg-paper)]"
          style={{ borderColor: 'var(--border)' }}
        >
          {quickSymbols.map((s, idx) => (
            <button
              key={idx}
              onClick={() => appendSymbol(s.latex)}
              className="px-2 py-0.5 rounded border border-[var(--border)] hover:bg-[var(--bg-hover)] text-[11px] font-mono text-[var(--text-primary)] transition-all cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Code Input (Monospace) */}
        <div className="p-3">
          <label className="text-[10px] font-semibold uppercase text-[var(--text-muted)] tracking-wider block mb-1">
            LaTeX Source Code
          </label>
          <textarea
            value={latexSource}
            onChange={(e) => setLatexSource(e.target.value)}
            rows={4}
            className="w-full p-2.5 rounded-lg border font-mono text-xs bg-[var(--bg-canvas)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
            style={{ borderColor: 'var(--border)' }}
          />
        </div>

        {/* Live Preview Area */}
        <div
          className="p-4 mx-3 rounded-lg border bg-[var(--bg-paper)] min-h-[90px] flex flex-col items-center justify-center relative overflow-x-auto"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="text-[var(--text-primary)] text-sm max-w-full"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-rose-500 text-[11px] mt-2 font-mono">
              <AlertTriangle className="w-3 h-3" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className="p-3 border-t mt-3 flex items-center justify-end gap-2 bg-[var(--bg-paper)]"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border hover:bg-[var(--bg-hover)]"
            style={{ borderColor: 'var(--border)' }}
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onInsertInline(latexSource);
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg border hover:bg-[var(--bg-hover)] text-[var(--accent)] font-medium"
            style={{ borderColor: 'var(--border)' }}
          >
            Insert Inline ($...$)
          </button>

          <button
            onClick={() => {
              onInsertBlock(latexSource);
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90"
          >
            Insert Block ($$...$$)
          </button>

          <button
            onClick={() => {
              onInsertOnCanvas(latexSource);
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-orange-600 text-white font-medium hover:opacity-90"
          >
            To Canvas Node
          </button>
        </div>
      </div>
    </div>
  );
};
