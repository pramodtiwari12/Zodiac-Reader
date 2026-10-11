import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCw,
  Highlighter,
  Underline as UnderlineIcon,
  PenTool,
  Eraser,
  Square,
  Circle,
  ArrowUpRight,
  Type,
  MessageSquare,
  Crop,
  Undo2,
  Redo2,
  Download,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  BookOpen,
  Workflow,
  Copy,
  Check,
  Search,
  Move
} from 'lucide-react';
import { PdfAnnotation, PdfBacklink } from '../../types';
import { Tooltip } from '../common/Tooltip';
import katex from 'katex';

interface PdfViewerProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pdfTitle: string;
  annotations: PdfAnnotation[];
  onAddAnnotation: (ann: PdfAnnotation) => void;
  onRemoveAnnotation: (id: string) => void;
  onSendTextToNotebook: (text: string, page: number, rect?: any) => void;
  onSendTextToCanvas: (text: string, page: number) => void;
  onSendSnapshotToNotebook: (imgUrl: string, page: number) => void;
  onSendSnapshotToCanvas: (imgUrl: string, page: number) => void;
  onAskAiWithContext: (text: string, page: number) => void;
  highlightFlashPage?: number | null;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pdfTitle,
  annotations,
  onAddAnnotation,
  onRemoveAnnotation,
  onSendTextToNotebook,
  onSendTextToCanvas,
  onSendSnapshotToNotebook,
  onSendSnapshotToCanvas,
  onAskAiWithContext,
  highlightFlashPage
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [invertColors, setInvertColors] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<
    'select' | 'hand' | 'highlighter' | 'underline' | 'pen' | 'eraser' | 'rect' | 'snapshot' | 'note'
  >('select');
  const [highlightColor, setHighlightColor] = useState<string>('#FFE066');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  // Floating text selection popup
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionPopupPos, setSelectionPopupPos] = useState<{ x: number; y: number } | null>(null);

  // Snapshot cropping state
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);

  // Flash highlight effect for backlink jumps
  const [flashActive, setFlashActive] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (highlightFlashPage && highlightFlashPage === currentPage) {
      setFlashActive(true);
      const timer = setTimeout(() => setFlashActive(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [highlightFlashPage, currentPage]);

  // Handle document mouse up for text selection
  const handleMouseUp = () => {
    if (activeTool === 'snapshot') return;

    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const text = selection.toString().trim();
      setSelectedText(text);

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (containerRect) {
        setSelectionPopupPos({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 10
        });
      }
    } else {
      setSelectedText('');
      setSelectionPopupPos(null);
    }
  };

  // Snapshot tool drag handlers
  const handleCropMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== 'snapshot') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setIsCropping(true);
    setCropStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setCropRect(null);
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isCropping || !cropStart || activeTool !== 'snapshot') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const x = Math.min(cropStart.x, currentX);
    const y = Math.min(cropStart.y, currentY);
    const width = Math.abs(currentX - cropStart.x);
    const height = Math.abs(currentY - cropStart.y);

    setCropRect({ x, y, width, height });
  };

  const handleCropMouseUp = () => {
    if (!isCropping || !cropRect || cropRect.width < 10 || cropRect.height < 10) {
      setIsCropping(false);
      setCropStart(null);
      return;
    }
    setIsCropping(false);

    // Generate snapshot canvas image
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = cropRect.width;
    snapCanvas.height = cropRect.height;
    const ctx = snapCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, cropRect.width, cropRect.height);
      ctx.strokeStyle = '#1F4E79';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, cropRect.width - 2, cropRect.height - 2);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(`Snapshot [Page ${currentPage}]`, 12, 24);
      setCapturedSnapshot(snapCanvas.toDataURL());
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-text relative" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      {/* PDF Toolbar */}
      <div
        className="h-10 px-3 flex items-center justify-between border-b select-none shrink-0 gap-2 overflow-x-auto no-scrollbar"
        style={{
          backgroundColor: 'var(--bg-toolbar)',
          borderColor: 'var(--border)'
        }}
      >
        {/* Left tools: Mode, Navigation, Zoom */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Select Tool */}
          <Tooltip content="Text Select" shortcut="V">
            <button
              onClick={() => setActiveTool('select')}
              className={`z-btn-icon w-7 h-7 ${activeTool === 'select' ? 'active' : ''}`}
            >
              <Type className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {/* Hand Tool */}
          <Tooltip content="Hand Pan" shortcut="H">
            <button
              onClick={() => setActiveTool('hand')}
              className={`z-btn-icon w-7 h-7 ${activeTool === 'hand' ? 'active' : ''}`}
            >
              <Move className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

          {/* Page Navigation */}
          <div className="flex items-center gap-1">
            <Tooltip content="Previous Page" shortcut="Left Arrow">
              <button
                disabled={currentPage <= 1}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className="z-btn-icon w-6 h-6 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-primary)]">
              {currentPage} / {totalPages}
            </span>

            <Tooltip content="Next Page" shortcut="Right Arrow">
              <button
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className="z-btn-icon w-6 h-6 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>

          <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

          {/* Zoom controls */}
          <Tooltip content="Zoom Out">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 15))}
              className="z-btn-icon w-6 h-6"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <span className="text-[11px] font-mono text-[var(--text-secondary)] w-9 text-center">
            {zoom}%
          </span>

          <Tooltip content="Zoom In">
            <button
              onClick={() => setZoom((z) => Math.min(250, z + 15))}
              className="z-btn-icon w-6 h-6"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Fit Width">
            <button
              onClick={() => setZoom(100)}
              className="z-btn-icon w-6 h-6"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>

        {/* Center: Annotation Tools */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Highlighter */}
          <div className="relative flex items-center">
            <Tooltip content="Highlighter" shortcut="Ctrl+H">
              <button
                onClick={() => {
                  setActiveTool(activeTool === 'highlighter' ? 'select' : 'highlighter');
                }}
                className={`z-btn-icon w-7 h-7 ${activeTool === 'highlighter' ? 'active' : ''}`}
                style={{ color: activeTool === 'highlighter' ? highlightColor : undefined }}
              >
                <Highlighter className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            {/* Quick color picker dots */}
            <div className="flex items-center gap-1 ml-1">
              {[
                { name: 'Yellow', code: '#FFE066' },
                { name: 'Green', code: '#8FE3A8' },
                { name: 'Pink', code: '#FFB3C7' },
                { name: 'Blue', code: '#9CC9FF' }
              ].map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setHighlightColor(c.code);
                    setActiveTool('highlighter');
                  }}
                  className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                    highlightColor === c.code ? 'scale-125 ring-1 ring-black/40' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.code, borderColor: 'rgba(0,0,0,0.2)' }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

          {/* Pen */}
          <Tooltip content="Vector Pen">
            <button
              onClick={() => setActiveTool(activeTool === 'pen' ? 'select' : 'pen')}
              className={`z-btn-icon w-7 h-7 ${activeTool === 'pen' ? 'active' : ''}`}
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {/* Sticky Note */}
          <Tooltip content="Add Note Comment">
            <button
              onClick={() => setActiveTool(activeTool === 'note' ? 'select' : 'note')}
              className={`z-btn-icon w-7 h-7 ${activeTool === 'note' ? 'active' : ''}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {/* Snapshot Crop tool */}
          <Tooltip content="Snapshot Crop (Add region to Notebook/Canvas)">
            <button
              onClick={() => setActiveTool(activeTool === 'snapshot' ? 'select' : 'snapshot')}
              className={`z-btn-icon w-7 h-7 ${activeTool === 'snapshot' ? 'active' : ''}`}
            >
              <Crop className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </button>
          </Tooltip>
        </div>

        {/* Right Tools: Invert Theme, Rotate */}
        <div className="flex items-center gap-1 shrink-0">
          <Tooltip content={invertColors ? 'Normal Reading Mode' : 'Invert Dark Reading Mode'}>
            <button
              onClick={() => setInvertColors(!invertColors)}
              className="z-btn-icon w-7 h-7"
            >
              {invertColors ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </Tooltip>

          <Tooltip content="Rotate Page 90°">
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="z-btn-icon w-7 h-7"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main PDF Page Display Container */}
      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        onMouseDown={handleCropMouseDown}
        onMouseMove={handleCropMouseMove}
        className={`flex-1 overflow-auto p-8 flex justify-center relative ${
          activeTool === 'hand' ? 'cursor-grab' : activeTool === 'snapshot' ? 'cursor-crosshair' : 'cursor-text'
        }`}
        style={{
          filter: invertColors ? 'invert(0.92) hue-rotate(180deg)' : 'none',
          backgroundColor: 'var(--bg-canvas)'
        }}
      >
        {/* PDF Paper Representation */}
        <div
          className={`paper-page relative transition-all duration-200 p-12 text-[var(--text-primary)] ${
            flashActive ? 'ring-4 ring-offset-4 ring-[var(--accent)] animate-pulse' : ''
          }`}
          style={{
            width: `${Math.round(680 * (zoom / 100))}px`,
            minHeight: `${Math.round(920 * (zoom / 100))}px`,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center center'
          }}
        >
          {/* Header watermark / page label */}
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] border-b pb-3 mb-6 border-[var(--border)] font-mono">
            <span>{pdfTitle}</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>

          {/* Sample Academic PDF Content */}
          <div className="space-y-4 text-justify font-['Inter'] leading-relaxed text-[14px]">
            <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              3. Invariant Manifold Dynamics in Discretized Lattices
            </h1>

            <p className="text-[var(--text-secondary)]">
              We now formalize the core condition under which macroscopic phase coherence survives thermal dissipation. Let {"$\\mathcal{H}$"} denote the Hilbert space equipped with the standard inner product.
            </p>

            {/* Simulated Highlighted region */}
            <div
              className="relative p-2 rounded transition-colors"
              style={{
                backgroundColor: annotations.find((a) => a.page === currentPage && a.type === 'highlight')
                  ? 'rgba(255, 224, 102, 0.45)'
                  : 'transparent'
              }}
            >
              <p className="font-medium text-[var(--text-primary)]">
                The invariant tensor maintains gauge symmetry under all affine transformations of the Riemannian manifold. Specifically, for any unitary evolution operator {"$U(t) = \\exp(-iHt/\\hbar)$"}, the von Neumann entropy remains bounded by the topological index of the boundary edges.
              </p>
            </div>

            <div
              className="my-5 p-4 rounded-lg bg-[var(--bg-hover)] text-center font-mono text-sm border border-[var(--border)] select-all overflow-x-auto"
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(
                  '\\oint_{\\partial \\Omega} \\mathbf{A} \\cdot d\\mathbf{l} = \\iint_{\\Omega} (\\nabla \\times \\mathbf{A}) \\cdot d\\mathbf{S} = 2\\pi n \\hbar',
                  { displayMode: true, throwOnError: false }
                )
              }}
            />

            <p className="text-[var(--text-secondary)]">
              This result implies that topological boundary modes cannot be backscattered by localized non-magnetic impurities, ensuring robust non-reciprocal signal transmission in quantum photonic circuitry.
            </p>

            <div className="p-3 my-2 border-l-2 border-[var(--accent)] bg-[var(--accent-soft)]/30 rounded-r text-xs text-[var(--text-secondary)]">
              <strong>Theorem 3.2 (Spectral Gap Conservation):</strong> Provided that the perturbation parameter $\epsilon &lt; \Delta_0 / 4$, the adiabatic theorem guarantees exponential suppression of interband transitions.
            </div>

            <p className="text-[var(--text-secondary)]">
              Experimental validation using neutral-atom array traps confirms this scaling law with a fidelity coefficient exceeding $F = 0.998$ across 40 consecutive cycles.
            </p>
          </div>

          {/* Footer watermark */}
          <div className="absolute bottom-6 left-12 right-12 flex items-center justify-between text-[10px] text-[var(--text-muted)] border-t pt-3 border-[var(--border)] font-mono">
            <span>Zodiac Academic Repository</span>
            <span>Ref: arXiv:2403.09112v2</span>
          </div>

          {/* Snapshot crop overlay rectangle */}
          {cropRect && (
            <div
              className="absolute border-2 border-dashed border-amber-500 bg-amber-500/15 pointer-events-none z-30"
              style={{
                left: `${cropRect.x}px`,
                top: `${cropRect.y}px`,
                width: `${cropRect.width}px`,
                height: `${cropRect.height}px`
              }}
            />
          )}
        </div>

        {/* Floating Text Selection Action Popup */}
        {selectionPopupPos && selectedText && (
          <div
            className="absolute z-50 flex items-center gap-1 p-1 bg-[var(--bg-toolbar)] border rounded-lg shadow-xl text-xs"
            style={{
              top: `${selectionPopupPos.y - 45}px`,
              left: `${selectionPopupPos.x}px`,
              transform: 'translateX(-50%)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            {/* Highlight */}
            <button
              onClick={() => {
                onAddAnnotation({
                  id: `ann_${Date.now()}`,
                  type: 'highlight',
                  page: currentPage,
                  color: highlightColor,
                  text: selectedText,
                  createdAt: Date.now()
                });
                setSelectionPopupPos(null);
              }}
              className="px-2 py-1 hover:bg-[var(--bg-hover)] rounded flex items-center gap-1 font-medium"
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-500" />
              <span>Highlight</span>
            </button>

            {/* Add to Notebook */}
            <button
              onClick={() => {
                onSendTextToNotebook(selectedText, currentPage);
                setSelectionPopupPos(null);
              }}
              className="px-2 py-1 hover:bg-[var(--bg-hover)] rounded flex items-center gap-1 font-medium text-[var(--accent)]"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Add to Notebook</span>
            </button>

            {/* Add to Canvas */}
            <button
              onClick={() => {
                onSendTextToCanvas(selectedText, currentPage);
                setSelectionPopupPos(null);
              }}
              className="px-2 py-1 hover:bg-[var(--bg-hover)] rounded flex items-center gap-1 font-medium text-orange-600"
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Add to Canvas</span>
            </button>

            {/* Ask AI */}
            <button
              onClick={() => {
                onAskAiWithContext(selectedText, currentPage);
                setSelectionPopupPos(null);
              }}
              className="px-2 py-1 hover:bg-amber-100 dark:hover:bg-amber-950/40 rounded flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </div>
        )}

        {/* Snapshot Capture Result Dialog */}
        {capturedSnapshot && (
          <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setCapturedSnapshot(null)}
          >
            <div
              className="bg-[var(--bg-toolbar)] border rounded-xl shadow-2xl p-4 max-w-sm w-full space-y-4"
              style={{ borderColor: 'var(--border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
                <span>Snapshot Captured (Page {currentPage})</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">PNG Crop</span>
              </div>

              <div className="rounded border border-[var(--border)] overflow-hidden bg-white p-2 flex justify-center">
                <img src={capturedSnapshot} alt="Snapshot crop" className="max-h-48 object-contain" />
              </div>

              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => setCapturedSnapshot(null)}
                  className="px-3 py-1.5 rounded-lg border hover:bg-[var(--bg-hover)]"
                  style={{ borderColor: 'var(--border)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onSendSnapshotToNotebook(capturedSnapshot, currentPage);
                    setCapturedSnapshot(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Add to Notebook</span>
                </button>
                <button
                  onClick={() => {
                    onSendSnapshotToCanvas(capturedSnapshot, currentPage);
                    setCapturedSnapshot(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-orange-600 text-white font-medium hover:opacity-90 flex items-center gap-1"
                >
                  <Workflow className="w-3.5 h-3.5" />
                  <span>Add to Canvas</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
