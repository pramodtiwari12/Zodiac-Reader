import React, { useState, useRef, useEffect } from 'react';
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Link as LinkIcon,
  Sigma,
  Radical,
  Table,
  Image as ImageIcon,
  Minus,
  Sparkles,
  ChevronDown,
  AlertCircle,
  ExternalLink,
  Plus
} from 'lucide-react';
import { NotebookContent, ProjectTab } from '../../types';
import { Tooltip } from '../common/Tooltip';
import katex from 'katex';

interface NotebookEditorProps {
  notebook: NotebookContent;
  allNotebooks: NotebookContent[];
  allCanvases: any[];
  allTabs: ProjectTab[];
  onUpdateNotebook: (updated: NotebookContent) => void;
  onOpenLatexModal: () => void;
  onJumpToPdfPage: (page: number) => void;
  onSwitchTab: (tabId: string) => void;
  sourcePdfTitle: string;
}

export const NotebookEditor: React.FC<NotebookEditorProps> = ({
  notebook,
  allNotebooks,
  allCanvases,
  allTabs,
  onUpdateNotebook,
  onOpenLatexModal,
  onJumpToPdfPage,
  onSwitchTab,
  sourcePdfTitle
}) => {
  const [citationStyle, setCitationStyle] = useState(notebook.citationStyle || 'APA 7');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>(notebook.fontFamily || 'sans');
  const [fontSize, setFontSize] = useState('15px');
  const [activeAlign, setActiveAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [editorMode, setEditorMode] = useState<'paragraph' | 'code'>('paragraph');

  // Mention popup state (@ or @@)
  const [mentionType, setMentionType] = useState<'single' | 'double' | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPos, setMentionPos] = useState<{ x: number; y: number } | null>(null);

  const editorContentRef = useRef<HTMLDivElement>(null);

  // Synchronize initial body HTML
  useEffect(() => {
    if (editorContentRef.current && editorContentRef.current.innerHTML !== notebook.bodyHtml) {
      editorContentRef.current.innerHTML = notebook.bodyHtml;
    }
  }, [notebook.id]);

  const handleInput = () => {
    if (!editorContentRef.current) return;
    const bodyHtml = editorContentRef.current.innerHTML;
    const plainText = editorContentRef.current.innerText || '';
    onUpdateNotebook({
      ...notebook,
      bodyHtml,
      plainText,
      fontFamily,
      citationStyle,
      updatedAt: Date.now()
    });
  };

  // Execute formatting command
  const format = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorContentRef.current) {
      editorContentRef.current.focus();
    }
    handleInput();
  };

  // Keyboard shortcut listener
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '@') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        // check if previous char was also @ (meaning @@)
        const textBefore = range.startContainer.textContent?.slice(0, range.startOffset) || '';
        if (textBefore.endsWith('@')) {
          setMentionType('double');
        } else {
          setMentionType('single');
        }
        setMentionPos({ x: rect.left, y: rect.bottom + 8 });
        setMentionQuery('');
      }
    } else if (e.key === 'Escape') {
      setMentionType(null);
    }
  };

  // Insert custom Callout block
  const insertImportantCallout = () => {
    const calloutHtml = `
      <div class="callout-block p-3.5 my-3 bg-neutral-50 dark:bg-neutral-900 border-l-4 border-amber-500 rounded-r shadow-xs">
        <div class="text-[11px] font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase">IMPORTANT</div>
        <p class="mt-1 text-sm text-[var(--text-primary)]"><strong>Crucial observation:</strong> State formulation remains valid under local boundary conditions.</p>
      </div><p><br></p>
    `;
    format('insertHTML', calloutHtml);
  };

  // Insert KaTeX formula block
  const insertKatexBlock = (latexStr = '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}') => {
    try {
      const renderedHtml = katex.renderToString(latexStr, { displayMode: true, throwOnError: false });
      const blockHtml = `<div class="katex-display-block my-2" contenteditable="false">${renderedHtml}</div><p><br></p>`;
      format('insertHTML', blockHtml);
    } catch (e) {
      format('insertHTML', `<div class="font-mono bg-neutral-100 p-2 my-1">$$${latexStr}$$</div>`);
    }
  };

  const getFontFamilyStyle = () => {
    if (fontFamily === 'serif') return 'var(--font-serif)';
    if (fontFamily === 'mono') return 'var(--font-mono)';
    return 'var(--font-ui)';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-text relative" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      {/* Notebook Formatting Toolbar (Single Row, matching screenshot) */}
      <div
        className="h-10 px-3 flex items-center justify-between border-b select-none shrink-0 gap-1.5 overflow-x-auto no-scrollbar"
        style={{
          backgroundColor: 'var(--bg-toolbar)',
          borderColor: 'var(--border)'
        }}
      >
        {/* Left Toolbar Cluster */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Paragraph Style Dropdown */}
          <select
            defaultValue="p"
            onChange={(e) => format('formatBlock', e.target.value)}
            className="text-xs px-2 py-1 rounded bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] cursor-pointer"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>

          {/* Citation Style Dropdown */}
          <select
            value={citationStyle}
            onChange={(e) => setCitationStyle(e.target.value)}
            className="text-xs px-2 py-1 rounded bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] cursor-pointer"
          >
            <option value="APA 7">APA 7</option>
            <option value="IEEE">IEEE</option>
            <option value="Chicago">Chicago</option>
            <option value="Harvard">Harvard</option>
            <option value="MLA 9">MLA 9</option>
          </select>

          {/* Font Dropdown */}
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value as any)}
            className="text-xs px-2 py-1 rounded bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-primary)] cursor-pointer"
          >
            <option value="sans">Inter (Sans)</option>
            <option value="serif">Source Serif 4</option>
            <option value="mono">JetBrains Mono</option>
          </select>

          <div className="w-[1px] h-4 bg-[var(--border)] mx-0.5" />

          {/* Undo / Redo */}
          <Tooltip content="Undo" shortcut="Ctrl+Z">
            <button onClick={() => format('undo')} className="z-btn-icon w-6.5 h-6.5">
              <Undo className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Redo" shortcut="Ctrl+Y">
            <button onClick={() => format('redo')} className="z-btn-icon w-6.5 h-6.5">
              <Redo className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <div className="w-[1px] h-4 bg-[var(--border)] mx-0.5" />

          {/* Bold, Italic, Underline, Strike */}
          <Tooltip content="Bold" shortcut="Ctrl+B">
            <button onClick={() => format('bold')} className="z-btn-icon w-6.5 h-6.5 font-bold">
              <Bold className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Italic" shortcut="Ctrl+I">
            <button onClick={() => format('italic')} className="z-btn-icon w-6.5 h-6.5 italic">
              <Italic className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Underline" shortcut="Ctrl+U">
            <button onClick={() => format('underline')} className="z-btn-icon w-6.5 h-6.5">
              <UnderlineIcon className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Strikethrough">
            <button onClick={() => format('strikeThrough')} className="z-btn-icon w-6.5 h-6.5">
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Inline Code">
            <button onClick={() => format('code')} className="z-btn-icon w-6.5 h-6.5">
              <Code className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Text Highlight">
            <button onClick={() => format('hiliteColor', '#FFE066')} className="z-btn-icon w-6.5 h-6.5 text-amber-500">
              <Highlighter className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>

        {/* Center Cluster: Alignment & Lists */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center bg-[var(--bg-hover)] p-0.5 rounded-md border border-[var(--border)]">
            <button
              onClick={() => {
                format('justifyLeft');
                setActiveAlign('left');
              }}
              className={`p-1 rounded ${activeAlign === 'left' ? 'bg-[var(--bg-active)] text-[var(--accent)] shadow-xs' : 'text-[var(--text-secondary)]'}`}
            >
              <AlignLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                format('justifyCenter');
                setActiveAlign('center');
              }}
              className={`p-1 rounded ${activeAlign === 'center' ? 'bg-[var(--bg-active)] text-[var(--accent)] shadow-xs' : 'text-[var(--text-secondary)]'}`}
            >
              <AlignCenter className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                format('justifyRight');
                setActiveAlign('right');
              }}
              className={`p-1 rounded ${activeAlign === 'right' ? 'bg-[var(--bg-active)] text-[var(--accent)] shadow-xs' : 'text-[var(--text-secondary)]'}`}
            >
              <AlignRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                format('justifyFull');
                setActiveAlign('justify');
              }}
              className={`p-1 rounded ${activeAlign === 'justify' ? 'bg-[var(--bg-active)] text-[var(--accent)] shadow-xs' : 'text-[var(--text-secondary)]'}`}
            >
              <AlignJustify className="w-3 h-3" />
            </button>
          </div>

          <div className="w-[1px] h-4 bg-[var(--border)] mx-0.5" />

          {/* Lists */}
          <Tooltip content="Bullet List">
            <button onClick={() => format('insertUnorderedList')} className="z-btn-icon w-6.5 h-6.5">
              <List className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Numbered List">
            <button onClick={() => format('insertOrderedList')} className="z-btn-icon w-6.5 h-6.5">
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Important Callout">
            <button onClick={insertImportantCallout} className="z-btn-icon w-6.5 h-6.5 text-amber-600">
              <AlertCircle className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>

        {/* Right Cluster: Math (KaTeX), Tables, Images */}
        <div className="flex items-center gap-1 shrink-0">
          <Tooltip content="LaTeX Formula Editor" shortcut="Ctrl+L">
            <button
              onClick={onOpenLatexModal}
              className="z-btn-icon w-6.5 h-6.5 text-[var(--accent)] font-semibold"
            >
              <Sigma className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Insert Equation Block">
            <button
              onClick={() => insertKatexBlock()}
              className="z-btn-icon w-6.5 h-6.5 text-[var(--accent)]"
            >
              <Radical className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Insert Table">
            <button
              onClick={() => format('insertHTML', '<table class="border-collapse border border-[var(--border)] my-2 w-full text-xs"><thead><tr><th class="border border-[var(--border)] p-1.5 bg-neutral-100 dark:bg-neutral-800">Parameter</th><th class="border border-[var(--border)] p-1.5 bg-neutral-100 dark:bg-neutral-800">Value</th><th class="border border-[var(--border)] p-1.5 bg-neutral-100 dark:bg-neutral-800">Uncertainty</th></tr></thead><tbody><tr><td class="border border-[var(--border)] p-1.5">$\\omega_0$</td><td class="border border-[var(--border)] p-1.5">4.82 GHz</td><td class="border border-[var(--border)] p-1.5">± 0.05</td></tr></tbody></table><p><br></p>')}
              className="z-btn-icon w-6.5 h-6.5"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Insert Divider">
            <button
              onClick={() => format('insertHorizontalRule')}
              className="z-btn-icon w-6.5 h-6.5"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Centered Paper Canvas Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex justify-center relative">
        {/* TOC indicator lines at left of paper (as in screenshot) */}
        <div className="hidden lg:flex flex-col gap-2 absolute left-8 top-12 opacity-40 hover:opacity-100 transition-opacity">
          <div className="w-6 h-[2px] bg-[var(--text-muted)] rounded" />
          <div className="w-10 h-[2px] bg-[var(--text-muted)] rounded" />
          <div className="w-8 h-[2px] bg-[var(--text-muted)] rounded" />
          <div className="w-12 h-[2px] bg-[var(--text-muted)] rounded" />
          <div className="w-5 h-[2px] bg-[var(--text-muted)] rounded" />
        </div>

        {/* Paper Page (max-width 815px, --bg-paper, soft shadow) */}
        <div
          className="paper-page w-full max-w-[815px] min-h-[920px] p-10 md:p-14 relative"
          style={{
            fontFamily: getFontFamilyStyle(),
            fontSize: fontSize,
            lineHeight: 1.75
          }}
        >
          {/* Notebook Header */}
          <div className="mb-6 pb-4 border-b border-[var(--border)] select-none">
            <input
              type="text"
              value={notebook.title}
              onChange={(e) => {
                onUpdateNotebook({ ...notebook, title: e.target.value, updatedAt: Date.now() });
              }}
              className="text-2xl md:text-3xl font-bold tracking-tight bg-transparent text-[var(--text-primary)] w-full focus:outline-none focus:border-b focus:border-[var(--accent)] font-['Inter']"
              placeholder="Untitled Notebook"
            />
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-2">
              <span>Citation: {citationStyle}</span>
              <span>•</span>
              <span>Source: {sourcePdfTitle}</span>
              <span>•</span>
              <span className="font-mono text-[11px]">Type @ for notes, @@ for other tabs</span>
            </div>
          </div>

          {/* Editable Rich Content Area */}
          <div
            ref={editorContentRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onClick={(e) => {
              // Click handler for PDF backlink pills (e.g., "p. 3")
              const target = e.target as HTMLElement;
              const pageAttr = target.getAttribute('data-page');
              if (pageAttr) {
                onJumpToPdfPage(parseInt(pageAttr, 10));
              }
            }}
            className="outline-none min-h-[600px] text-[var(--text-primary)] leading-relaxed space-y-4 font-normal"
          />
        </div>
      </div>

      {/* Mention Dropdown (@ for internal items, @@ for other tabs) */}
      {mentionType && mentionPos && (
        <div
          className="fixed z-50 bg-[var(--bg-toolbar)] border rounded-lg shadow-2xl p-2 w-64 text-xs"
          style={{
            top: `${mentionPos.y}px`,
            left: `${mentionPos.x}px`,
            borderColor: 'var(--border)'
          }}
        >
          <div className="px-2 py-1 font-semibold text-[10px] uppercase text-[var(--text-muted)] tracking-wider">
            {mentionType === 'single' ? 'Link internal note/canvas (@)' : 'Link other open project (@@)'}
          </div>

          {mentionType === 'single' ? (
            <div className="space-y-0.5 mt-1 max-h-48 overflow-y-auto">
              {allNotebooks.map((nb) => (
                <button
                  key={nb.id}
                  onClick={() => {
                    format('insertHTML', `<span class="bg-[var(--accent-soft)] text-[var(--accent)] px-1.5 py-0.5 rounded font-medium text-xs">@${nb.title}</span> `);
                    setMentionType(null);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-[var(--bg-hover)] flex items-center gap-2 truncate"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: nb.colorDot || 'var(--accent)' }} />
                  <span className="truncate">{nb.title}</span>
                </button>
              ))}
              {allCanvases.map((cv) => (
                <button
                  key={cv.id}
                  onClick={() => {
                    format('insertHTML', `<span class="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 px-1.5 py-0.5 rounded font-medium text-xs">@Canvas: ${cv.title}</span> `);
                    setMentionType(null);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-[var(--bg-hover)] flex items-center gap-2 truncate"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="truncate">{cv.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-0.5 mt-1 max-h-48 overflow-y-auto">
              {allTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    format('insertHTML', `<span class="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.5 rounded font-medium text-xs">@@${t.title}</span> `);
                    setMentionType(null);
                    onSwitchTab(t.id);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-[var(--bg-hover)] flex items-center gap-2 truncate"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                  <span className="truncate">{t.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
