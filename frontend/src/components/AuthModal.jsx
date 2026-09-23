import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }) {
  const { login, register } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Sync mode with initialMode and reset status on modal open
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  // Freeze background scrolling & handle Escape key
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

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // 0 to 5
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Sovereign Grade'];
  const strengthColors = ['#f43f5e', '#fb7185', '#f59e0b', '#38bdf8', '#34d399', '#10b981'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name or nickname');
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        await register(name.trim(), email.trim(), password);
        setSuccessMsg('Account created & sovereign vault primed!');
      } else {
        await login(email.trim(), password);
        setSuccessMsg('Welcome back!');
      }

      setTimeout(() => {
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 350);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '460px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              className="brand-icon-wrapper"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
              }}
            >
              {mode === 'login' ? <KeyRound size={20} color="#ffffff" /> : <ShieldCheck size={20} color="#ffffff" />}
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.25rem', letterSpacing: '-0.02em', margin: 0 }}>
                {mode === 'login' ? 'Sign In to pulseOps' : 'Create an Account'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                {mode === 'login'
                  ? 'Access your private dashboard & projects'
                  : 'Keep your portfolio apps hot and ready 24/7'}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Close modal" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Notification alerts */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: 'var(--rose-primary)',
              fontSize: '0.84rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: 'var(--emerald-light)',
              fontSize: '0.84rem',
              marginBottom: '1.25rem',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Name field (for Signup) */}
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">
                Full Name or Handle
              </label>
              <div className="quick-add-input-group">
                <UserIcon size={16} color="var(--text-muted)" />
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  className="quick-add-input"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus={mode === 'signup'}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              Email Address
            </label>
            <div className="quick-add-input-group">
              <Mail size={16} color="var(--text-muted)" />
              <input
                id="auth-email"
                name="email"
                type="email"
                className="quick-add-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus={mode === 'login'}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
              <label className="form-label" htmlFor="auth-password" style={{ marginBottom: 0 }}>
                Password
              </label>
              {mode === 'signup' && password && (
                <span style={{ fontSize: '0.72rem', color: strengthColors[strength], fontWeight: 700 }}>
                  {strengthLabels[strength]}
                </span>
              )}
            </div>
            <div className="quick-add-input-group">
              <Lock size={16} color="var(--text-muted)" />
              <input
                id="auth-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="quick-add-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.2rem',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength bar */}
            {mode === 'signup' && password && (
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginTop: '0.4rem',
                  height: '4px',
                }}
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      borderRadius: '2px',
                      background: level <= strength ? strengthColors[strength] : 'rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.85rem',
              marginTop: '0.35rem',
              fontSize: '0.94rem',
              fontWeight: 700,
              gap: '0.5rem',
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spin-icon" />
                <span>Authenticating...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <span>Sign In to Vault</span>
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Create Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Bottom Switcher */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
          }}
        >
          {mode === 'login' ? (
            <p style={{ margin: 0 }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--indigo-light, #6366f1)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#818cf8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--indigo-light, #6366f1)')}
              >
                Create one
              </button>
            </p>
          ) : (
            <p style={{ margin: 0 }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--indigo-light, #6366f1)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#818cf8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--indigo-light, #6366f1)')}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
