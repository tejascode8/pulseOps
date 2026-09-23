import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Terminal,
  Search,
  Trash2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  Clock,
  Play,
  Copy,
  Check,
  Timer,
  BarChart3,
  FileSpreadsheet,
  FileJson,
  RefreshCw,
  FolderKanban,
  X,
  ArrowUp,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export default function ActivityStreamPage({
  logs = [],
  projects = [],
  onPingAll,
  onPing,
  onClearLogs,
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'stay' | 'cycles' | 'down'
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollTopBtn, setShowScrollTopBtn] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isPingingAll, setIsPingingAll] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const terminalBodyRef = useRef(null);
  const projectDropdownRef = useRef(null);

  // Close project dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
        setIsProjectDropdownOpen(false);
      }
    }
    if (isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProjectDropdownOpen]);

  // Precompute event counts per project for rich dropdown badges
  const projectEventCounts = useMemo(() => {
    const counts = {};
    logs.forEach((log) => {
      const pid = log.projectId || projects.find((p) => p.name === log.projectName)?.id;
      if (pid) {
        counts[pid] = (counts[pid] || 0) + 1;
      }
    });
    return counts;
  }, [logs, projects]);

  const selectedProject = useMemo(() => {
    if (selectedProjectId === 'all') return null;
    return projects.find((p) => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  // Auto-scroll to top when new logs arrive (since newest events are at the top)
  useEffect(() => {
    if (autoScroll && terminalBodyRef.current) {
      terminalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Handle scroll detection for the "Jump to Latest" button
  const handleScroll = (e) => {
    if (e.currentTarget.scrollTop > 90) {
      setShowScrollTopBtn(true);
    } else {
      setShowScrollTopBtn(false);
    }
  };

  const scrollToTop = () => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Category counts for filter pills
  const counts = useMemo(() => {
    const total = logs.length;
    const active = logs.filter(
      (l) => l.status === 'active' || l.status === 'cors_warmed' || l.corsAwakened
    ).length;
    const stay = logs.filter(
      (l) =>
        l.status === 'staying' ||
        (l.message && l.message.toLowerCase().includes('stay')) ||
        l.stayMode !== undefined
    ).length;
    const cycles = logs.filter((l) => l.cycle !== undefined && l.cycle !== null).length;
    const down = logs.filter((l) => l.status === 'down').length;

    return { total, active, stay, cycles, down };
  }, [logs]);

  // Filtered logs (Guaranteed newest events at the top, oldest at the bottom)
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search filter
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (log.projectName && log.projectName.toLowerCase().includes(q)) ||
        (log.url && log.url.toLowerCase().includes(q)) ||
        (log.message && log.message.toLowerCase().includes(q)) ||
        (log.statusCode && String(log.statusCode).includes(q));

      if (!matchesSearch) return false;

      // Project filter
      if (selectedProjectId !== 'all') {
        const matchesProject =
          (log.projectId && log.projectId === selectedProjectId) ||
          (log.projectName &&
            projects.find((p) => p.id === selectedProjectId)?.name === log.projectName);
        if (!matchesProject) return false;
      }

      // Status/Category filter
      if (statusFilter === 'active') {
        return log.status === 'active' || log.status === 'cors_warmed' || log.corsAwakened;
      }
      if (statusFilter === 'stay') {
        return (
          log.status === 'staying' ||
          (log.message && log.message.toLowerCase().includes('stay')) ||
          log.stayMode !== undefined
        );
      }
      if (statusFilter === 'cycles') {
        return log.cycle !== undefined && log.cycle !== null;
      }
      if (statusFilter === 'down') {
        return log.status === 'down';
      }

      return true;
    });
  }, [logs, search, selectedProjectId, statusFilter, projects]);

  // Telemetry Metrics Calculation
  const totalEvents = logs.length;
  const errorCount = counts.down;
  const successCount = totalEvents - errorCount;
  const successRate = totalEvents > 0 ? ((successCount / totalEvents) * 100).toFixed(1) : '100.0';

  const latencies = useMemo(
    () => logs.filter((l) => typeof l.latencyMs === 'number' && l.latencyMs > 0).map((l) => l.latencyMs),
    [logs]
  );
  const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
  const cycleCount = counts.cycles;

  // Latency Distribution Buckets
  const latencyBuckets = useMemo(() => {
    if (latencies.length === 0) {
      return { fast: 0, nominal: 0, high: 0, fastPct: '0', nominalPct: '0', highPct: '0' };
    }
    const fast = latencies.filter((l) => l < 150).length;
    const nominal = latencies.filter((l) => l >= 150 && l <= 500).length;
    const high = latencies.filter((l) => l > 500).length;

    const fastPct = ((fast / latencies.length) * 100).toFixed(0);
    const nominalPct = ((nominal / latencies.length) * 100).toFixed(0);
    const highPct = ((high / latencies.length) * 100).toFixed(0);

    return { fast, nominal, high, fastPct, nominalPct, highPct };
  }, [latencies]);

  // Copy to Clipboard
  const handleCopyLog = (log) => {
    const text = `[${log.timestamp || ''}] [${log.projectName || 'Project'}] ${log.statusCode ? `HTTP ${log.statusCode} ` : ''}${log.latencyMs ? `(${log.latencyMs}ms) ` : ''}: ${log.message || ''} (${log.url || ''})`;
    navigator.clipboard.writeText(text);
    setCopiedId(log.id || log._id || text);
    showToast('Copied log line to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyJson = (log) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(`json_${log.id || log._id || Math.random()}`);
    showToast('Copied telemetry JSON payload');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pulseops-stream-audit-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported JSON audit log file');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'Project', 'URL', 'Status', 'StatusCode', 'LatencyMs', 'Message', 'Cycle'];
    const rows = logs.map((l) => [
      `"${l.timestamp || ''}"`,
      `"${l.projectName || ''}"`,
      `"${l.url || ''}"`,
      `"${l.status || ''}"`,
      `"${l.statusCode || ''}"`,
      `"${l.latencyMs || ''}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      `"${l.cycle !== undefined ? l.cycle : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pulseops-stream-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Exported CSV spreadsheet audit file');
  };

  // Trigger Ping All
  const handlePingAll = async () => {
    if (!onPingAll) return;
    setIsPingingAll(true);
    try {
      await onPingAll();
      showToast('Triggered keepalive probes across all monitored apps');
    } finally {
      setIsPingingAll(false);
    }
  };

  const hasActiveFilters = statusFilter !== 'all' || selectedProjectId !== 'all' || Boolean(search);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSelectedProjectId('all');
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

      {/* Page Header Banner */}
      <div className="card activity-header-banner">
        {/* Left: Brand Icon + Clean Title + Concise Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, maxWidth: '100%', flex: '1 1 auto' }}>
          <div
            className="brand-icon-wrapper"
            style={{
              width: '46px',
              height: '46px',
              background: 'var(--gradient-emerald)',
              borderRadius: '14px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            <Terminal size={22} />
          </div>
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                marginBottom: '0.2rem',
              }}
            >
              Activity Stream & Telemetry Console
            </h2>
            <p
              style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              Real-time audit telemetry of HTTP keepalives, stay sessions, CORS pre-flights, and network latency.
            </p>
          </div>
        </div>

        {/* Right: Live Status Badge + Action Buttons */}
        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExportJSON}
            disabled={logs.length === 0}
            title="Download audit logs as JSON file"
            style={{
              fontWeight: 600,
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-pill)',
              padding: '0.4rem 0.85rem',
            }}
          >
            <FileJson size={14} color="var(--cyan-primary)" />
            <span>JSON</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            title="Download audit logs as CSV spreadsheet"
            style={{
              fontWeight: 600,
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-pill)',
              padding: '0.4rem 0.85rem',
            }}
          >
            <FileSpreadsheet size={14} color="var(--emerald-light)" />
            <span>CSV</span>
          </button>

          {onClearLogs && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onClearLogs}
              disabled={logs.length === 0}
              title="Clear all activity logs from local & database storage"
              style={{
                fontWeight: 600,
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-pill)',
                padding: '0.4rem 0.85rem',
              }}
            >
              <Trash2 size={14} color="var(--rose-primary)" />
              <span>Clear Stream</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Fleet Telemetry Stats Bar (4-Grid Filter) */}
      <div className="schedule-stats-grid" style={{ marginBottom: '1.25rem' }}>
        {/* Total Events */}
        <div
          className="schedule-stat-card"
          onClick={() => {
            setStatusFilter('all');
            setSelectedProjectId('all');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'all' && selectedProjectId === 'all' ? '1.5px solid var(--indigo-primary)' : '1px solid var(--border-subtle)',
            boxShadow: statusFilter === 'all' && selectedProjectId === 'all' ? '0 4px 16px rgba(79, 70, 229, 0.15)' : 'var(--shadow-sm)',
            background: statusFilter === 'all' && selectedProjectId === 'all' ? 'rgba(79, 70, 229, 0.04)' : 'var(--bg-card)',
          }}
          title="Click to view all telemetry stream events"
        >
          <div className="schedule-stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--indigo-light)' }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--indigo-light)', lineHeight: 1.1 }}>
              {totalEvents}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Total Stream Events
            </div>
          </div>
        </div>

        {/* Fleet Health Rate */}
        <div
          className="schedule-stat-card"
          onClick={() => {
            setStatusFilter(statusFilter === 'active' ? 'all' : 'active');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'active' ? '1.5px solid var(--emerald-light)' : '1px solid var(--border-subtle)',
            boxShadow: statusFilter === 'active' ? '0 4px 16px rgba(16, 185, 129, 0.15)' : 'var(--shadow-sm)',
            background: statusFilter === 'active' ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
          }}
          title="Click to filter active successful keepalive probes"
        >
          <div className="schedule-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald-light)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--emerald-light)', lineHeight: 1.1 }}>
              {successRate}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Fleet Health Rate
            </div>
          </div>
        </div>

        {/* Avg Response Latency */}
        <div
          className="schedule-stat-card"
          style={{
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            background: 'var(--bg-card)',
          }}
          title="Average round-trip response latency across monitored services"
        >
          <div className="schedule-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan-primary)' }}>
            <Timer size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--cyan-primary)', lineHeight: 1.1 }}>
              {avgLatency > 0 ? `${avgLatency}ms` : '--'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Avg Response Latency
            </div>
          </div>
        </div>

        {/* Completed Cycles */}
        <div
          className="schedule-stat-card"
          onClick={() => {
            setStatusFilter(statusFilter === 'cycles' ? 'all' : 'cycles');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'cycles' ? '1.5px solid var(--amber-primary)' : '1px solid var(--border-subtle)',
            boxShadow: statusFilter === 'cycles' ? '0 4px 16px rgba(217, 119, 6, 0.15)' : 'var(--shadow-sm)',
            background: statusFilter === 'cycles' ? 'rgba(217, 119, 6, 0.04)' : 'var(--bg-card)',
          }}
          title="Click to filter completed cycle milestones"
        >
          <div className="schedule-stat-icon" style={{ background: 'rgba(217, 119, 6, 0.1)', color: 'var(--amber-primary)' }}>
            <Flame size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--amber-primary)', lineHeight: 1.1 }}>
              {cycleCount}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Completed Full Cycles
            </div>
          </div>
        </div>
      </div>

      {/* Latency Spectrum Bar Visualizer */}
      {latencies.length > 0 && (
        <div
          className="card"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <BarChart3 size={15} color="var(--indigo-primary)" />
              Latency Distribution Spectrum
            </span>
            <span
              style={{
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                background: 'var(--bg-secondary)',
                padding: '0.15rem 0.55rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 600,
              }}
            >
              Verified Probes: {latencies.length}
            </span>
          </div>

          <div
            style={{
              height: '8px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-secondary)',
              overflow: 'hidden',
              display: 'flex',
              border: '1px solid var(--border-subtle)',
            }}
            title="Latency Distribution Bar"
          >
            <div
              style={{
                width: `${latencyBuckets.fastPct}%`,
                background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                transition: 'width 0.3s ease',
              }}
              title={`Fast (<150ms): ${latencyBuckets.fast} probes (${latencyBuckets.fastPct}%)`}
            />
            <div
              style={{
                width: `${latencyBuckets.nominalPct}%`,
                background: 'linear-gradient(90deg, #06b6d4 0%, #38bdf8 100%)',
                transition: 'width 0.3s ease',
              }}
              title={`Nominal (150ms-500ms): ${latencyBuckets.nominal} probes (${latencyBuckets.nominalPct}%)`}
            />
            <div
              style={{
                width: `${latencyBuckets.highPct}%`,
                background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                transition: 'width 0.3s ease',
              }}
              title={`Cold Start (>500ms): ${latencyBuckets.high} probes (${latencyBuckets.highPct}%)`}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.76rem' }}>
            <span style={{ color: 'var(--emerald-light)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--emerald-light)' }} />
              Fast (&lt;150ms): <strong style={{ color: 'var(--text-primary)' }}>{latencyBuckets.fastPct}%</strong> ({latencyBuckets.fast})
            </span>
            <span style={{ color: 'var(--cyan-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--cyan-primary)' }} />
              Nominal (150-500ms): <strong style={{ color: 'var(--text-primary)' }}>{latencyBuckets.nominalPct}%</strong> ({latencyBuckets.nominal})
            </span>
            <span style={{ color: 'var(--amber-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--amber-primary)' }} />
              Cold Start (&gt;500ms): <strong style={{ color: 'var(--text-primary)' }}>{latencyBuckets.highPct}%</strong> ({latencyBuckets.high})
            </span>
            {errorCount > 0 && (
              <span style={{ color: 'var(--rose-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--rose-primary)' }} />
                Timeouts / Errors: <strong style={{ color: 'var(--rose-primary)' }}>{errorCount}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Sleek, Single-Row Toolbar (Matching SchedulesPage) */}
      <div
        className="control-bar"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '0.65rem 0.95rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '100%',
        }}
      >
        {/* Left: Segmented Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', maxWidth: '100%' }}>
          <div className="toolbar-segmented-tabs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                border: 'none',
                background: statusFilter === 'all' ? 'var(--bg-card)' : 'transparent',
                color: statusFilter === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: statusFilter === 'all' ? 'var(--shadow-sm)' : 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span>All Events</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              style={{
                border: 'none',
                background: statusFilter === 'active' ? 'var(--bg-card)' : 'transparent',
                color: statusFilter === 'active' ? 'var(--emerald-light)' : 'var(--text-secondary)',
                boxShadow: statusFilter === 'active' ? 'var(--shadow-sm)' : 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--emerald-light)' }} />
              <span>Awake & Active</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('stay')}
              style={{
                border: 'none',
                background: statusFilter === 'stay' ? 'var(--bg-card)' : 'transparent',
                color: statusFilter === 'stay' ? 'var(--amber-primary)' : 'var(--text-secondary)',
                boxShadow: statusFilter === 'stay' ? 'var(--shadow-sm)' : 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Flame size={12} color="var(--amber-primary)" />
              <span>Stay Sessions</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('cycles')}
              style={{
                border: 'none',
                background: statusFilter === 'cycles' ? 'var(--bg-card)' : 'transparent',
                color: statusFilter === 'cycles' ? 'var(--indigo-light)' : 'var(--text-secondary)',
                boxShadow: statusFilter === 'cycles' ? 'var(--shadow-sm)' : 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Timer size={12} color="var(--indigo-light)" />
              <span>Cycle Milestones</span>
            </button>

            {counts.down > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('down')}
                style={{
                  border: 'none',
                  background: statusFilter === 'down' ? 'var(--bg-card)' : 'transparent',
                  color: statusFilter === 'down' ? 'var(--rose-primary)' : 'var(--text-muted)',
                  boxShadow: statusFilter === 'down' ? 'var(--shadow-sm)' : 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <AlertTriangle size={12} color="var(--rose-primary)" />
                <span>Errors & Timeouts</span>
              </button>
            )}
          </div>

          {/* Reset Filters Chip */}
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleResetFilters}
              style={{
                fontSize: '0.76rem',
                color: 'var(--rose-primary)',
                padding: '0.3rem 0.6rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title="Reset all active filters and search"
            >
              <X size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Project Selector + Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
          {/* Custom Styled Project Dropdown Filter */}
          {projects.length > 0 && (
            <div style={{ position: 'relative' }} ref={projectDropdownRef}>
              <button
                type="button"
                id="activity-project-filter"
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className={`btn btn-sm ${selectedProjectId !== 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.38rem 0.85rem',
                  height: '32px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  maxWidth: '220px',
                }}
                title={selectedProject ? `Filtering by: ${selectedProject.name}` : `All Projects (${projects.length})`}
              >
                <FolderKanban size={13} color={selectedProjectId !== 'all' ? '#ffffff' : 'var(--indigo-light)'} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                  {selectedProject ? selectedProject.name : 'All Projects'}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    opacity: 0.85,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}
                >
                  ({selectedProjectId === 'all' ? projects.length : (projectEventCounts[selectedProjectId] || 0)})
                </span>
                <ChevronDown
                  size={13}
                  style={{
                    transform: isProjectDropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.15s ease',
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Dropdown Menu Popover */}
              {isProjectDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    zIndex: 70,
                    minWidth: '270px',
                    maxWidth: '320px',
                    maxHeight: '340px',
                    overflowY: 'auto',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 12px 34px -4px rgba(15, 23, 42, 0.25)',
                    padding: '0.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    animation: 'fadeIn 0.12s ease',
                  }}
                >
                  <div
                    style={{
                      padding: '0.35rem 0.65rem 0.25rem',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Filter Stream by Fleet Project:
                  </div>

                  {/* All Projects Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId('all');
                      setIsProjectDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: selectedProjectId === 'all' ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                      color: selectedProjectId === 'all' ? 'var(--indigo-light)' : 'var(--text-primary)',
                      fontWeight: selectedProjectId === 'all' ? 700 : 500,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedProjectId !== 'all') e.currentTarget.style.background = 'var(--bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedProjectId !== 'all') e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <FolderKanban size={14} color={selectedProjectId === 'all' ? 'var(--indigo-light)' : 'var(--text-secondary)'} />
                      <span>All Projects</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          color: selectedProjectId === 'all' ? 'var(--indigo-light)' : 'var(--text-muted)',
                          fontWeight: 700,
                        }}
                      >
                        ({projects.length})
                      </span>
                      {selectedProjectId === 'all' && <Check size={13} color="var(--indigo-light)" />}
                    </div>
                  </button>

                  {/* Divider */}
                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.25rem 0' }} />

                  {/* Project Items */}
                  {projects.map((p) => {
                    const isSelected = selectedProjectId === p.id;
                    const eventCount = projectEventCounts[p.id] || 0;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setIsProjectDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: 'none',
                          background: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                          color: isSelected ? 'var(--indigo-light)' : 'var(--text-primary)',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'var(--bg-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', overflow: 'hidden' }}>
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: p.enabled !== false ? 'var(--emerald-light)' : 'var(--text-muted)',
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '160px',
                            }}
                          >
                            {p.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.72rem',
                              color: isSelected ? 'var(--indigo-light)' : 'var(--text-muted)',
                              fontWeight: 700,
                            }}
                            title={`${eventCount} captured telemetry logs`}
                          >
                            ({eventCount})
                          </span>
                          {isSelected && <Check size={13} color="var(--indigo-light)" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Search Input */}
          <div className="search-input-wrapper" style={{ minWidth: '160px', maxWidth: '100%', position: 'relative' }}>
            <Search className="search-icon" size={13} />
            <input
              id="activity-search-input"
              name="searchQuery"
              type="text"
              className="search-input"
              placeholder="Search stream events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              style={{
                padding: '0.38rem 1.75rem 0.38rem 1.9rem',
                fontSize: '0.8rem',
                height: '32px',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area: Dedicated Developer CLI Console */}
      {filteredLogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <Radio size={32} />
          </div>
          <h3 className="empty-title">
            {logs.length === 0 ? 'No Activity Recorded Yet' : 'No Matching Events Found'}
          </h3>
          <p className="empty-desc">
            {logs.length === 0
              ? 'Trigger an immediate ping or let automated keepalive timers run to begin capturing real-time network telemetry.'
              : 'No log events match your current search query or category filter selections.'}
          </p>
          {logs.length === 0 ? (
            projects.length > 0 && onPingAll ? (
              <button className="btn btn-primary" onClick={handlePingAll}>
                <Play size={16} fill="currentColor" />
                <span>Trigger Instant Probe</span>
              </button>
            ) : null
          ) : (
            <button className="btn btn-secondary" onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        /* ==========================================================================
           DEVELOPER TERMINAL CLI CONSOLE VIEW
           ========================================================================== */
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: '0 12px 36px -4px rgba(15, 23, 42, 0.4)',
            marginBottom: '2rem',
            position: 'relative',
          }}
        >
          {/* Terminal Titlebar */}
          <div
            style={{
              background: '#1e293b',
              padding: '0.65rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span style={{ color: '#818cf8', fontWeight: 700 }}>pulseops-daemon@fleet:~$</span>
                <span>tail -f /var/log/probe-stream.log</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#38bdf8',
                    background: 'rgba(6, 182, 212, 0.12)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.05rem 0.45rem',
                    fontWeight: 700,
                  }}
                >
                  Newest on Top
                </span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.06)',
                  padding: '0.18rem 0.55rem',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {filteredLogs.length} events
              </span>

              {/* Auto-Scroll / Auto-Focus Toggle */}
              <button
                type="button"
                style={{
                  border: 'none',
                  background: autoScroll ? 'var(--indigo-primary)' : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  padding: '0.2rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  height: '24px',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
                onClick={() => setAutoScroll(!autoScroll)}
                title="Toggle automatic focus on the latest incoming probes at the top"
              >
                <Sparkles size={11} />
                <span>Auto-Focus Latest: {autoScroll ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Floating Jump to Latest Button (if scrolled down) */}
          {showScrollTopBtn && (
            <button
              type="button"
              onClick={scrollToTop}
              style={{
                position: 'absolute',
                top: '52px',
                right: '24px',
                zIndex: 30,
                background: 'var(--indigo-primary)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: 'var(--radius-pill)',
                padding: '0.35rem 0.85rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                animation: 'fadeIn 0.15s ease',
              }}
            >
              <ArrowUp size={13} />
              <span>Jump to Latest (Top)</span>
            </button>
          )}

          {/* Terminal Logs Body with Ultra-Sleek Scrollbar */}
          <div
            ref={terminalBodyRef}
            onScroll={handleScroll}
            className="cli-terminal-scroll stream-terminal-body"
            style={{
              maxHeight: '580px',
              overflowY: 'auto',
              padding: '0.75rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              scrollBehavior: 'smooth',
            }}
          >
            {filteredLogs.map((log, idx) => {
              const isFirst = idx === 0;
              const isError = log.status === 'down';
              const isStay =
                log.status === 'staying' ||
                (log.message && log.message.toLowerCase().includes('stay')) ||
                log.stayMode !== undefined;
              const isCycle = log.cycle !== undefined && log.cycle !== null;
              const isCors = log.status === 'cors_warmed' || log.corsAwakened;
              const logKey = log.id || log._id || `${log.timestamp}_${idx}`;

              return (
                <div
                  key={logKey}
                  style={{
                    background: isError
                      ? 'rgba(244, 63, 94, 0.08)'
                      : isStay
                      ? 'rgba(245, 158, 11, 0.06)'
                      : isCycle
                      ? 'rgba(99, 102, 241, 0.07)'
                      : isFirst
                      ? 'rgba(16, 185, 129, 0.04)'
                      : 'rgba(255, 255, 255, 0.02)',
                    borderLeft: `3px solid ${
                      isError
                        ? '#f43f5e'
                        : isStay
                        ? '#f59e0b'
                        : isCycle
                        ? '#818cf8'
                        : isCors
                        ? '#06b6d4'
                        : '#10b981'
                    }`,
                    borderRadius: '0 8px 8px 0',
                    padding: '0.65rem 0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isError
                      ? 'rgba(244, 63, 94, 0.13)'
                      : 'rgba(255, 255, 255, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isError
                      ? 'rgba(244, 63, 94, 0.08)'
                      : isStay
                      ? 'rgba(245, 158, 11, 0.06)'
                      : isCycle
                      ? 'rgba(99, 102, 241, 0.07)'
                      : isFirst
                      ? 'rgba(16, 185, 129, 0.04)'
                      : 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '85%' }}>
                    {/* Log Meta Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                      {/* Latest Event Tag */}
                      {isFirst && (
                        <span
                          style={{
                            fontSize: '0.66rem',
                            padding: '0.08rem 0.4rem',
                            borderRadius: '4px',
                            background: 'rgba(16, 185, 129, 0.25)',
                            color: '#34d399',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34d399' }} />
                          LATEST
                        </span>
                      )}

                      {/* Project Tag */}
                      <span
                        style={{
                          fontWeight: 800,
                          color: isError ? '#fb7185' : '#818cf8',
                          fontSize: '0.82rem',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        [{log.projectName || 'Project'}]
                      </span>

                      {/* Status Code / Event Badge */}
                      {log.statusCode ? (
                        <span
                          style={{
                            fontSize: '0.70rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            background: isError ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.2)',
                            color: isError ? '#fb7185' : '#34d399',
                            fontWeight: 700,
                            border: `1px solid ${isError ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.35)'}`,
                          }}
                        >
                          HTTP {log.statusCode}
                        </span>
                      ) : isCors ? (
                        <span
                          style={{
                            fontSize: '0.70rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            background: 'rgba(6, 182, 212, 0.2)',
                            color: '#38bdf8',
                            fontWeight: 700,
                            border: '1px solid rgba(6, 182, 212, 0.35)',
                          }}
                        >
                          CORS AWAKENED
                        </span>
                      ) : null}

                      {/* Latency Pill */}
                      {log.latencyMs !== null && log.latencyMs !== undefined && (
                        <span
                          style={{
                            fontSize: '0.70rem',
                            color: log.latencyMs > 500 ? '#f59e0b' : '#38bdf8',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            background: 'rgba(255, 255, 255, 0.06)',
                            padding: '0.08rem 0.4rem',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          <Timer size={11} /> {log.latencyMs}ms
                        </span>
                      )}

                      {/* Cycle Tag */}
                      {isCycle && (
                        <span
                          style={{
                            fontSize: '0.70rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            background: 'rgba(99, 102, 241, 0.25)',
                            color: '#a5b4fc',
                            fontWeight: 700,
                            border: '1px solid rgba(99, 102, 241, 0.35)',
                          }}
                        >
                          CYCLE #{log.cycle}
                        </span>
                      )}

                      {/* Stay Mode Tag */}
                      {isStay && (
                        <span
                          style={{
                            fontSize: '0.70rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            background: 'rgba(245, 158, 11, 0.25)',
                            color: '#fbbf24',
                            fontWeight: 700,
                            border: '1px solid rgba(245, 158, 11, 0.35)',
                          }}
                        >
                          STAY ACTIVE
                        </span>
                      )}
                    </div>

                    {/* Log Message Content */}
                    <div style={{ color: '#f1f5f9', wordBreak: 'break-word', fontSize: '0.83rem', lineHeight: 1.45 }}>
                      {log.message}
                    </div>

                    {/* Endpoint Target URL */}
                    {log.url && (
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748b',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '560px',
                          fontFamily: 'var(--font-mono)',
                        }}
                        title={log.url}
                      >
                        {log.url}
                      </div>
                    )}
                  </div>

                  {/* Right Side: Timestamp & Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.73rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      {log.timestamp}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button
                        className="btn btn-ghost btn-icon"
                        style={{ width: '26px', height: '26px', color: '#94a3b8', borderRadius: '4px' }}
                        onClick={() => handleCopyLog(log)}
                        title="Copy log line"
                      >
                        {copiedId === (log.id || log._id || `${log.timestamp}_${idx}`) ? (
                          <Check size={12} color="var(--emerald-light)" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        style={{ width: '26px', height: '26px', color: '#94a3b8', borderRadius: '4px' }}
                        onClick={() => handleCopyJson(log)}
                        title="Copy log JSON"
                      >
                        <FileJson size={12} />
                      </button>
                      {log.projectId && onPing && (
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{ width: '26px', height: '26px', color: 'var(--indigo-light)', borderRadius: '4px' }}
                          onClick={() => onPing(log.projectId, true)}
                          title="Ping this project again now"
                        >
                          <Play size={12} fill="currentColor" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* End of Stream Monospace Marker */}
            {filteredLogs.length > 5 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '0.85rem 0 0.35rem',
                  color: '#475569',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                }}
              >
                <span style={{ height: '1px', width: '40px', background: '#334155' }} />
                <span>End of Stream Buffer (Oldest Recorded Events)</span>
                <span style={{ height: '1px', width: '40px', background: '#334155' }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
