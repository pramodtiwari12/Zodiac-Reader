import React from 'react';
import {
  House,
  BookOpen,
  NotebookPen,
  Workflow,
  Library,
  Search,
  FolderOpen,
  Info,
  WandSparkles,
  Link as LinkIcon,
  Settings
} from 'lucide-react';
import { ActiveSideTool, UserAccount } from '../../types';
import { Tooltip } from '../common/Tooltip';
import { ZodiacMark } from '../common/ZodiacLogo';

interface IconRailProps {
  activeTool: ActiveSideTool;
  onSelectTool: (tool: ActiveSideTool) => void;
  onOpenInfo: () => void;
  onOpenSettings: () => void;
  user: UserAccount;
  onOpenUserModal: () => void;
}

export const IconRail: React.FC<IconRailProps> = ({
  activeTool,
  onSelectTool,
  onOpenInfo,
  onOpenSettings,
  user,
  onOpenUserModal
}) => {
  const topTools = [
    { id: 'home' as ActiveSideTool, label: 'Home', icon: House, shortcut: 'Alt+H' },
    { id: 'reader' as ActiveSideTool, label: 'PDF Reader', icon: BookOpen, shortcut: 'Alt+R' },
    { id: 'notebooks' as ActiveSideTool, label: 'Notebooks', icon: NotebookPen, shortcut: 'Alt+N' },
    { id: 'canvas' as ActiveSideTool, label: 'Infinite Canvas', icon: Workflow, shortcut: 'Alt+C' },
    { id: 'library' as ActiveSideTool, label: 'Library & Recents', icon: Library, shortcut: 'Alt+L' },
    { id: 'search' as ActiveSideTool, label: 'Search in Project', icon: Search, shortcut: 'Ctrl+K' },
    { id: 'files' as ActiveSideTool, label: 'File Manager', icon: FolderOpen, shortcut: 'Alt+F' },
  ];

  return (
    <aside
      className="w-12 h-[calc(100vh-40px-24px)] flex flex-col items-center justify-between py-2 border-r select-none z-20 shrink-0"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Top Group: Logo Badge + Navigation Icons */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {/* Logo Badge (28x28 in rounded 8px badge) */}
        <Tooltip content="Zodiac Reader (by Rizen)" position="right">
          <button
            onClick={() => onSelectTool('home')}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 mb-1 cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-active)',
              color: 'var(--accent)',
              border: '1px solid var(--border)'
            }}
          >
            <ZodiacMark size={20} />
          </button>
        </Tooltip>

        <div className="w-6 h-[1px] bg-[var(--border)] my-0.5" />

        {/* Navigation Tools */}
        {topTools.map((t) => {
          const isActive = activeTool === t.id;
          const IconComponent = t.icon;

          return (
            <div key={t.id} className="relative w-full flex items-center justify-center">
              {/* 3px Accent indicator bar on left edge */}
              {isActive && (
                <div
                  className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-sm"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}

              <Tooltip content={t.label} shortcut={t.shortcut} position="right">
                <button
                  onClick={() => onSelectTool(t.id)}
                  aria-label={t.label}
                  className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center transition-all duration-150 relative cursor-pointer ${
                    isActive
                      ? 'bg-[var(--bg-active)] text-[var(--accent)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }`}
                  style={{
                    transform: isActive ? 'scale(1.02)' : undefined
                  }}
                >
                  <IconComponent className="w-5 h-5 stroke-[1.75]" />
                </button>
              </Tooltip>
            </div>
          );
        })}
      </div>

      {/* Bottom Group: Info, AI Tools, Links, Settings, User */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {/* Help & Info */}
        <Tooltip content="About & Help" shortcut="Ctrl+Shift+/" position="right">
          <button
            onClick={onOpenInfo}
            className="w-8.5 h-8.5 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
          >
            <Info className="w-5 h-5 stroke-[1.75]" />
          </button>
        </Tooltip>

        {/* AI Tools quick action */}
        <Tooltip content="Zodiac AI Tools" position="right">
          <button
            onClick={() => onSelectTool('ai')}
            className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              activeTool === 'ai'
                ? 'bg-[var(--bg-active)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <WandSparkles className="w-5 h-5 stroke-[1.75]" />
          </button>
        </Tooltip>

        {/* Integrations & Links */}
        <Tooltip content="Integrations & Cross-Links" position="right">
          <button
            onClick={() => onSelectTool('links')}
            className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              activeTool === 'links'
                ? 'bg-[var(--bg-active)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <LinkIcon className="w-5 h-5 stroke-[1.75]" />
          </button>
        </Tooltip>

        {/* Settings */}
        <Tooltip content="Settings" position="right">
          <button
            onClick={onOpenSettings}
            className="w-8.5 h-8.5 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
          >
            <Settings className="w-4.5 h-4.5 stroke-[1.75]" />
          </button>
        </Tooltip>

        <div className="w-6 h-[1px] bg-[var(--border)] my-0.5" />

        {/* User avatar */}
        <Tooltip content={user.email} position="right">
          <button
            onClick={onOpenUserModal}
            className="w-7 h-7 rounded-full ring-1 ring-[var(--border)] overflow-hidden flex items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold hover:ring-[var(--accent)] transition-all cursor-pointer"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user.name ? user.name[0] : 'U'}</span>
            )}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
};
