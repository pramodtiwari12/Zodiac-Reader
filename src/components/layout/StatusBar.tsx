import React from 'react';
import { ProjectTab } from '../../types';

interface StatusBarProps {
  activeTab: ProjectTab;
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeTab }) => {
  return (
    <footer
      className="h-6 px-3 flex items-center justify-between border-t select-none z-20 shrink-0 text-[11px]"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border)',
        color: 'var(--text-muted)'
      }}
    >
      <div className="flex items-center gap-2 truncate">
        <span className="truncate">{activeTab.filePath || `Workspace / ${activeTab.title}`}</span>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span>Page {activeTab.currentPage} of {activeTab.totalPages}</span>
        <span>{activeTab.type === 'zodiac' ? '.zodiac bundle' : 'Workspace File'}</span>
        <span className="text-[10px] opacity-75">Zodiac Reader by Rizen</span>
      </div>
    </footer>
  );
};
