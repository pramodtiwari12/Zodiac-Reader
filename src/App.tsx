/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ProjectTab,
  ActiveSideTool,
  WorkspaceViewMode,
  AppSettings,
  UserAccount,
  NotebookType,
  NotebookContent,
  CanvasData,
  PdfAnnotation
} from './types';
import {
  getStoredTabs,
  saveStoredTabs,
  getActiveTabId,
  saveActiveTabId,
  getStoredSettings,
  saveStoredSettings,
  getStoredUser,
  saveStoredUser,
  recordVersionSnapshot,
  SAMPLE_PROJECTS,
  MAX_NOTEBOOKS,
  MAX_CANVASES
} from './db/storage';
import { exportZodiacBundle, importZodiacBundle } from './utils/zodiacBundle';
import { exportNotebookAsPdf, exportCanvasAsPdf, exportCanvasAsPng } from './utils/pdfGenerator';
import { getAutocompleteSuggestion } from './utils/gemini';

// Layout & Navigation Components
import { TopTabStrip } from './components/layout/TopTabStrip';
import { IconRail } from './components/layout/IconRail';
import { SidePanel } from './components/layout/SidePanel';
import { SubBar } from './components/layout/SubBar';
import { StatusBar } from './components/layout/StatusBar';

// Main Area Components
import { HomePage } from './components/home/HomePage';
import { PdfViewer } from './components/pdf/PdfViewer';
import { NotebookEditor } from './components/notebook/NotebookEditor';
import { InfiniteCanvas } from './components/canvas/InfiniteCanvas';

// Overlays & Assistant Panels
import { ZodiacAIPanel } from './components/ai/ZodiacAIPanel';
import { BuiltInBrowser } from './components/browser/BuiltInBrowser';
import { LatexModal } from './components/latex/LatexModal';

// Modals
import { AboutContactModal } from './components/modals/AboutContactModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { NewNotebookModal } from './components/modals/NewNotebookModal';
import { LegalModal } from './components/modals/LegalModal';
import { UserAccountModal } from './components/modals/UserAccountModal';

