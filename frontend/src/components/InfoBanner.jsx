import React from 'react';
import { Info, AlertCircle, X, ExternalLink, ShieldAlert } from 'lucide-react';

export default function InfoBanner({ popupBlocked, onDismissPopupWarning }) {
  if (!popupBlocked) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        padding: '1rem 1.25rem',
        background: 'rgba(244, 63, 94, 0.1)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '1.5rem',
      }}
    >
      <ShieldAlert size={20} color="var(--rose-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1, fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--rose-primary)', display: 'block', marginBottom: '0.2rem' }}>
          Browser Blocked Automatic Popups / New Tabs
        </strong>
        Your browser prevented pulseOps from automatically opening new tabs. To enable auto-opening, click the popup blocker icon in your browser address bar and select <strong>"Always allow popups from this site"</strong>.
      </div>
      <button
        className="btn btn-ghost btn-icon"
        onClick={onDismissPopupWarning}
        style={{ padding: '4px', width: '28px', height: '28px', color: 'var(--text-muted)' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
