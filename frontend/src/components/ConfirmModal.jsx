import React, { useEffect } from 'react';
import {
  AlertTriangle,
  X,
  Trash2,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Play,
  ExternalLink,
  Power,
  Pause,
} from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger', // 'danger' | 'primary' | 'warning'
  onConfirm,
  onClose,
}) {
  // Freeze background scrolling & listen for Escape key when modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const labelLower = (confirmLabel || '').toLowerCase();
  const isSignOut = labelLower.includes('sign out') || labelLower.includes('logout');
  const isPing = labelLower.includes('ping');
  const isOpenAll = labelLower.includes('open all') || labelLower.includes('launch');
  const isEnableAll = labelLower.includes('enable');
  const isPauseAll = labelLower.includes('pause') || labelLower.includes('disable');
  const isDanger = confirmVariant === 'danger' || (!isSignOut && !isPing && !isOpenAll && !isEnableAll && !isPauseAll && (labelLower.includes('delete') || labelLower.includes('clear') || labelLower.includes('purge') || labelLower.includes('wipe')));
  const isWarning = confirmVariant === 'warning' || isPauseAll;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card page-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h3
            className="modal-title"
            style={{
              color: isDanger
                ? 'var(--rose-primary)'
                : isWarning
                ? 'var(--amber-primary)'
                : isPing
                ? 'var(--cyan-primary)'
                : 'var(--indigo-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              fontSize: '1.1rem',
              fontWeight: 800,
            }}
          >
            {isSignOut ? (
              <LogOut size={20} color="var(--indigo-light)" />
            ) : isPing ? (
              <Play size={20} fill="currentColor" color="var(--cyan-primary)" />
            ) : isOpenAll ? (
              <ExternalLink size={20} color="var(--indigo-light)" />
            ) : isEnableAll ? (
              <CheckCircle2 size={20} color="var(--emerald-light)" />
            ) : isPauseAll ? (
              <Pause size={20} color="var(--amber-primary)" />
            ) : isDanger ? (
              <AlertTriangle size={20} color="var(--rose-primary)" />
            ) : (
              <AlertCircle size={20} color="var(--indigo-light)" />
            )}
            <span>{title}</span>
          </h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.5rem' }}>
          {message}
        </p>

        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} style={{ fontWeight: 600 }}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{
              background: isDanger
                ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
                : isWarning
                ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                : 'var(--gradient-brand)',
              boxShadow: isDanger
                ? '0 4px 14px rgba(244, 63, 94, 0.4)'
                : isWarning
                ? '0 4px 14px rgba(217, 119, 6, 0.35)'
                : 'var(--shadow-indigo)',
              color: '#ffffff',
              fontWeight: 700,
            }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {isSignOut ? (
              <LogOut size={15} />
            ) : isPing ? (
              <Play size={15} fill="currentColor" />
            ) : isOpenAll ? (
              <ExternalLink size={15} />
            ) : isEnableAll ? (
              <Power size={15} />
            ) : isPauseAll ? (
              <Pause size={15} />
            ) : isDanger ? (
              <Trash2 size={15} />
            ) : (
              <CheckCircle2 size={15} />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