export default function App() {
  // State: Settings, Theme & User
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);
  const [user, setUser] = useState<UserAccount>(getStoredUser);

  // Tabs State
  const [tabs, setTabs] = useState<ProjectTab[]>(getStoredTabs);
  const [activeTabId, setActiveTabId] = useState<string>(getActiveTabId);

  // Layout State
  const [activeSideTool, setActiveSideTool] = useState<ActiveSideTool>('files');
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedText, setLastSavedText] = useState('Saved');
  const [isAiCompleting, setIsAiCompleting] = useState(false);

  // Split Divider State
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Overlays State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isLatexOpen, setIsLatexOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isNewNotebookOpen, setIsNewNotebookOpen] = useState(false);
  const [legalModalView, setLegalModalView] = useState<'privacy' | 'terms' | null>(null);
  const [isUserOpen, setIsUserOpen] = useState(false);

  // Backlink jump flash effect
  const [highlightFlashPage, setHighlightFlashPage] = useState<number | null>(null);

  // Canvas ref for export
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

  // Apply Theme Mode
  useEffect(() => {
    let mode = settings.theme;
    if (mode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      mode = isDark ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', mode);
  }, [settings.theme]);

  // Persist Settings & User
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStoredUser(user);
  }, [user]);

  // Active Tab resolution
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || SAMPLE_PROJECTS[0];

  // Helper to update current tab
  const updateCurrentTab = useCallback((updater: (prev: ProjectTab) => ProjectTab) => {
    setTabs((prevTabs) => {
      const nextTabs = prevTabs.map((t) => (t.id === activeTabId ? updater(t) : t));
      return nextTabs;
    });
  }, [activeTabId]);

  // Autosave Timer
  useEffect(() => {
    const timer = setInterval(() => {
      saveStoredTabs(tabs);
      saveActiveTabId(activeTabId);
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        setLastSavedText('Saved');
      }, 350);
    }, settings.autosaveInterval * 1000);

    return () => clearInterval(timer);
  }, [tabs, activeTabId, settings.autosaveInterval]);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Browser (Ctrl + /)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsBrowserOpen((prev) => !prev);
      }
      // Toggle Zodiac AI (Ctrl + Shift + A)
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAiOpen((prev) => !prev);
      }
      // LaTeX Editor (Ctrl + L)
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        setIsLatexOpen((prev) => !prev);
      }
      // Global Search (Ctrl + K)
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setActiveSideTool('search');
        setIsSidePanelCollapsed(false);
      }
      // New Tab (Ctrl + T)
      else if ((e.ctrlKey || e.metaKey) && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        handleCreateHomeTab();
      }
      // Close Tab (Ctrl + W)
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        handleCloseTab(activeTabId);
      }
      // Force Save (Ctrl + S)
      else if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        saveStoredTabs(tabs);
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 300);
      }
      // Shortcuts Modal (Ctrl + Shift + /)
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId]);

  // Split Divider Dragging Handlers
  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingDivider(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingDivider || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const newRatio = Math.min(0.8, Math.max(0.2, relativeX / rect.width));
      updateCurrentTab((tab) => ({ ...tab, splitRatio: newRatio }));
    };

    const handleMouseUp = () => {
      if (isDraggingDivider) {
        setIsDraggingDivider(false);
      }
    };

    if (isDraggingDivider) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingDivider, updateCurrentTab]);

  // Divider Double Click to Reset (50/50)
  const handleResetDivider = () => {
    updateCurrentTab((tab) => ({ ...tab, splitRatio: 0.5 }));
  };

  // Tab Strip Actions
  const handleCreateHomeTab = () => {
    const newTab: ProjectTab = {
      id: `tab_home_${Date.now()}`,
      title: 'Home Workspace',
      type: 'home',
      filePath: 'Workspace / Home',
      viewMode: 'split',
      splitRatio: 0.5,
      currentPage: 1,
      totalPages: 1,
      pdfTitle: 'Home Workspace',
      notebooks: [],
      canvases: [],
      annotations: [],
      activeNotebookType: 'notebook'
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (idToClose: string) => {
    if (tabs.length === 1) {
      // Always keep at least 1 tab
      return;
    }
    const filtered = tabs.filter((t) => t.id !== idToClose);
    setTabs(filtered);
    if (activeTabId === idToClose) {
      setActiveTabId(filtered[0].id);
    }
  };

  const handleDuplicateTab = (id: string) => {
    const target = tabs.find((t) => t.id === id);
    if (!target) return;
    const duplicated: ProjectTab = {
      ...JSON.parse(JSON.stringify(target)),
      id: `tab_${Date.now()}`,
      title: `${target.title} (Copy)`
    };
    setTabs((prev) => [...prev, duplicated]);
    setActiveTabId(duplicated.id);
  };

  const handleCloseOthers = (keepId: string) => {
    setTabs((prev) => prev.filter((t) => t.id === keepId));
    setActiveTabId(keepId);
  };

  const handleCloseToRight = (targetId: string) => {
    const idx = tabs.findIndex((t) => t.id === targetId);
    if (idx !== -1) {
      const remaining = tabs.slice(0, idx + 1);
      setTabs(remaining);
      if (!remaining.some((t) => t.id === activeTabId)) {
        setActiveTabId(targetId);
      }
    }
  };

  // File Upload Handlers (PDF and .zodiac)
  const handleOpenPdfFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      const newTab: ProjectTab = {
        id: `tab_pdf_${Date.now()}`,
        title: file.name,
        type: 'pdf',
        filePath: `Workspace / References / ${file.name}`,
        pdfTitle: file.name.replace(/\.[^/.]+$/, ''),
        pdfDataUri: dataUri,
        currentPage: 1,
        totalPages: 16,
        viewMode: 'split',
        splitRatio: 0.5,
        activeNotebookId: `nb_${Date.now()}`,
        activeNotebookType: 'notebook',
        notebooks: [
          {
            id: `nb_${Date.now()}`,
            title: 'Research Analysis & Key Takeaways',
            type: 'notebook',
            colorDot: '#1F4E79',
            citationStyle: 'APA 7',
            fontFamily: settings.notebookFont,
            updatedAt: Date.now(),
            plainText: `Notes on ${file.name}\n\nSelect text in the PDF reader to add quotes and links directly to this notebook.`,
            bodyHtml: `<h2>Notes on ${file.name}</h2><p>Select text in the PDF reader to add quotes and links directly to this notebook.</p>`,
            backlinks: []
          }
        ],
        canvases: [
          {
            id: `cv_${Date.now()}`,
            title: 'Hypothesis & Proof Map',
            type: 'canvas',
            colorDot: '#D9822B',
            viewport: { x: 40, y: 30, zoom: 1 },
            updatedAt: Date.now(),
            nodes: [
              {
                id: `node_init`,
                type: 'note',
                title: 'Primary Hypothesis',
                x: 100,
                y: 100,
                width: 250,
                height: 120,
                colorDot: '#1F4E79',
                content: { text: `Initial analysis of ${file.name}` }
              }
            ],
            wires: [],
            strokes: []
          }
        ],
        annotations: []
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenZodiacFile = async (file: File) => {
    try {
      const restored = await importZodiacBundle(file);
      setTabs((prev) => [...prev, restored]);
      setActiveTabId(restored.id);
    } catch (err: any) {
      alert(`Failed to restore .zodiac project: ${err.message || 'Corrupted archive'}`);
    }
  };

  // Export Handlers
  const handleExportZodiac = async () => {
    try {
      const blob = await exportZodiacBundle(activeTab);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab.title.replace(/\.[^/.]+$/, '')}.zodiac`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Export failed: ${e.message}`);
    }
  };

  const handleExportNotebookPdf = () => {
    const activeNb = activeTab.notebooks.find((n) => n.id === activeTab.activeNotebookId) || activeTab.notebooks[0];
    if (activeNb) {
      exportNotebookAsPdf(activeNb, activeTab.pdfTitle || activeTab.title);
    }
  };

  const handleExportCanvasPdf = () => {
    const activeCv = activeTab.canvases.find((c) => c.id === activeTab.activeNotebookId) || activeTab.canvases[0];
    if (activeCv) {
      exportCanvasAsPdf(activeCv, activeTab.pdfTitle || activeTab.title);
    }
  };

  // PDF to Notes Interactions (Quote, Snapshot, Backlinks)
  const handleSendTextToNotebook = (text: string, page: number) => {
    updateCurrentTab((tab) => {
      let activeNb = tab.notebooks.find((n) => n.id === tab.activeNotebookId) || tab.notebooks[0];
      if (!activeNb) {
        // Create initial notebook if empty
        activeNb = {
          id: `nb_${Date.now()}`,
          title: 'General Research Notes',
          type: 'notebook',
          colorDot: '#1F4E79',
          citationStyle: 'APA 7',
          fontFamily: settings.notebookFont,
          updatedAt: Date.now(),
          plainText: '',
          bodyHtml: '',
          backlinks: []
        };
        tab.notebooks.push(activeNb);
        tab.activeNotebookId = activeNb.id;
      }

      const quoteBlockHtml = `
        <blockquote class="border-l-3 border-[var(--accent)] pl-3 my-2 text-[var(--text-secondary)] italic">
          "${text}"
          <span class="text-xs text-[var(--accent)] font-mono font-medium ml-2 bg-[var(--accent-soft)] px-2 py-0.5 rounded cursor-pointer select-none inline-flex items-center gap-1" data-page="${page}">
            p. ${page}
          </span>
        </blockquote><p><br></p>
      `;

      activeNb.bodyHtml = (activeNb.bodyHtml || '') + quoteBlockHtml;
      activeNb.plainText = (activeNb.plainText || '') + `\n\n"${text}" (p. ${page})`;
      activeNb.backlinks.push({
        pdfId: tab.id,
        pdfTitle: tab.pdfTitle || tab.title,
        page,
        textSnippet: text
      });
      activeNb.updatedAt = Date.now();

      return { ...tab, activeNotebookType: 'notebook', activeNotebookId: activeNb.id };
    });
  };

  const handleSendTextToCanvas = (text: string, page: number) => {
    updateCurrentTab((tab) => {
      let activeCv = tab.canvases.find((c) => c.id === tab.activeNotebookId) || tab.canvases[0];
      if (!activeCv) {
        activeCv = {
          id: `cv_${Date.now()}`,
          title: 'Research Mindmap',
          type: 'canvas',
          colorDot: '#D9822B',
          viewport: { x: 40, y: 30, zoom: 1 },
          updatedAt: Date.now(),
          nodes: [],
          wires: [],
          strokes: []
        };
        tab.canvases.push(activeCv);
        tab.activeNotebookId = activeCv.id;
      }

      const newNode = {
        id: `node_quote_${Date.now()}`,
        type: 'quote' as const,
        title: `Quote Snippet (p. ${page})`,
        x: 120 + activeCv.nodes.length * 30,
        y: 100 + activeCv.nodes.length * 30,
        width: 270,
        height: 130,
        colorDot: '#1F4E79',
        content: {
          text,
          backlink: {
            pdfId: tab.id,
            pdfTitle: tab.pdfTitle || tab.title,
            page
          }
        }
      };

      activeCv.nodes.push(newNode);
      activeCv.updatedAt = Date.now();

      return { ...tab, activeNotebookType: 'canvas', activeNotebookId: activeCv.id };
    });
  };

  const handleSendSnapshotToNotebook = (imgUrl: string, page: number) => {
    updateCurrentTab((tab) => {
      const activeNb = tab.notebooks.find((n) => n.id === tab.activeNotebookId) || tab.notebooks[0];
      if (activeNb) {
        const imageBlock = `
          <div class="my-3 p-2 rounded border border-[var(--border)] bg-white max-w-md">
            <img src="${imgUrl}" alt="Snapshot Page ${page}" class="rounded w-full" />
            <div class="mt-1 flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
              <span>Page ${page} Region Snapshot</span>
              <span class="text-[var(--accent)] font-semibold cursor-pointer" data-page="${page}">p. ${page}</span>
            </div>
          </div><p><br></p>
        `;
        activeNb.bodyHtml = (activeNb.bodyHtml || '') + imageBlock;
        activeNb.updatedAt = Date.now();
      }
      return { ...tab, activeNotebookType: 'notebook' };
    });
  };

  const handleSendSnapshotToCanvas = (imgUrl: string, page: number) => {
    updateCurrentTab((tab) => {
      const activeCv = tab.canvases.find((c) => c.id === tab.activeNotebookId) || tab.canvases[0];
      if (activeCv) {
        activeCv.nodes.push({
          id: `node_snap_${Date.now()}`,
          type: 'snapshot',
          title: `Visual Snapshot (p. ${page})`,
          x: 160 + activeCv.nodes.length * 20,
          y: 120 + activeCv.nodes.length * 20,
          width: 280,
          height: 180,
          colorDot: '#D9822B',
          content: {
            imageUrl: imgUrl,
            backlink: {
              pdfId: tab.id,
              pdfTitle: tab.pdfTitle || tab.title,
              page
            }
          }
        });
        activeCv.updatedAt = Date.now();
      }
      return { ...tab, activeNotebookType: 'canvas' };
    });
  };

  // Jump to PDF page with 1.2s flash highlight
  const handleJumpToPdfPage = (page: number) => {
    updateCurrentTab((tab) => ({ ...tab, currentPage: page }));
    setHighlightFlashPage(page);
  };

  // AI Completion in Notebook Sub-Bar
  const handleTriggerAiCompletion = async () => {
    const activeNb = activeTab.notebooks.find((n) => n.id === activeTab.activeNotebookId) || activeTab.notebooks[0];
    if (!activeNb) return;
    setIsAiCompleting(true);
    try {
      const suggestion = await getAutocompleteSuggestion(
        activeNb.plainText,
        { pdfTitle: activeTab.pdfTitle, currentPage: activeTab.currentPage },
        settings.geminiApiKeyOverride
      );

      updateCurrentTab((tab) => {
        const nb = tab.notebooks.find((n) => n.id === tab.activeNotebookId) || tab.notebooks[0];
        if (nb) {
          nb.plainText += suggestion;
          nb.bodyHtml += `<span>${suggestion}</span>`;
          nb.updatedAt = Date.now();
        }
        return { ...tab };
      });
    } finally {
      setIsAiCompleting(false);
    }
  };

  // Create new Notebook or Canvas
  const handleCreateNewWorkspaceItem = (type: NotebookType, title: string, colorDot: string) => {
    updateCurrentTab((tab) => {
      if (type === 'notebook') {
        const newNb: NotebookContent = {
          id: `nb_${Date.now()}`,
          title,
          type: 'notebook',
          colorDot,
          citationStyle: 'APA 7',
          fontFamily: settings.notebookFont,
          updatedAt: Date.now(),
          plainText: '',
          bodyHtml: `<h2>${title}</h2><p>Begin synthesizing notes and citations here.</p>`,
          backlinks: []
        };
        return {
          ...tab,
          notebooks: [...tab.notebooks, newNb],
          activeNotebookId: newNb.id,
          activeNotebookType: 'notebook'
        };
      } else {
        const newCv: CanvasData = {
          id: `cv_${Date.now()}`,
          title,
          type: 'canvas',
          colorDot,
          viewport: { x: 40, y: 30, zoom: 1 },
          updatedAt: Date.now(),
          nodes: [],
          wires: [],
          strokes: []
        };
        return {
          ...tab,
          canvases: [...tab.canvases, newCv],
          activeNotebookId: newCv.id,
          activeNotebookType: 'canvas'
        };
      }
    });
  };

  // Calculate current word count
  const activeNotebook = activeTab.notebooks.find((n) => n.id === activeTab.activeNotebookId) || activeTab.notebooks[0];
  const wordCount = activeNotebook?.plainText
    ? activeNotebook.plainText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden select-none" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      {/* [A] Top Tab Strip */}
      <TopTabStrip
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onNewTab={handleCreateHomeTab}
        onDuplicateTab={handleDuplicateTab}
        onCloseOthers={handleCloseOthers}
        onCloseToRight={handleCloseToRight}
        theme={settings.theme}
        onToggleTheme={() => {
          setSettings((prev) => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark'
          }));
        }}
        user={user}
        onOpenSearch={() => {
          setActiveSideTool('search');
          setIsSidePanelCollapsed(false);
        }}
        onOpenPrivacy={() => setLegalModalView('privacy')}
        onToggleAi={() => setIsAiOpen((prev) => !prev)}
        isAiOpen={isAiOpen}
        onOpenUserModal={() => setIsUserOpen(true)}
      />

      {/* Main Middle Container: Rail + Side Panel + Main Workspace + Overlays */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* [B] Left Icon Rail */}
        <IconRail
          activeTool={activeSideTool}
          onSelectTool={(tool) => {
            if (tool === 'home') {
              handleCreateHomeTab();
            } else if (tool === 'ai') {
              setIsAiOpen(true);
            } else {
              setActiveSideTool(tool);
              setIsSidePanelCollapsed(false);
            }
          }}
          onOpenInfo={() => setIsAboutOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          user={user}
          onOpenUserModal={() => setIsUserOpen(true)}
        />

        {/* [C] Collapsible Context-Aware Side Panel */}
        <SidePanel
          isCollapsed={isSidePanelCollapsed}
          onToggleCollapse={() => setIsSidePanelCollapsed((prev) => !prev)}
          activeTool={activeSideTool}
          activeTab={activeTab}
          allTabs={tabs}
          onSelectTab={setActiveTabId}
          onSelectNotebook={(id) => {
            updateCurrentTab((t) => ({ ...t, activeNotebookId: id, activeNotebookType: 'notebook' }));
          }}
          onSelectCanvas={(id) => {
            updateCurrentTab((t) => ({ ...t, activeNotebookId: id, activeNotebookType: 'canvas' }));
          }}
          onOpenNewNotebookModal={() => setIsNewNotebookOpen(true)}
          onUploadFile={(e) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              if (file.name.endsWith('.zodiac')) handleOpenZodiacFile(file);
              else handleOpenPdfFile(file);
            }
          }}
          onJumpToPage={handleJumpToPdfPage}
        />

        {/* [D] Main Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden relative" style={{ backgroundColor: 'var(--bg-canvas)' }}>
          {activeTab.type === 'home' ? (
            /* HOME PAGE VIEW */
            <HomePage
              onOpenPdfFile={handleOpenPdfFile}
              onOpenZodiacFile={handleOpenZodiacFile}
              recentProjects={tabs.filter((t) => t.type !== 'home')}
              onSelectProject={setActiveTabId}
              onDeleteProject={handleCloseTab}
              onExportProject={(p) => {
                exportZodiacBundle(p).then((blob) => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${p.title}.zodiac`;
                  a.click();
                  URL.revokeObjectURL(url);
                });
              }}
              user={user}
              onOpenUserModal={() => setIsUserOpen(true)}
              onOpenContactModal={() => setIsAboutOpen(true)}
            />
          ) : (
            /* ACTIVE PDF / RESEARCH SPLIT VIEW */
            <>
              {/* Sub-bar */}
              <SubBar
                wordCount={wordCount}
                onTriggerAiCompletion={handleTriggerAiCompletion}
                isAiCompleting={isAiCompleting}
                viewMode={activeTab.viewMode}
                onChangeViewMode={(mode) => updateCurrentTab((t) => ({ ...t, viewMode: mode }))}
                isSaving={isSaving}
                lastSavedText={lastSavedText}
                onExportZodiac={handleExportZodiac}
                onExportNotebookPdf={handleExportNotebookPdf}
                onExportCanvasPdf={handleExportCanvasPdf}
                onExportCanvasPng={(scale) => exportCanvasAsPng(canvasElementRef.current, activeTab.title, scale)}
                onShare={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Workspace link copied to clipboard!');
                }}
                activeTab={activeTab}
              />

              {/* Split Content Area */}
              <div
                ref={splitContainerRef}
                className="flex-1 flex overflow-hidden relative select-text"
              >
                {/* LEFT PANE (Normally PDF Viewer) */}
                {activeTab.viewMode !== 'notes-only' && (
                  <div
                    className="h-full overflow-hidden flex flex-col"
                    style={{
                      width: activeTab.viewMode === 'pdf-only' ? '100%' : `${activeTab.splitRatio * 100}%`
                    }}
                  >
                    {activeTab.viewMode === 'swapped' ? (
                      /* If swapped, Right editor is on left */
                      activeTab.activeNotebookType === 'notebook' && activeNotebook ? (
                        <NotebookEditor
                          notebook={activeNotebook}
                          allNotebooks={activeTab.notebooks}
                          allCanvases={activeTab.canvases}
                          allTabs={tabs}
                          onUpdateNotebook={(updated) => {
                            updateCurrentTab((tab) => ({
                              ...tab,
                              notebooks: tab.notebooks.map((n) => (n.id === updated.id ? updated : n))
                            }));
                          }}
                          onOpenLatexModal={() => setIsLatexOpen(true)}
                          onJumpToPdfPage={handleJumpToPdfPage}
                          onSwitchTab={setActiveTabId}
                          sourcePdfTitle={activeTab.pdfTitle || activeTab.title}
                        />
                      ) : (
                        <InfiniteCanvas
                          canvas={activeTab.canvases.find((c) => c.id === activeTab.activeNotebookId) || activeTab.canvases[0] || {
                            id: 'cv_default',
                            title: 'Canvas',
                            type: 'canvas',
                            nodes: [],
                            wires: [],
                            strokes: [],
                            viewport: { x: 0, y: 0, zoom: 1 },
                            updatedAt: Date.now()
                          }}
                          onUpdateCanvas={(updated) => {
                            updateCurrentTab((tab) => ({
                              ...tab,
                              canvases: tab.canvases.map((c) => (c.id === updated.id ? updated : c))
                            }));
                          }}
                          onJumpToPdfPage={handleJumpToPdfPage}
                          onSelectNotebook={(id) => {
                            updateCurrentTab((t) => ({ ...t, activeNotebookId: id, activeNotebookType: 'notebook' }));
                          }}
                          onOpenLatexModal={() => setIsLatexOpen(true)}
                          onOpenBrowser={() => setIsBrowserOpen(true)}
                          sourcePdfTitle={activeTab.pdfTitle || activeTab.title}
                        />
                      )
                    ) : (
                      /* Standard Left Pane: PDF Viewer */
                      <PdfViewer
                        currentPage={activeTab.currentPage}
                        totalPages={activeTab.totalPages}
                        onPageChange={(page) => updateCurrentTab((t) => ({ ...t, currentPage: page }))}
                        pdfTitle={activeTab.pdfTitle || activeTab.title}
                        annotations={activeTab.annotations}
                        onAddAnnotation={(ann) => {
                          updateCurrentTab((tab) => ({ ...tab, annotations: [...tab.annotations, ann] }));
                        }}
                        onRemoveAnnotation={(id) => {
                          updateCurrentTab((tab) => ({
                            ...tab,
                            annotations: tab.annotations.filter((a) => a.id !== id)
                          }));
                        }}
                        onSendTextToNotebook={handleSendTextToNotebook}
                        onSendTextToCanvas={handleSendTextToCanvas}
                        onSendSnapshotToNotebook={handleSendSnapshotToNotebook}
                        onSendSnapshotToCanvas={handleSendSnapshotToCanvas}
                        onAskAiWithContext={(text, page) => {
                          setIsAiOpen(true);
                        }}
                        highlightFlashPage={highlightFlashPage}
                      />
                    )}
                  </div>
                )}

                {/* Draggable Divider (Only shown in Split or Swapped mode) */}
                {(activeTab.viewMode === 'split' || activeTab.viewMode === 'swapped') && (
                  <div
                    onMouseDown={handleDividerMouseDown}
                    onDoubleClick={handleResetDivider}
                    className="w-1.5 h-full hover:w-2 bg-transparent hover:bg-[var(--accent)]/30 active:bg-[var(--accent)] cursor-col-resize z-20 flex items-center justify-center transition-all group shrink-0 border-r border-[var(--border)]"
                    title="Drag to resize pane (Double click to reset 50/50)"
                  >
                    <div className="w-[2px] h-6 bg-[var(--border)] group-hover:bg-[var(--accent)] rounded-full" />
                  </div>
                )}

                {/* RIGHT PANE (Notebook OR Infinite Canvas) */}
                {activeTab.viewMode !== 'pdf-only' && (
                  <div
                    className="h-full overflow-hidden flex flex-col flex-1"
                  >
                    {activeTab.viewMode === 'swapped' ? (
                      /* If swapped, PDF viewer is on right */
                      <PdfViewer
                        currentPage={activeTab.currentPage}
                        totalPages={activeTab.totalPages}
                        onPageChange={(page) => updateCurrentTab((t) => ({ ...t, currentPage: page }))}
                        pdfTitle={activeTab.pdfTitle || activeTab.title}
                        annotations={activeTab.annotations}
                        onAddAnnotation={(ann) => {
                          updateCurrentTab((tab) => ({ ...tab, annotations: [...tab.annotations, ann] }));
                        }}
                        onRemoveAnnotation={(id) => {
                          updateCurrentTab((tab) => ({
                            ...tab,
                            annotations: tab.annotations.filter((a) => a.id !== id)
                          }));
                        }}
                        onSendTextToNotebook={handleSendTextToNotebook}
                        onSendTextToCanvas={handleSendTextToCanvas}
                        onSendSnapshotToNotebook={handleSendSnapshotToNotebook}
                        onSendSnapshotToCanvas={handleSendSnapshotToCanvas}
                        onAskAiWithContext={() => setIsAiOpen(true)}
                        highlightFlashPage={highlightFlashPage}
                      />
                    ) : (
                      /* Standard Right Pane: Notebook OR Infinite Canvas */
                      activeTab.activeNotebookType === 'notebook' && activeNotebook ? (
                        <NotebookEditor
                          notebook={activeNotebook}
                          allNotebooks={activeTab.notebooks}
                          allCanvases={activeTab.canvases}
                          allTabs={tabs}
                          onUpdateNotebook={(updated) => {
                            updateCurrentTab((tab) => ({
                              ...tab,
                              notebooks: tab.notebooks.map((n) => (n.id === updated.id ? updated : n))
                            }));
                          }}
                          onOpenLatexModal={() => setIsLatexOpen(true)}
                          onJumpToPdfPage={handleJumpToPdfPage}
                          onSwitchTab={setActiveTabId}
                          sourcePdfTitle={activeTab.pdfTitle || activeTab.title}
                        />
                      ) : (
                        <InfiniteCanvas
                          canvas={activeTab.canvases.find((c) => c.id === activeTab.activeNotebookId) || activeTab.canvases[0] || {
                            id: 'cv_default',
                            title: 'Canvas',
                            type: 'canvas',
                            nodes: [],
                            wires: [],
                            strokes: [],
                            viewport: { x: 0, y: 0, zoom: 1 },
                            updatedAt: Date.now()
                          }}
                          onUpdateCanvas={(updated) => {
                            updateCurrentTab((tab) => ({
                              ...tab,
                              canvases: tab.canvases.map((c) => (c.id === updated.id ? updated : c))
                            }));
                          }}
                          onJumpToPdfPage={handleJumpToPdfPage}
                          onSelectNotebook={(id) => {
                            updateCurrentTab((t) => ({ ...t, activeNotebookId: id, activeNotebookType: 'notebook' }));
                          }}
                          onOpenLatexModal={() => setIsLatexOpen(true)}
                          onOpenBrowser={() => setIsBrowserOpen(true)}
                          sourcePdfTitle={activeTab.pdfTitle || activeTab.title}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        {/* Slide-over Zodiac AI Assistant Panel (380px) */}
        <ZodiacAIPanel
          isOpen={isAiOpen}
          onClose={() => setIsAiOpen(false)}
          pdfTitle={activeTab.pdfTitle || activeTab.title}
          currentPage={activeTab.currentPage}
          onAddAiToNotebook={(aiText) => {
            handleSendTextToNotebook(aiText, activeTab.currentPage);
          }}
          onAddAiToCanvas={(aiText, prompt) => {
            updateCurrentTab((tab) => {
              const cv = tab.canvases.find((c) => c.id === tab.activeNotebookId) || tab.canvases[0];
              if (cv) {
                cv.nodes.push({
                  id: `node_ai_${Date.now()}`,
                  type: 'ai',
                  title: prompt || 'Gemini Synthesis',
                  x: 180 + cv.nodes.length * 20,
                  y: 140 + cv.nodes.length * 20,
                  width: 290,
                  height: 180,
                  colorDot: '#E9A23B',
                  content: { text: aiText }
                });
                cv.updatedAt = Date.now();
              }
              return { ...tab, activeNotebookType: 'canvas' };
            });
          }}
          apiKeyOverride={settings.geminiApiKeyOverride}
        />
      </div>

      {/* Status Bar (24px bottom) */}
      <StatusBar activeTab={activeTab} />

      {/* Floating Built-in Browser Window (Ctrl+/) */}
      <BuiltInBrowser
        isOpen={isBrowserOpen}
        onClose={() => setIsBrowserOpen(false)}
        onAddWebToNotebook={(title, snippet, url) => {
          updateCurrentTab((tab) => {
            const nb = tab.notebooks.find((n) => n.id === tab.activeNotebookId) || tab.notebooks[0];
            if (nb) {
              const webHtml = `
                <div class="my-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-paper)] shadow-xs">
                  <div class="text-[11px] font-semibold text-emerald-600 uppercase">Web Clip</div>
                  <h4 class="font-bold text-sm text-[var(--text-primary)] mt-1">${title}</h4>
                  <p class="text-xs text-[var(--text-secondary)] mt-1">${snippet}</p>
                  <a href="${url}" target="_blank" class="text-[10px] text-[var(--accent)] underline block mt-2 font-mono">${url}</a>
                </div><p><br></p>
              `;
              nb.bodyHtml = (nb.bodyHtml || '') + webHtml;
              nb.updatedAt = Date.now();
            }
            return { ...tab, activeNotebookType: 'notebook' };
          });
        }}
        onAddWebToCanvas={(title, snippet, url) => {
          updateCurrentTab((tab) => {
            const cv = tab.canvases.find((c) => c.id === tab.activeNotebookId) || tab.canvases[0];
            if (cv) {
              cv.nodes.push({
                id: `node_web_${Date.now()}`,
                type: 'web',
                title: title.slice(0, 24),
                x: 150 + cv.nodes.length * 20,
                y: 120 + cv.nodes.length * 20,
                width: 270,
                height: 140,
                colorDot: '#2E9E5B',
                content: {
                  text: snippet,
                  sourceUrl: url
                }
              });
              cv.updatedAt = Date.now();
            }
            return { ...tab, activeNotebookType: 'canvas' };
          });
        }}
      />

      {/* LaTeX Formula Modal (Ctrl+L) */}
      <LatexModal
        isOpen={isLatexOpen}
        onClose={() => setIsLatexOpen(false)}
        onInsertInline={(latex) => {
          const formatted = `$${latex}$`;
          document.execCommand('insertHTML', false, `<span class="katex-inline font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-xs">${formatted}</span> `);
        }}
        onInsertBlock={(latex) => {
          const formatted = `$$\n${latex}\n$$`;
          document.execCommand('insertHTML', false, `<div class="katex-display-block my-2 text-center font-mono bg-neutral-50 dark:bg-neutral-900 p-2 rounded border border-[var(--border)]">${formatted}</div><p><br></p>`);
        }}
        onInsertOnCanvas={(latex) => {
          updateCurrentTab((tab) => {
            const cv = tab.canvases.find((c) => c.id === tab.activeNotebookId) || tab.canvases[0];
            if (cv) {
              cv.nodes.push({
                id: `node_latex_${Date.now()}`,
                type: 'latex',
                title: 'Mathematical Lemma',
                x: 200,
                y: 150,
                width: 280,
                height: 140,
                colorDot: '#D9822B',
                content: { latex, text: 'Derived formulation' }
              });
              cv.updatedAt = Date.now();
            }
            return { ...tab, activeNotebookType: 'canvas' };
          });
        }}
      />

      {/* New Notebook Modal */}
      <NewNotebookModal
        isOpen={isNewNotebookOpen}
        onClose={() => setIsNewNotebookOpen(false)}
        onCreate={handleCreateNewWorkspaceItem}
        currentCount={activeTab.notebooks.length + activeTab.canvases.length}
        maxLimit={MAX_NOTEBOOKS + MAX_CANVASES}
      />

      {/* About & Contact Modal */}
      <AboutContactModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onClearLocalData={() => {
          if (confirm('Reset local workspaces back to default sample research papers?')) {
            localStorage.clear();
            setTabs(SAMPLE_PROJECTS);
            setActiveTabId(SAMPLE_PROJECTS[0].id);
            setIsSettingsOpen(false);
          }
        }}
      />

      {/* Keyboard Shortcuts Cheat-Sheet */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Legal Privacy / Terms Modal */}
      <LegalModal
        isOpen={legalModalView !== null}
        onClose={() => setLegalModalView(null)}
        view={legalModalView || 'privacy'}
      />

      {/* User Account / Google Sign-In Modal */}
      <UserAccountModal
        isOpen={isUserOpen}
        onClose={() => setIsUserOpen(false)}
        user={user}
        onUpdateUser={setUser}
      />
    </div>
  );
}
