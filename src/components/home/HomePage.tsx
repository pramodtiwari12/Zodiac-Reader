import React, { useRef, useState } from 'react';
import {
  Upload,
  FileCode,
  BookOpen,
  Workflow,
  NotebookPen,
  MoreVertical,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Mail,
  Trash2,
  Download
} from 'lucide-react';
import { ProjectTab, UserAccount } from '../../types';
import { ZodiacLogo } from '../common/ZodiacLogo';
import { Tooltip } from '../common/Tooltip';

interface HomePageProps {
  onOpenPdfFile: (file: File) => void;
  onOpenZodiacFile: (file: File) => void;
  recentProjects: ProjectTab[];
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onExportProject: (project: ProjectTab) => void;
  user: UserAccount;
  onOpenUserModal: () => void;
  onOpenContactModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenPdfFile,
  onOpenZodiacFile,
  recentProjects,
  onSelectProject,
  onDeleteProject,
  onExportProject,
  user,
  onOpenUserModal,
  onOpenContactModal
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const zodiacInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zodiac')) {
        onOpenZodiacFile(file);
      } else {
        onOpenPdfFile(file);
      }
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto flex flex-col justify-between p-8 select-none"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between pt-2">
          <ZodiacLogo size={36} showWordmark={true} />
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenContactModal}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Rizen</span>
            </button>
            <button
              onClick={onOpenUserModal}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{user.name ? user.name : 'Sign In'}</span>
            </button>
          </div>
        </div>

        {/* Hero Card / Dropzone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all duration-200 ${
            isDragging
              ? 'border-[var(--accent)] bg-[var(--bg-active)]/40 scale-[1.01]'
              : 'border-[var(--border)] bg-[var(--bg-paper)] hover:border-neutral-400 dark:hover:border-neutral-600'
          }`}
          style={{ boxShadow: 'var(--shadow)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-4 shadow-xs">
            <Upload className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] font-['Inter']">
            Drop a PDF or a .zodiac file here
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mt-1 mb-6">
            Upload any academic paper, lecture, or monograph. Or restore your saved project bundle with linked notebooks, LaTeX, and infinite node canvases.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => pdfInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#ffffff'
              }}
            >
              <FileText className="w-4 h-4" />
              <span>Upload PDF</span>
            </button>

            <button
              onClick={() => zodiacInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all hover:bg-[var(--bg-hover)] active:scale-95 cursor-pointer"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg-toolbar)',
                color: 'var(--text-primary)'
              }}
            >
              <FileCode className="w-4 h-4 text-purple-600" />
              <span>Open .zodiac file</span>
            </button>

            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) onOpenPdfFile(e.target.files[0]);
              }}
            />
            <input
              ref={zodiacInputRef}
              type="file"
              accept=".zodiac,application/zip"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) onOpenZodiacFile(e.target.files[0]);
              }}
            />
          </div>
        </div>

        {/* Recent Workspaces / Projects Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-[var(--text-secondary)] uppercase">
              Recent Projects & Workspaces
            </h3>
            <span className="text-xs text-[var(--text-muted)]">
              Stored locally with autosave
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProjects.map((proj) => {
              return (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className="group relative border rounded-xl p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between"
                  style={{
                    backgroundColor: 'var(--bg-paper)',
                    borderColor: 'var(--border)',
                    boxShadow: 'var(--shadow)'
                  }}
                  onMouseEnter={() => {}}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[var(--accent-soft)] text-[var(--accent)] font-semibold text-xs border border-[var(--border)]">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate max-w-[240px]">
                          {proj.title}
                        </h4>
                        <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Last edited recently</span>
                        </div>
                      </div>
                    </div>

                    {/* Three dots menu */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === proj.id ? null : proj.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === proj.id && (
                        <div
                          className="absolute right-0 top-8 z-50 bg-[var(--bg-toolbar)] border rounded-lg shadow-xl py-1 min-w-[130px] text-xs"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <button
                            onClick={() => {
                              onSelectProject(proj.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-hover)] flex items-center gap-2"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Open</span>
                          </button>
                          <button
                            onClick={() => {
                              onExportProject(proj);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-hover)] flex items-center gap-2"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export .zodiac</span>
                          </button>
                          <button
                            onClick={() => {
                              onDeleteProject(proj.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className="flex items-center gap-3 pt-3 mt-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1">
                      <NotebookPen className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>{proj.notebooks.length} Notebooks</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Workflow className="w-3.5 h-3.5 text-orange-500" />
                      <span>{proj.canvases.length} Canvas</span>
                    </span>
                    <span className="flex items-center gap-1 ml-auto text-[11px] font-mono opacity-80">
                      {proj.totalPages} pages
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-8 pb-2 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)] mt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--text-primary)]">Zodiac</span>
          <span>by Rizen</span>
          <span>•</span>
          <a
            href="mailto:pramodtiwari2612@gmail.com"
            className="hover:underline text-[var(--accent)]"
          >
            pramodtiwari2612@gmail.com
          </a>
        </div>
        <div className="flex items-center gap-4">
          <span>Version 1.0.0</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
            <span>Local Offline Ready</span>
          </span>
        </div>
      </footer>
    </div>
  );
};
