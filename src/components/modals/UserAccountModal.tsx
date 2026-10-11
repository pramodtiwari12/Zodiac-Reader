import React, { useState } from 'react';
import { X, LogIn, LogOut, User, Mail, ShieldCheck, CheckCircle2, Cloud } from 'lucide-react';
import { UserAccount } from '../../types';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onUpdateUser: (updated: UserAccount) => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser
}) => {
  const [nameInput, setNameInput] = useState(user.name || '');
  const [emailInput, setEmailInput] = useState(user.email || '');

  if (!isOpen) return null;

  const handleSignInGoogle = () => {
    onUpdateUser({
      isSignedIn: true,
      name: nameInput.trim() || 'Pramod Tiwari',
      email: emailInput.trim() || 'pramodtiwari2612@gmail.com',
      avatarUrl: ''
    });
    onClose();
  };

  const handleSignOut = () => {
    onUpdateUser({
      isSignedIn: false,
      name: 'Guest Scholar',
      email: 'local@workspace',
      avatarUrl: ''
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-[440px] max-w-full rounded-xl border shadow-2xl overflow-hidden flex flex-col text-xs"
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
            <User className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">Account & Sync</span>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {user.isSignedIn ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-paper)]">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-lg flex items-center justify-center ring-2 ring-[var(--accent)]">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">{user.name}</h3>
                  <div className="text-xs text-[var(--text-secondary)] font-mono">{user.email}</div>
                  <div className="flex items-center gap-1 text-[11px] text-[var(--success)] mt-0.5 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Google Account Linked</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] text-xs text-[var(--text-secondary)] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                  <Cloud className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Cloud Synchronization Status</span>
                </div>
                <p className="text-[11px]">
                  All open projects, annotations, and .zodiac packages autosave to your device and sync to your cloud workspace.
                </p>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full py-2 px-3 rounded-lg border border-rose-300 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Google Account</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-bold text-sm text-[var(--text-primary)]">Sign in with Google</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Sync projects seamlessly and retain access to Gemini research features.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[var(--text-primary)]">Scholar Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Pramod Tiwari"
                  className="w-full p-2 rounded-lg border bg-[var(--bg-paper)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  style={{ borderColor: 'var(--border)' }}
                />

                <label className="text-[11px] font-semibold text-[var(--text-primary)]">Email Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="pramodtiwari2612@gmail.com"
                  className="w-full p-2 rounded-lg border bg-[var(--bg-paper)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>

              <button
                onClick={handleSignInGoogle}
                className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Continue with Google Sign-In</span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
                <span>Local guest mode is enabled by default</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t flex items-center justify-end bg-[var(--bg-paper)]"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border hover:bg-[var(--bg-hover)]"
            style={{ borderColor: 'var(--border)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
