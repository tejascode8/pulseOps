import React from 'react';
import {
  Activity,
  Plus,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({
  onOpenAddModal,
  onOpenAuthModal,
  onBrandClick,
  onLogout,
}) {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

  const handleLogoClick = () => {
    if (onBrandClick) {
      onBrandClick();
    }
  };

  return (
    <header className="header-wrapper">
      <div
        className="brand-section"
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
        title="pulseOps Dashboard"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand-icon-wrapper" style={{ width: '36px', height: '36px' }}>
            <Activity size={20} color="#ffffff" />
          </div>
          <span
            style={{
              fontSize: '1.35rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}
          >
            pulse<span className="gradient-text-indigo">Ops</span>
          </span>
        </div>
      </div>

      <div className="header-actions">
        {/* Add Project Primary CTA */}
        <button
          className="btn btn-primary"
          onClick={() => {
            onOpenAddModal();
          }}
          id="btn-add-project"
        >
          <Plus size={17} />
          <span>Add Project</span>
        </button>

        {/* Sign Out / Sign In Button on the far right */}
        {isAuthenticated ? (
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleLogout}
            title="Sign Out of pulseOps"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 0.95rem' }}
          >
            <LogOut size={15} />
            <span className="header-signout-text">Sign Out</span>
          </button>
        ) : (
          <button
            className="btn btn-outline-indigo btn-sm btn-pill"
            onClick={() => onOpenAuthModal('login')}
            title="Sign in to pulseOps"
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
