import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  FolderPlus,
  Clipboard,
  CheckSquare,
  Search,
  RotateCw,
  Folder,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  Workflow,
  BookOpen,
  Upload,
  Plus,
  FileCode,
  Tag,
  Clock,
  Sparkles
} from 'lucide-react';
import { ActiveSideTool, ProjectTab, NotebookContent, CanvasData } from '../../types';
import { Tooltip } from '../common/Tooltip';

interface SidePanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTool: ActiveSideTool;
  activeTab: ProjectTab;
  allTabs: ProjectTab[];
  onSelectTab: (id: string) => void;
  onSelectNotebook: (id: string) => void;
  onSelectCanvas: (id: string) => void;
  onOpenNewNotebookModal: () => void;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onJumpToPage: (page: number) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeTool,
  activeTab,
  allTabs,
  onSelectTab,
  onSelectNotebook,
  onSelectCanvas,
  onOpenNewNotebookModal,
  onUploadFile,
  onJumpToPage
}) => {
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    references: true,
    data: true,
    analysis: true,
    reports: false
  });
  const [searchTerm, setSearchTerm] = useState('');

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderKey]: !prev[folderKey] }));
  };

  if (isCollapsed) {
    return (
      <div
        className="w-4 h-[calc(100vh-40px-24px)] border-r flex items-center justify-center cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none z-10"
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderColor: 'var(--border)'
        }}
        onClick={onToggleCollapse}
        title="Expand side panel"
      >
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div
      className="w-[255px] h-[calc(100vh-40px-24px)] border-r flex flex-col justify-between select-none z-10 shrink-0 text-xs"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Top Header Strip */}
      <div className="flex flex-col border-b" style={{ borderColor: 'var(--border)' }}>
        {/* Project Selector Bar */}
        <div className="h-10 px-3 flex items-center justify-between relative">
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="flex items-center gap-1.5 font-semibold text-[13px] text-[var(--text-primary)] hover:text-[var(--accent)] truncate max-w-[195px] text-left cursor-pointer"
          >
            <span className="truncate">{activeTab.pdfTitle || activeTab.title}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
          </button>

          <Tooltip content="Collapse side panel" shortcut="Alt+[" position="bottom">
            <button
              onClick={onToggleCollapse}
              className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </Tooltip>

          {/* Project Switcher Dropdown */}
          {projectDropdownOpen && (
            <div
              className="absolute left-2 right-2 top-10 bg-[var(--bg-toolbar)] border rounded-lg shadow-xl z-50 py-1.5 max-h-60 overflow-y-auto"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Workspaces & Projects
              </div>
              {allTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTab(t.id);
                    setProjectDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[var(--bg-hover)] ${
                    t.id === activeTab.id ? 'font-semibold text-[var(--accent)] bg-[var(--bg-active)]' : 'text-[var(--text-primary)]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{t.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Small Action Icons Row (Screenshot reference) */}
        <div className="h-8 px-2.5 flex items-center justify-between border-t border-[var(--border)] text-[var(--text-secondary)]">
          <div className="flex items-center gap-0.5">
            <Tooltip content="Sort Files">
              <button className="z-btn-icon w-6 h-6"><ArrowUpDown className="w-3.5 h-3.5" /></button>
            </Tooltip>
            <Tooltip content="New Folder">
              <button className="z-btn-icon w-6 h-6"><FolderPlus className="w-3.5 h-3.5" /></button>
            </Tooltip>
            <Tooltip content="Paste from clipboard">
              <button className="z-btn-icon w-6 h-6"><Clipboard className="w-3.5 h-3.5" /></button>
            </Tooltip>
            <Tooltip content="Project Tasks">
              <button className="z-btn-icon w-6 h-6"><CheckSquare className="w-3.5 h-3.5" /></button>
            </Tooltip>
          </div>
          <div className="flex items-center gap-0.5">
            <Tooltip content="Filter items">
              <button className="z-btn-icon w-6 h-6"><Search className="w-3.5 h-3.5" /></button>
            </Tooltip>
            <Tooltip content="Refresh workspace">
              <button className="z-btn-icon w-6 h-6"><RotateCw className="w-3.5 h-3.5" /></button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Main Content Area based on Active Tool */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {/* VIEW 1: FILE MANAGER / DEFAULT DIRECTORY VIEW */}
        {(activeTool === 'files' || activeTool === 'home' || activeTool === 'library') && (
          <div className="space-y-1">
            {/* 1-References Folder */}
            <div>
              <div
                onClick={() => toggleFolder('references')}
                className="flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-[var(--bg-hover)] cursor-pointer text-[var(--text-primary)] font-medium"
              >
                {expandedFolders['references'] ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                )}
                {expandedFolders['references'] ? (
                  <FolderOpen className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                )}
                <span>1-References</span>
              </div>

              {expandedFolders['references'] && (
                <div className="pl-6 space-y-0.5 mt-0.5">
                  <div className="flex items-center gap-2 py-1 px-1.5 rounded bg-[var(--bg-active)] text-[var(--accent)] font-medium cursor-pointer">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{activeTab.title}</span>
                  </div>
                  <div className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] cursor-pointer">
                    <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">Citations_BibTeX.bib</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2-Data Folder */}
            <div>
              <div
                onClick={() => toggleFolder('data')}
                className="flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-[var(--bg-hover)] cursor-pointer text-[var(--text-primary)] font-medium"
              >
                {expandedFolders['data'] ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                )}
                {expandedFolders['data'] ? (
                  <FolderOpen className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                )}
                <span>2-Data</span>
              </div>

              {expandedFolders['data'] && (
                <div className="pl-6 space-y-0.5 mt-0.5">
                  <div className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] cursor-pointer">
                    <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span className="truncate">Simulated_Eigenvalues.csv</span>
                  </div>
                  <div className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] cursor-pointer">
                    <FileCode className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                    <span className="truncate">Lattice_Hamiltonian.py</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3-Analysis Folder */}
            <div>
              <div
                onClick={() => toggleFolder('analysis')}
                className="flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-[var(--bg-hover)] cursor-pointer text-[var(--text-primary)] font-medium"
              >
                {expandedFolders['analysis'] ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                )}
                {expandedFolders['analysis'] ? (
                  <FolderOpen className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/20" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/20" />
                )}
                <span>3-Analysis</span>
              </div>

              {expandedFolders['analysis'] && (
                <div className="pl-6 space-y-0.5 mt-0.5">
                  {activeTab.notebooks.map((nb) => (
                    <div
                      key={nb.id}
                      onClick={() => onSelectNotebook(nb.id)}
                      className={`flex items-center gap-2 py-1 px-1.5 rounded cursor-pointer ${
                        activeTab.activeNotebookId === nb.id && activeTab.activeNotebookType === 'notebook'
                          ? 'bg-[var(--bg-active)] text-[var(--accent)] font-medium'
                          : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: nb.colorDot || 'var(--accent)' }} />
                      <span className="truncate">{nb.title}</span>
                    </div>
                  ))}

                  {activeTab.canvases.map((cv) => (
                    <div
                      key={cv.id}
                      onClick={() => onSelectCanvas(cv.id)}
                      className={`flex items-center gap-2 py-1 px-1.5 rounded cursor-pointer ${
                        activeTab.activeNotebookId === cv.id && activeTab.activeNotebookType === 'canvas'
                          ? 'bg-[var(--bg-active)] text-[var(--accent)] font-medium'
                          : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <Workflow className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span className="truncate">{cv.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4-Reports Folder */}
            <div>
              <div
                onClick={() => toggleFolder('reports')}
                className="flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-[var(--bg-hover)] cursor-pointer text-[var(--text-primary)] font-medium"
              >
                {expandedFolders['reports'] ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                )}
                {expandedFolders['reports'] ? (
                  <FolderOpen className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                )}
                <span>4-Reports</span>
              </div>
              {expandedFolders['reports'] && (
                <div className="pl-6 space-y-0.5 mt-0.5">
                  <div className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] cursor-pointer">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Draft_Preprint.tex</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: NOTEBOOKS MANAGER */}
        {activeTool === 'notebooks' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                Linked Notebooks ({activeTab.notebooks.length}/5)
              </span>
              <button
                onClick={onOpenNewNotebookModal}
                disabled={activeTab.notebooks.length >= 5}
                className="text-[var(--accent)] hover:opacity-80 p-1 disabled:opacity-30 cursor-pointer"
                title="Add Notebook"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {activeTab.notebooks.map((nb) => (
                <div
                  key={nb.id}
                  onClick={() => onSelectNotebook(nb.id)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    activeTab.activeNotebookId === nb.id && activeTab.activeNotebookType === 'notebook'
                      ? 'border-[var(--accent)] bg-[var(--bg-active)]'
                      : 'border-[var(--border)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nb.colorDot || 'var(--accent)' }} />
                    <span className="truncate">{nb.title}</span>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center justify-between">
                    <span>{nb.citationStyle}</span>
                    <span>{nb.backlinks.length} backlink(s)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: CANVAS & NODES OUTLINE */}
        {activeTool === 'canvas' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                Node Canvases ({activeTab.canvases.length}/5)
              </span>
              <button
                onClick={onOpenNewNotebookModal}
                disabled={activeTab.canvases.length >= 5}
                className="text-[var(--accent)] hover:opacity-80 p-1 disabled:opacity-30 cursor-pointer"
                title="Add Canvas"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {activeTab.canvases.map((cv) => (
                <div
                  key={cv.id}
                  onClick={() => onSelectCanvas(cv.id)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    activeTab.activeNotebookId === cv.id && activeTab.activeNotebookType === 'canvas'
                      ? 'border-[var(--accent)] bg-[var(--bg-active)]'
                      : 'border-[var(--border)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                    <Workflow className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="truncate">{cv.title}</span>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center justify-between">
                    <span>{cv.nodes.length} nodes</span>
                    <span>{cv.wires.length} wires</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: PDF OUTLINE / TABLE OF CONTENTS */}
        {activeTool === 'reader' && (
          <div className="space-y-2">
            <span className="font-semibold text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
              Document Outline
            </span>
            <div className="space-y-1">
              {[
                { title: '1. Abstract & Introduction', page: 1 },
                { title: '2. Theoretical Boundary Formulations', page: 2 },
                { title: '3. Invariant Manifold Dynamics', page: 3 },
                { title: '4. Experimental Protocol & Verification', page: 5 },
                { title: '5. Error Analysis & Scalability', page: 8 },
                { title: '6. Concluding Remarks & References', page: 12 },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onJumpToPage(item.page)}
                  className={`flex items-center justify-between py-1.5 px-2 rounded hover:bg-[var(--bg-hover)] cursor-pointer ${
                    activeTab.currentPage === item.page ? 'text-[var(--accent)] font-semibold bg-[var(--bg-active)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <span className="truncate pr-2">{item.title}</span>
                  <span className="text-[10px] opacity-60 font-mono">p. {item.page}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: SEARCH IN PROJECT */}
        {activeTool === 'search' && (
          <div className="space-y-3">
            <span className="font-semibold text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
              Search Workspace
            </span>
            <div className="relative">
              <input
                type="text"
                placeholder="Search text, LaTeX, nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border bg-[var(--bg-toolbar)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
            <div className="text-[11px] text-[var(--text-muted)] px-1">
              Found 4 occurrences across document & notebooks.
            </div>
          </div>
        )}

        {/* VIEW 6: INTEGRATIONS & LINKS */}
        {activeTool === 'links' && (
          <div className="space-y-3">
            <span className="font-semibold text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
              Cross-Document Links
            </span>
            <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-toolbar)] text-[11px] space-y-1.5 text-[var(--text-secondary)]">
              <p>Type <code className="bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded text-[var(--accent)] font-mono">@</code> in any notebook or canvas node to link internal elements.</p>
              <p>Type <code className="bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded text-[var(--accent)] font-mono">@@</code> to link other currently open PDF workspaces!</p>
            </div>
          </div>
        )}
      </div>

      {/* Full-width outlined "Upload File" button at bottom (from screenshot) */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <label className="flex items-center justify-center gap-2 w-full py-2 px-3 border rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-all">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
          <input
            type="file"
            accept=".pdf,.zodiac,application/pdf"
            className="hidden"
            onChange={onUploadFile}
          />
        </label>
      </div>
    </div>
  );
};
