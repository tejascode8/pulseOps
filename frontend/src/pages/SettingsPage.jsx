import React, { useState } from 'react';
import {
  Settings,
  Database,
  ShieldCheck,
  Download,
  Upload,
  Trash2,
  LogOut,
  UserPlus,
  Server,
  Copy,
  Check,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Layers,
  FileJson,
} from 'lucide-react';
import { exportProjectsJson } from '../utils/storage';
import { checkBackendHealth } from '../utils/api';

export default function SettingsPage({
  user,
  isAuthenticated,
  projects = [],
  logs = [],
  dbStatus = 'offline',
  onOpenAuthModal,
  onOpenImportExport,
  onClearAll,
  onClearLogs,
  onLogout,
}) {
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Download portable JSON backup
  const handleDownloadBackup = () => {
    exportProjectsJson(projects);
    showToast(`Exported vault backup (${projects.length} projects)`);
  };

  // Copy raw JSON to clipboard
  const handleCopyRawJson = async () => {
    try {
      const dataStr = JSON.stringify(projects, null, 2);
      await navigator.clipboard.writeText(dataStr);
      setCopiedRaw(true);
      showToast('Copied JSON vault configuration to clipboard');
      setTimeout(() => setCopiedRaw(false), 2000);
    } catch {
      // Ignore clipboard error silently
    }
  };

  // Run live database & API diagnostics test
  const handleRunDiagnostics = async () => {
    setDiagnosticsRunning(true);
    const startTime = Date.now();

    try {
      const res = await checkBackendHealth();
      const latency = Date.now() - startTime;
      setDiagnosticResult({
        success: true,
        latency,
        database: res.database || 'connected',
        timestamp: new Date().toLocaleTimeString(),
        message: 'MongoDB Atlas & API cluster responding with nominal latency',
      });
    } catch (err) {
      const latency = Date.now() - startTime;
      setDiagnosticResult({
        success: false,
        latency,
        database: 'offline',
        timestamp: new Date().toLocaleTimeString(),
        message: err.message || 'Unable to establish network handshake with API backend',
      });
    } finally {
      setDiagnosticsRunning(false);
    }
  };

  return (
    <div className="page-container page-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: 'var(--indigo-primary)',
            color: '#ffffff',
            padding: '0.85rem 1.35rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-indigo)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 600,
            fontSize: '0.88rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.06) 50%, rgba(255, 255, 255, 0.95) 100%)',
          borderColor: 'rgba(245, 158, 11, 0.22)',
          padding: '1.4rem 1.65rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 4px 20px -2px rgba(245, 158, 11, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            className="brand-icon-wrapper"
            style={{
              width: '46px',
              height: '46px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '14px',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Settings size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>
              System Settings & Encrypted Vault
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Manage user sessions, MongoDB Atlas cloud synchronization, and JSON backup archives.
            </p>
          </div>
        </div>
      </div>

      {/* Clean Telemetry Stats Bar (3-Grid) */}
      <div className="settings-stats-grid">
        <div className="schedule-stat-card">
          <div className="schedule-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald-light)' }}>
            <Database size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {dbStatus === 'connected' ? 'Atlas Connected' : 'Offline / Standby'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              MongoDB Cloud Sync
            </div>
          </div>
        </div>

        <div className="schedule-stat-card">
          <div className="schedule-stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--indigo-light)' }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--indigo-light)', lineHeight: 1.1 }}>
              {projects.length} Monitored
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Vault Project Rules
            </div>
          </div>
        </div>

        <div className="schedule-stat-card">
          <div className="schedule-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan-primary)' }}>
            <Server size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--cyan-primary)', lineHeight: 1.1 }}>
              {logs.length} Log Entries
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Telemetry Audit History
            </div>
          </div>
        </div>
      </div>

      {/* Primary Configuration Cards Grid (3 Cards) */}
      <div className="settings-cards-grid">
        {/* Card 1: User Account & Authentication */}
        <div className="settings-card">
          <div className="settings-card-header" style={{ color: 'var(--emerald-light)' }}>
            <ShieldCheck size={20} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              User Account & Identity
            </h3>
          </div>

          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: user?.avatar || 'var(--gradient-brand)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    boxShadow: 'var(--shadow-indigo)',
                    flexShrink: 0,
                  }}
                >
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--text-primary)' }}>
                    {user?.name || 'Authorized User'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {user?.email || 'user@pulseops.internal'}
                  </div>
                </div>
              </div>

              {/* Account Meta Badges */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.65rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Tenant Partition:</span>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {user?.id ? `usr_${String(user.id).slice(-6)}` : 'Private Partition'}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Session Security:</span>
                  <div style={{ fontWeight: 700, color: 'var(--emerald-light)' }}>
                    Bearer Token Verified
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Active authenticated session
                </span>
                <button className="btn btn-secondary btn-sm" onClick={onLogout} style={{ fontWeight: 600 }}>
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Sign in or register to sync your keepalive schedules to your private MongoDB Atlas cluster across devices.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={() => onOpenAuthModal('signup')}>
                  <UserPlus size={14} />
                  <span>Create Account</span>
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => onOpenAuthModal('login')}>
                  <span>Sign In</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: MongoDB Atlas Database Diagnostics */}
        <div className="settings-card">
          <div className="settings-card-header" style={{ color: 'var(--indigo-light)' }}>
            <Database size={20} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              MongoDB Atlas & API Diagnostics
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Connection Status:</span>
              <span
                style={{
                  color: dbStatus === 'connected' ? 'var(--emerald-light)' : 'var(--amber-primary)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {dbStatus === 'connected' ? (
                  <>
                    <CheckCircle2 size={14} color="var(--emerald-light)" />
                    <span>Connected & Syncing</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} color="var(--amber-primary)" />
                    <span>Offline / Standby</span>
                  </>
                )}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Database Cluster:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>
                pulseOps (Atlas Production)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Storage Fallback:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '0.80rem' }}>
                LocalStorage Indexed Cache
              </span>
            </div>

            {/* Diagnostic Result Box */}
            {diagnosticResult && (
              <div
                style={{
                  background: diagnosticResult.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                  border: `1px solid ${diagnosticResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.55rem 0.8rem',
                  fontSize: '0.78rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: diagnosticResult.success ? 'var(--emerald-light)' : 'var(--rose-primary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {diagnosticResult.success ? <Check size={13} /> : <AlertTriangle size={13} />}
                    {diagnosticResult.success ? 'Diagnostics Passed' : 'Connection Failed'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Timer size={12} color="var(--cyan-primary)" /> {diagnosticResult.latency}ms
                  </span>
                </div>
                <span style={{ color: 'var(--text-secondary)' }}>{diagnosticResult.message}</span>
              </div>
            )}

            <div style={{ paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleRunDiagnostics}
                disabled={diagnosticsRunning}
                title="Perform round-trip network probe to verify MongoDB and API health"
                style={{ fontWeight: 600 }}
              >
                <RefreshCw size={13} className={diagnosticsRunning ? 'spin' : ''} />
                <span>{diagnosticsRunning ? 'Running Health Check...' : 'Run Diagnostics'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Vault Backup & Restore Tools */}
        <div className="settings-card">
          <div className="settings-card-header" style={{ color: 'var(--indigo-light)' }}>
            <FileJson size={20} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Backup & Vault Portability
            </h3>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
            Export all project schedules, intervals, and endpoints as a portable JSON backup file, or restore configurations via the Vault Inspector.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenImportExport}
              title="Open full backup & restore modal"
              style={{ fontWeight: 700 }}
            >
              <Upload size={13} />
              <span>Backup & Restore Vault</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleDownloadBackup}
              disabled={projects.length === 0}
              title="Download portable JSON backup file directly"
              style={{ fontWeight: 600 }}
            >
              <Download size={13} />
              <span>Download JSON</span>
            </button>

            <button
              className="btn btn-ghost btn-sm"
              onClick={handleCopyRawJson}
              disabled={projects.length === 0}
              title="Copy raw JSON configuration to clipboard"
              style={{ fontWeight: 600 }}
            >
              {copiedRaw ? <Check size={13} color="var(--emerald-light)" /> : <Copy size={13} />}
              <span>{copiedRaw ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Fully portable JSON format compatible across all pulseOps instances.
          </div>
        </div>
      </div>

      {/* FULL WIDTH DANGER ZONE (NO BOX LOOK) */}
      <div className="settings-danger-zone">
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <AlertTriangle size={18} color="var(--rose-primary)" />
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--rose-primary)', margin: 0 }}>
              Danger Zone
            </h3>
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
            Irreversibly delete monitored project configurations or wipe activity telemetry logs from database and local storage.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{
              borderColor: 'rgba(244, 63, 94, 0.4)',
              color: 'var(--rose-primary)',
              fontWeight: 700,
              padding: '0.5rem 1rem',
            }}
            onClick={onClearAll}
            disabled={projects.length === 0}
            title="Permanently remove all monitored projects"
          >
            <Trash2 size={14} />
            <span>Clear All Projects ({projects.length})</span>
          </button>

          {onClearLogs && (
            <button
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: 'rgba(244, 63, 94, 0.4)',
                color: 'var(--rose-primary)',
                fontWeight: 700,
                padding: '0.5rem 1rem',
              }}
              onClick={onClearLogs}
              disabled={logs.length === 0}
              title="Purge all telemetry logs"
            >
              <Trash2 size={14} />
              <span>Purge Activity Stream ({logs.length})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
