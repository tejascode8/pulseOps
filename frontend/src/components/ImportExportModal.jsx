import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Database,
  Layers,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { exportProjectsJson } from '../utils/storage';

export default function ImportExportModal({
  isOpen,
  onClose,
  projects = [],
  onImport,
}) {
  const [activeTab, setActiveTab] = useState('export'); // 'export' | 'import'
  const [jsonText, setJsonText] = useState('');
  const [importStrategy, setImportStrategy] = useState('merge'); // 'merge' | 'replace'
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isImporting, setIsImporting] = useState(false);

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

  // Reset internal states on open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setIsImporting(false);
    }
  }, [isOpen]);

  // Real-time JSON validation & project extraction
  const parsedPreview = useMemo(() => {
    if (!jsonText.trim()) return { valid: false, items: [], error: null };
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        return { valid: false, items: [], error: 'Root payload must be an array of project objects' };
      }
      const validItems = parsed.filter((p) => p && typeof p === 'object' && p.name && p.url);
      if (validItems.length === 0) {
        return { valid: false, items: [], error: 'No valid projects found (each must contain "name" and "url")' };
      }
      return { valid: true, items: validItems, error: null };
    } catch (err) {
      return { valid: false, items: [], error: 'Invalid JSON syntax' };
    }
  }, [jsonText]);

  if (!isOpen) return null;

  // Format active projects for export preview
  const formattedExportJson = JSON.stringify(projects, null, 2);
  const payloadSizeBytes = new Blob([formattedExportJson]).size;
  const payloadSizeKb = (payloadSizeBytes / 1024).toFixed(1);

  const handleExport = () => {
    exportProjectsJson(projects);
  };

  const handleCopyExportJson = async () => {
    try {
      await navigator.clipboard.writeText(formattedExportJson);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2200);
    } catch {
      // Ignore clipboard error silently
    }
  };

  const handleFileProcess = (file) => {
    if (!file) return;
    setErrorMsg('');
    setSuccessMsg('');
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          setJsonText(JSON.stringify(parsed, null, 2));
        } else {
          setErrorMsg('Invalid format: Expected a JSON array of project configurations.');
        }
      } catch (err) {
        setErrorMsg('Failed to parse file as JSON syntax.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleImportSubmit = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!parsedPreview.valid || parsedPreview.items.length === 0) {
      setErrorMsg(parsedPreview.error || 'Please paste valid JSON data or upload a backup file.');
      return;
    }

    setIsImporting(true);
    try {
      const success = await onImport(parsedPreview.items, importStrategy);
      if (success) {
        setSuccessMsg(
          importStrategy === 'merge'
            ? `Successfully merged ${parsedPreview.items.length} projects into your fleet!`
            : `Successfully replaced fleet with ${parsedPreview.items.length} imported projects!`
        );
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg('Import failed: Check your project schema and try again.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during restore.');
    } finally {
      setIsImporting(false);
    }
  };

  const enabledProjectsCount = projects.filter((p) => p.enabled).length;
  const scheduledProjectsCount = projects.filter((p) => p.scheduleMode && p.scheduleMode !== 'always').length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card page-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '640px',
          padding: '1.75rem 2rem',
        }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ marginBottom: '1.25rem', paddingBottom: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'var(--gradient-brand)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Database size={18} />
              </div>
              <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Backup & Restore Projects
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0', lineHeight: 1.45 }}>
              Enterprise data portability: Export portable JSON backups or restore fleet endpoints across environments.
            </p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Top Segmented Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px',
            marginBottom: '1.4rem',
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'export' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              flex: 1,
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
            onClick={() => setActiveTab('export')}
          >
            <Download size={14} />
            <span>Export Fleet Vault</span>
            <span
              style={{
                fontSize: '0.72rem',
                opacity: activeTab === 'export' ? 0.9 : 0.65,
                background: activeTab === 'export' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              {projects.length}
            </span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'import' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              flex: 1,
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
            }}
            onClick={() => setActiveTab('import')}
          >
            <Upload size={14} />
            <span>Import & Restore</span>
            {parsedPreview.valid && (
              <span
                style={{
                  fontSize: '0.72rem',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: activeTab === 'import' ? '#ffffff' : 'var(--emerald-light)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {parsedPreview.items.length} Ready
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: EXPORT FLEET VAULT */}
        {activeTab === 'export' && (
          <div className="page-fade-in">
            {/* Vault Metrics Grid */}
            <div className="modal-metrics-4grid">
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.85rem',
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--indigo-light)', lineHeight: 1 }}>
                  {projects.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem' }}>
                  Total Targets
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.85rem',
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-light)', lineHeight: 1 }}>
                  {enabledProjectsCount}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem' }}>
                  Active Keepalives
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.85rem',
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--amber-primary)', lineHeight: 1 }}>
                  {scheduledProjectsCount}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem' }}>
                  Scheduled Rules
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.85rem',
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--cyan-primary)', lineHeight: 1 }}>
                  {payloadSizeKb} KB
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem' }}>
                  Payload Size
                </div>
              </div>
            </div>

            {/* Quick Export Actions */}
            <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleExport}
                disabled={projects.length === 0}
                style={{ flex: '1 1 200px', justifyContent: 'center' }}
              >
                <Download size={15} />
                <span>Download Vault JSON (.json)</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCopyExportJson}
                disabled={projects.length === 0}
                style={{ flex: '1 1 160px', justifyContent: 'center', fontWeight: 600 }}
              >
                {copiedRaw ? <Check size={15} color="var(--emerald-light)" /> : <Copy size={15} />}
                <span>{copiedRaw ? 'Copied to Clipboard!' : 'Copy Raw Payload'}</span>
              </button>
            </div>

            {/* Read-only Live JSON Terminal Viewer */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#090d16',
                  borderTopLeftRadius: 'var(--radius-md)',
                  borderTopRightRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.85rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderBottom: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ff5f56' }} />
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ffbd2e' }} />
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#27c93f' }} />
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'rgba(255, 255, 255, 0.45)',
                      marginLeft: '0.35rem',
                    }}
                  >
                    pulseops-vault-export.json
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--cyan-primary)',
                  }}
                >
                  {projects.length} targets configured
                </span>
              </div>

              <pre
                className="cli-terminal-scroll vault-cli-code"
                style={{
                  background: '#040711',
                  color: '#94a3b8',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.76rem',
                  lineHeight: 1.45,
                  padding: '0.85rem 1rem',
                  margin: 0,
                  borderBottomLeftRadius: 'var(--radius-md)',
                  borderBottomRightRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  overflowX: 'auto',
                }}
              >
                {projects.length > 0
                  ? formattedExportJson
                  : '// No monitored projects in vault yet. Add targets to export.'}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: IMPORT & RESTORE */}
        {activeTab === 'import' && (
          <div className="page-fade-in">
            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: isDragging
                  ? '2px dashed var(--indigo-primary)'
                  : '2px dashed var(--border-subtle)',
                background: isDragging
                  ? 'rgba(79, 70, 229, 0.06)'
                  : 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.15rem 1rem',
                textAlign: 'center',
                marginBottom: '1rem',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--indigo-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Upload size={18} />
                </div>
                <div>
                  <label
                    style={{
                      color: 'var(--indigo-light)',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Click to browse files
                    <input
                      id="vault-file-import"
                      name="vaultFileInput"
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>
                    or drag & drop backup .json here
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {uploadedFileName ? (
                    <span style={{ color: 'var(--emerald-light)', fontWeight: 600 }}>
                      Loaded: {uploadedFileName}
                    </span>
                  ) : (
                    'Compatible with pulseOps JSON vault exports'
                  )}
                </div>
              </div>
            </div>

            {/* Import Strategy Switcher (Merge vs Replace) */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Restore Strategy:
              </div>
              <div className="modal-grid-2col">
                <div
                  onClick={() => setImportStrategy('merge')}
                  style={{
                    border: importStrategy === 'merge' ? '1.5px solid var(--indigo-primary)' : '1px solid var(--border-subtle)',
                    background: importStrategy === 'merge' ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.84rem', color: importStrategy === 'merge' ? 'var(--indigo-light)' : 'var(--text-primary)' }}>
                    <Layers size={14} />
                    <span>Merge & Append</span>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.35 }}>
                    Adds new targets and updates existing endpoints without wiping fleet.
                  </div>
                </div>

                <div
                  onClick={() => setImportStrategy('replace')}
                  style={{
                    border: importStrategy === 'replace' ? '1.5px solid var(--amber-primary)' : '1px solid var(--border-subtle)',
                    background: importStrategy === 'replace' ? 'rgba(217, 119, 6, 0.05)' : 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.84rem', color: importStrategy === 'replace' ? 'var(--amber-primary)' : 'var(--text-primary)' }}>
                    <RefreshCw size={14} />
                    <span>Full Overwrite</span>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.35 }}>
                    Wipes current fleet and replaces with the imported dataset.
                  </div>
                </div>
              </div>
            </div>

            {/* JSON Code Input & Schema Validator Status */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Raw JSON Configuration:
                </span>
                {parsedPreview.valid ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--emerald-light)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={13} />
                    Valid Schema ({parsedPreview.items.length} targets detected)
                  </span>
                ) : jsonText.trim() ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--rose-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={13} />
                    {parsedPreview.error}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Paste JSON array or upload file
                  </span>
                )}
              </div>

              <textarea
                id="vault-json-textarea"
                name="vaultJsonText"
                className="form-input cli-terminal-scroll vault-cli-editor"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  height: '130px',
                  minHeight: '100px',
                  resize: 'vertical',
                  background: '#040711',
                  color: '#94a3b8',
                  lineHeight: 1.45,
                  padding: '0.75rem 0.95rem',
                  border: parsedPreview.valid
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : jsonText.trim()
                    ? '1px solid rgba(244, 63, 94, 0.4)'
                    : '1px solid var(--border-subtle)',
                }}
                placeholder='[&#10;  {&#10;    "name": "Production API",&#10;    "url": "https://api.my-service.onrender.com/health",&#10;    "interval": 10&#10;  }&#10;]'
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setErrorMsg('');
                }}
              />

              {/* Detected Projects Mini-Chips Strip */}
              {parsedPreview.valid && (
                <div
                  style={{
                    marginTop: '0.65rem',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--emerald-light)' }}>
                    Preview:
                  </span>
                  {parsedPreview.items.slice(0, 6).map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {item.name} ({item.interval || 10}m)
                    </span>
                  ))}
                  {parsedPreview.items.length > 6 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      +{parsedPreview.items.length - 6} more
                    </span>
                  )}
                </div>
              )}

              {/* Error Message Callout */}
              {errorMsg && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: 'var(--rose-primary)',
                    fontSize: '0.82rem',
                    marginTop: '0.65rem',
                    background: 'rgba(244, 63, 94, 0.08)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Message Callout */}
              {successMsg && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: 'var(--emerald-light)',
                    fontSize: '0.82rem',
                    marginTop: '0.65rem',
                    background: 'rgba(16, 185, 129, 0.08)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div
          className="modal-actions modal-actions-responsive"
          style={{
            marginTop: '1.4rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <ShieldCheck size={14} color="var(--emerald-light)" />
            <span>End-to-end client validated & encrypted</span>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ fontWeight: 600 }}>
              Close
            </button>

            {activeTab === 'import' ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleImportSubmit}
                disabled={!parsedPreview.valid || isImporting}
                style={{
                  fontWeight: 700,
                  background: importStrategy === 'replace'
                    ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                    : 'var(--gradient-brand)',
                }}
              >
                {isImporting ? (
                  <RefreshCw size={15} className="spin" />
                ) : (
                  <Upload size={15} />
                )}
                <span>
                  {importStrategy === 'merge'
                    ? `Merge ${parsedPreview.items.length || 0} Targets`
                    : `Overwrite & Restore ${parsedPreview.items.length || 0} Targets`}
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleExport}
                disabled={projects.length === 0}
              >
                <Download size={15} />
                <span>Export ({projects.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
