import React, { useState } from 'react';
import { ProjectTab, ThemeMode, UserAccount } from '../../types';
import { Plus, X, Search, Shield, Sun, Moon, Sparkles, Copy, ArrowRightToLine } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';
import { ZodiacMark } from '../common/ZodiacLogo';

interface TopTabStripProps {
  tabs: ProjectTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onDuplicateTab: (id: string) => void;
  onCloseOthers: (id: string) => void;
  onCloseToRight: (id: string) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  user: UserAccount;
  onOpenSearch: () => void;
  onOpenPrivacy: () => void;
  onToggleAi: () => void;
  isAiOpen: boolean;
  onOpenUserModal: () => void;
}

export const TopTabStrip: React.FC<TopTabStripProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onDuplicateTab,
  onCloseOthers,
  onCloseToRight,
  theme,
  onToggleTheme,
  user,
  onOpenSearch,
  onOpenPrivacy,
  onToggleAi,
  isAiOpen,
  onOpenUserModal
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  React.useEffect(() => {
    const handleGlobalClick = () => closeContextMenu();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div
      className="h-10 flex items-center justify-between border-b px-2 select-none relative z-30"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Tabs list */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar h-full pt-1.5 flex-1 max-w-[calc(100%-360px)]">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTabId;
          const badgeColor =
            tab.type === 'home'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
              : tab.type === 'zodiac'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300';

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              onAuxClick={(e) => {
                if (e.button === 1) onCloseTab(tab.id); // Middle-click closes
              }}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              className={`group flex items-center gap-2 px-3 h-8.5 rounded-t-[10px] text-xs font-medium border-t border-x cursor-pointer transition-all duration-150 relative shrink-0 max-w-[210px] ${
                isActive
                  ? 'border-[var(--border)] shadow-xs'
                  : 'border-transparent hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--bg-toolbar)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                marginBottom: isActive ? '-1px' : '0px',
                borderBottomColor: isActive ? 'var(--bg-toolbar)' : 'transparent'
              }}
            >
              {/* Type Badge */}
              <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold tracking-wider uppercase ${badgeColor}`}>
                {tab.type === 'home' ? 'HOME' : tab.type === 'zodiac' ? 'ZODIAC' : 'PDF'}
              </span>

              {/* Title */}
              <span className="truncate flex-1 text-[12px]">{tab.title}</span>

              {/* Unsaved indicator / Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="w-4 h-4 rounded flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                title="Close tab (Middle click / Ctrl+W)"
              >
                {tab.isDirty ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] group-hover:hidden" />
                ) : null}
                <X className={`w-3 h-3 ${tab.isDirty ? 'hidden group-hover:block' : ''}`} />
              </button>
            </div>
          );
        })}

        {/* Plus button to add new Home tab */}
        <Tooltip content="New Tab" shortcut="Ctrl+T" position="bottom">
          <button
            onClick={onNewTab}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all ml-1"
          >
            <Plus className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      {/* Far Right Control Group */}
      <div className="flex items-center gap-1.5 shrink-0 pl-3">
        {/* Global search */}
        <Tooltip content="Search in project" shortcut="Ctrl+K">
          <button onClick={onOpenSearch} className="z-btn-icon w-7 h-7">
            <Search className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Privacy shield */}
        <Tooltip content="Privacy & Local Storage">
          <button onClick={onOpenPrivacy} className="z-btn-icon w-7 h-7">
            <Shield className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Theme toggle */}
        <Tooltip content={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
          <button onClick={onToggleTheme} className="z-btn-icon w-7 h-7">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </Tooltip>

        {/* User Account Avatar */}
        <Tooltip content={user.name || 'Account'} shortcut="Google Sign-In">
          <button
            onClick={onOpenUserModal}
            className="w-6.5 h-6.5 rounded-full ring-1 ring-[var(--border)] overflow-hidden flex items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold hover:ring-[var(--accent)] transition-all ml-0.5"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name ? user.name[0] : 'P'
            )}
          </button>
        </Tooltip>

        {/* Zodiac AI Button */}
        <button
          onClick={onToggleAi}
          className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--ai-from) 0%, var(--ai-to) 100%)',
            color: 'var(--ai-text)',
            boxShadow: '0 2px 8px rgba(217,130,43,0.25)'
          }}
          title="Zodiac AI (Ctrl+Shift+A)"
        >
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 fill-current" />
          </div>
          <span>Zodiac AI</span>
        </button>
      </div>

      {/* Tab Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 py-1 rounded-lg shadow-xl border text-xs min-w-[150px]"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'var(--bg-toolbar)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              onDuplicateTab(contextMenu.tabId);
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-hover)] flex items-center gap-2"
          >
            <Copy className="w-3.5 h-3.5 opacity-70" />
            <span>Duplicate Tab</span>
          </button>
          <button
            onClick={() => {
              onCloseOthers(contextMenu.tabId);
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-hover)] flex items-center gap-2"
          >
            <X className="w-3.5 h-3.5 opacity-70" />
            <span>Close Other Tabs</span>
          </button>
          <button
            onClick={() => {
              onCloseToRight(contextMenu.tabId);
              closeContextMenu();
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-hover)] flex items-center gap-2"
          >
            <ArrowRightToLine className="w-3.5 h-3.5 opacity-70" />
            <span>Close to the Right</span>
          </button>
        </div>
      )}
    </div>
  );
};
