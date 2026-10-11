import React from 'react';
import { X, Settings, Moon, Sun, Monitor, Trash2, Key, Sliders, Type } from 'lucide-react';
import { AppSettings, ThemeMode } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClearLocalData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearLocalData
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-[500px] max-w-full rounded-xl border shadow-2xl overflow-hidden flex flex-col text-xs"
        style={{
          backgroundColor: 'var(--bg-toolbar)',
          borderColor: 'var(--border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="h-11 px-4 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">Settings</span>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Theme Option */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[var(--text-primary)]">Interface Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light' as ThemeMode, label: 'Light', icon: Sun },
                { id: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
                { id: 'system' as ThemeMode, label: 'System', icon: Monitor }
              ].map((t) => {
                const Icon = t.icon;
                const active = settings.theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onUpdateSettings({ ...settings, theme: t.id })}
                    className={`p-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      active
                        ? 'border-[var(--accent)] bg-[var(--bg-active)] text-[var(--accent)] font-semibold'
                        : 'border-[var(--border)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notebook Font */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[var(--text-primary)]">Default Notebook Typography</label>
            <select
              value={settings.notebookFont}
              onChange={(e) => onUpdateSettings({ ...settings, notebookFont: e.target.value as any })}
              className="w-full p-2 rounded-lg border bg-[var(--bg-paper)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              style={{ borderColor: 'var(--border)' }}
            >
              <option value="sans">Inter (Modern Sans-serif)</option>
              <option value="serif">Source Serif 4 (Academic Paper Serif)</option>
              <option value="mono">JetBrains Mono (Monospace / Code)</option>
            </select>
          </div>

          {/* Autosave Interval */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[var(--text-primary)]">Autosave Frequency</label>
            <div className="flex items-center gap-2">
              {[
                { sec: 2, label: 'Every 2 seconds (Instant)' },
                { sec: 5, label: 'Every 5 seconds' },
                { sec: 10, label: 'Every 10 seconds' }
              ].map((item) => (
                <button
                  key={item.sec}
                  onClick={() => onUpdateSettings({ ...settings, autosaveInterval: item.sec })}
                  className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                    settings.autosaveInterval === item.sec
                      ? 'border-[var(--accent)] bg-[var(--bg-active)] text-[var(--accent)] font-semibold'
                      : 'border-[var(--border)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Default Highlight Color */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[var(--text-primary)]">Default PDF Highlighter Color</label>
            <div className="flex items-center gap-2">
              {[
                { name: 'Amber Yellow', code: '#FFE066' },
                { name: 'Mint Green', code: '#8FE3A8' },
                { name: 'Rose Pink', code: '#FFB3C7' },
                { name: 'Sky Blue', code: '#9CC9FF' }
              ].map((c) => (
                <button
                  key={c.code}
                  onClick={() => onUpdateSettings({ ...settings, defaultHighlightColor: c.code })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    settings.defaultHighlightColor === c.code
                      ? 'ring-2 ring-[var(--accent)] font-medium'
                      : 'hover:opacity-80'
                  }`}
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-paper)' }}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.code }} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gemini API Key Override */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[var(--text-primary)] flex items-center justify-between">
              <span>Google Gemini API Key (Optional Override)</span>
              <span className="text-[10px] text-[var(--text-muted)] font-normal">Environment key active by default</span>
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="AIzaSy... (leave blank to use system key)"
                value={settings.geminiApiKeyOverride}
                onChange={(e) => onUpdateSettings({ ...settings, geminiApiKeyOverride: e.target.value })}
                className="w-full p-2 rounded-lg border font-mono text-xs bg-[var(--bg-paper)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
          </div>

          {/* Danger zone: Clear local data */}
          <div
            className="p-3 rounded-lg border border-rose-200 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/20 flex items-center justify-between text-xs"
          >
            <div>
              <div className="font-semibold text-rose-700 dark:text-rose-400">Clear Local Workspaces</div>
              <div className="text-[11px] text-rose-600/80">Deletes all cached tabs & resets sample files</div>
            </div>
            <button
              onClick={onClearLocalData}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t flex items-center justify-end bg-[var(--bg-paper)]"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
