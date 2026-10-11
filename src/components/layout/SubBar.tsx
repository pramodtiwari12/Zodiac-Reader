import React, { useState } from 'react';
import {
  Wand2,
  Check,
  Loader2,
  Share2,
  Download,
  Columns,
  Maximize2,
  FileText,
  Repeat,
  FileCode,
  FileDown
} from 'lucide-react';
import { WorkspaceViewMode, ProjectTab } from '../../types';
import { Tooltip } from '../common/Tooltip';

interface SubBarProps {
  wordCount: number;
  onTriggerAiCompletion: () => void;
  isAiCompleting: boolean;
  viewMode: WorkspaceViewMode;
  onChangeViewMode: (mode: WorkspaceViewMode) => void;
  isSaving: boolean;
  lastSavedText: string;
  onExportZodiac: () => void;
  onExportNotebookPdf: () => void;
  onExportCanvasPdf: () => void;
  onExportCanvasPng: (scale: number) => void;
  onShare: () => void;
  activeTab: ProjectTab;
}

export const SubBar: React.FC<SubBarProps> = ({
  wordCount,
  onTriggerAiCompletion,
  isAiCompleting,
  viewMode,
  onChangeViewMode,
  isSaving,
  lastSavedText,
  onExportZodiac,
  onExportNotebookPdf,
  onExportCanvasPdf,
  onExportCanvasPng,
  onShare,
  activeTab
}) => {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  return (
    <div
      className="h-9 px-3 flex items-center justify-between border-b select-none z-10 shrink-0 text-xs"
      style={{
        backgroundColor: 'var(--bg-toolbar)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Left: Word Count + AI Completion */}
      <div className="flex items-center gap-3">
        <span className="text-[var(--text-muted)] font-mono text-[11px]">
          {wordCount} Words
        </span>

        <button
          onClick={onTriggerAiCompletion}
          disabled={isAiCompleting}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all cursor-pointer disabled:opacity-50"
          title="Trigger inline AI sentence completion"
        >
          {isAiCompleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
          ) : (
            <Wand2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          )}
          <span>AI Completion</span>
        </button>
      </div>

      {/* Center: Layout Mode Switchers */}
      <div className="flex items-center bg-[var(--bg-hover)] p-0.5 rounded-lg border border-[var(--border)]">
        <Tooltip content="Split View (PDF + Notes)" position="bottom">
          <button
            onClick={() => onChangeViewMode('split')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              viewMode === 'split' ? 'bg-[var(--bg-toolbar)] text-[var(--accent)] shadow-xs' : 'text-[var(--text-secondary)]'
            }`}
          >
            Split
          </button>
        </Tooltip>

        <Tooltip content="PDF Only" position="bottom">
          <button
            onClick={() => onChangeViewMode('pdf-only')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              viewMode === 'pdf-only' ? 'bg-[var(--bg-toolbar)] text-[var(--accent)] shadow-xs' : 'text-[var(--text-secondary)]'
            }`}
          >
            PDF Only
          </button>
        </Tooltip>

        <Tooltip content="Notes Only" position="bottom">
          <button
            onClick={() => onChangeViewMode('notes-only')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              viewMode === 'notes-only' ? 'bg-[var(--bg-toolbar)] text-[var(--accent)] shadow-xs' : 'text-[var(--text-secondary)]'
            }`}
          >
            Notes Only
          </button>
        </Tooltip>

        <Tooltip content="Swap Sides" position="bottom">
          <button
            onClick={() => onChangeViewMode(viewMode === 'swapped' ? 'split' : 'swapped')}
            className={`p-1 rounded text-[11px] font-medium transition-all ${
              viewMode === 'swapped' ? 'bg-[var(--bg-toolbar)] text-[var(--accent)] shadow-xs' : 'text-[var(--text-secondary)]'
            }`}
            title="Swap PDF & Notebook sides"
          >
            <Repeat className="w-3 h-3" />
          </button>
        </Tooltip>
      </div>

      {/* Right: Share + Export Menu + Saved Checkmark */}
      <div className="flex items-center gap-2 relative">
        <Tooltip content="Share Workspace link">
          <button onClick={onShare} className="z-btn-icon w-7 h-7">
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </Tooltip>

        {/* Download / Export dropdown */}
        <div className="relative">
          <Tooltip content="Export Project or Notes" shortcut="Ctrl+E">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="z-btn-icon w-7 h-7 text-[var(--text-primary)]"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {exportMenuOpen && (
            <div
              className="absolute right-0 top-8 bg-[var(--bg-toolbar)] border rounded-lg shadow-xl z-50 py-1 min-w-[210px] text-xs"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
                Export Options
              </div>
              <button
                onClick={() => {
                  onExportZodiac();
                  setExportMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-hover)] flex items-center gap-2"
              >
                <FileCode className="w-3.5 h-3.5 text-purple-600" />
                <span>Export as .zodiac bundle</span>
              </button>
              <button
                onClick={() => {
                  onExportNotebookPdf();
                  setExportMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-hover)] flex items-center gap-2"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-600" />
                <span>Export Notebook as PDF</span>
              </button>
              <button
                onClick={() => {
                  onExportCanvasPdf();
                  setExportMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-hover)] flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Canvas as PDF</span>
              </button>
              <button
                onClick={() => {
                  onExportCanvasPng(2);
                  setExportMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-hover)] flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>Export Canvas as PNG (2x)</span>
              </button>
            </div>
          )}
        </div>

        {/* Saved Status Indicator */}
        <div className="flex items-center gap-1.5 pl-1.5 text-[11px] text-[var(--text-muted)]">
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-[var(--accent)]" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 text-[var(--success)] stroke-[2.5]" />
              <span className="text-[var(--text-secondary)]">{lastSavedText}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
