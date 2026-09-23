import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  CheckSquare,
  Square,
  Trash,
  FolderKanban,
  CheckCircle2,
  Flame,
  Timer,
  Play,
  ExternalLink,
  Edit2,
  Power,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  Moon,
  Layers,
  X,
} from 'lucide-react';
import ProjectCard from './ProjectCard';
import { checkScheduleStatus } from '../utils/scheduleHelper';
import { normalizeUrl } from '../utils/projectChecker';

export default function ProjectList({
  projects = [],
  now = Date.now(),
  checkingIds = new Set(),
  activeStaySessions = {},
  onPing,
  onPingAll,
  onOpenAll,
  onRestart,
  onEdit,
  onDelete,
  onToggle,
  onOpenAddModal,
  onLoadDefaults,
  onEnableAll,
  onDisableAll,
  onClearAll,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'staying' | 'scheduled' | 'dormant' | 'disabled'
  // Default to visual card view by default across mobile, tab, and responsive modes
  const [viewLayout, setViewLayout] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      return 'grid';
    }
    return 'grid'; // 'grid' | 'table'
  });
  const [isPingingAll, setIsPingingAll] = useState(false);

  // Auto-switch to visual card grid view on mobile or tab screens
  useEffect(() => {
    const handleLayoutResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
        setViewLayout('grid');
      }
    };
    handleLayoutResize();
    window.addEventListener('resize', handleLayoutResize);
    return () => window.removeEventListener('resize', handleLayoutResize);
  }, []);

  // Fleet Health Metrics Calculations
  const stats = useMemo(() => {
    const total = projects.length;
    const awake = projects.filter(
      (p) => p.enabled && (p.status === 'active' || p.status === 'cors_warmed')
    ).length;
    const staying = projects.filter((p) => Boolean(activeStaySessions?.[p.id])).length;
    const scheduled = projects.filter(
      (p) => p.enabled && !checkScheduleStatus(p, now).isInSchedule
    ).length;
    const dormant = projects.filter((p) => p.enabled && p.status === 'down').length;
    const paused = projects.filter((p) => !p.enabled).length;

    const latencies = projects
      .map((p) => (p.latencyMs !== undefined && p.latencyMs !== null ? Number(p.latencyMs) : Number(p.lastLatency)))
      .filter((l) => typeof l === 'number' && !isNaN(l) && l > 0);
    const avgLatency =
      latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;

    return { total, awake, staying, scheduled, dormant, paused, avgLatency };
  }, [projects, activeStaySessions, now]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      // Search query filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        proj.name.toLowerCase().includes(q) ||
        proj.url.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const schedule = checkScheduleStatus(proj, now);
      const isStaying = Boolean(activeStaySessions?.[proj.id]);

      if (statusFilter === 'active') {
        return proj.enabled && schedule.isInSchedule && (proj.status === 'active' || proj.status === 'cors_warmed');
      }
      if (statusFilter === 'staying') {
        return isStaying;
      }
      if (statusFilter === 'scheduled') {
        return proj.enabled && !schedule.isInSchedule;
      }
      if (statusFilter === 'dormant') {
        return proj.enabled && proj.status === 'down';
      }
      if (statusFilter === 'disabled') {
        return !proj.enabled;
      }
      return true;
    });
  }, [projects, searchQuery, statusFilter, activeStaySessions, now]);

  // Handle Ping All
  const handlePingAll = async () => {
    if (!onPingAll) return;
    setIsPingingAll(true);
    try {
      await onPingAll();
    } finally {
      setIsPingingAll(false);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon-wrapper">
          <FolderKanban size={32} />
        </div>
        <h3 className="empty-title">No Projects Monitored Yet</h3>
        <p className="empty-desc">
          Add your Render, Fly.io, Vercel, or custom API URLs to keep them awake, schedule active hours, and track real-time response latency.
        </p>
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>Add Your First Project</span>
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Fleet Telemetry Stats Bar (4-Grid) */}
      <div className="schedule-stats-grid">
        <div className="schedule-stat-card">
          <div className="schedule-stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--indigo-light)' }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--indigo-light)', lineHeight: 1.1 }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Total Monitored Apps
            </div>
          </div>
        </div>

        <div className="schedule-stat-card">
          <div className="schedule-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald-light)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--emerald-light)', lineHeight: 1.1 }}>
              {stats.awake}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Awake & Primed
            </div>
          </div>
        </div>

        <div className="schedule-stat-card">
          <div className="schedule-stat-icon" style={{ background: 'rgba(217, 119, 6, 0.1)', color: 'var(--amber-primary)' }}>
            <Flame size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--amber-primary)', lineHeight: 1.1 }}>
              {stats.staying}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              In Keepalive Stay (Phase 1)
            </div>
          </div>
        </div>

        <div className="schedule-stat-card">
          <div className="schedule-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan-primary)' }}>
            <Timer size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--cyan-primary)', lineHeight: 1.1 }}>
              {stats.avgLatency > 0 ? `${stats.avgLatency}ms` : '--'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Avg Fleet Latency
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter Toolbar & View Layout Switcher */}
      <div className="control-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="search-input-wrapper" style={{ minWidth: '240px' }}>
          <Search className="search-icon" size={16} />
          <input
            id="dashboard-search-input"
            name="searchQuery"
            type="text"
            className="search-input"
            placeholder="Search projects by name or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="btn btn-ghost btn-sm"
              style={{ padding: '2px', height: 'auto', color: 'var(--text-muted)' }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right Controls: Filter Pills & View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Filter Pills */}
          <div className="filter-group">
            <button
              className={`btn btn-sm btn-pill ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button
              className={`btn btn-sm btn-pill ${statusFilter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('active')}
            >
              Awake
            </button>
            {stats.staying > 0 && (
              <button
                className={`btn btn-sm btn-pill ${statusFilter === 'staying' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter('staying')}
              >
                Staying
              </button>
            )}
            {stats.scheduled > 0 && (
              <button
                className={`btn btn-sm btn-pill ${statusFilter === 'scheduled' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter('scheduled')}
              >
                Scheduled
              </button>
            )}
            {stats.dormant > 0 && (
              <button
                className={`btn btn-sm btn-pill ${statusFilter === 'dormant' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter('dormant')}
              >
                Dormant
              </button>
            )}
            <button
              className={`btn btn-sm btn-pill ${statusFilter === 'disabled' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('disabled')}
            >
              Paused
            </button>
          </div>

          {/* View Switcher */}
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-pill)',
              padding: '2px',
            }}
          >
            <button
              className={`btn btn-icon ${viewLayout === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-pill)' }}
              onClick={() => setViewLayout('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              className={`btn btn-icon ${viewLayout === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-pill)' }}
              onClick={() => setViewLayout('table')}
              title="Compact Table View"
            >
              <TableIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <span>
          Showing <strong>{filteredProjects.length}</strong> of <strong>{projects.length}</strong> projects
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {onPingAll && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={handlePingAll}
              disabled={isPingingAll}
              title="Send immediate keepalive ping to all active projects"
            >
              <Play size={13} fill="currentColor" color="var(--indigo-light)" />
              <span>{isPingingAll ? 'Pinging...' : 'Ping All'}</span>
            </button>
          )}

          {onOpenAll && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={onOpenAll}
              title="Open all project URLs in browser tabs"
            >
              <ExternalLink size={13} color="var(--cyan-primary)" />
              <span>Open All</span>
            </button>
          )}

          <button
            className="btn btn-ghost btn-sm"
            onClick={onEnableAll}
            title="Enable auto-ping for all projects"
          >
            <CheckSquare size={13} color="var(--emerald-light)" />
            <span>Enable All</span>
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={onDisableAll}
            title="Pause auto-ping for all projects"
          >
            <Square size={13} color="var(--text-muted)" />
            <span>Pause All</span>
          </button>

          <button
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--rose-primary)' }}
            onClick={onClearAll}
            title="Delete all project entries"
          >
            <Trash size={13} />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Main Content: Card Grid vs Compact Table */}
      {filteredProjects.length === 0 ? (
        <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
          <p className="empty-desc">No projects match the current search or filter criteria.</p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : viewLayout === 'grid' ? (
        /* ==========================================================================
           1. CARD GRID VIEW
           ========================================================================== */
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              now={now}
              isChecking={checkingIds.has(project.id)}
              activeStaySession={activeStaySessions?.[project.id]}
              onPing={onPing}
              onRestart={onRestart}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : (
        /* ==========================================================================
           2. COMPACT TABLE VIEW
           ========================================================================== */
        <div
          style={{
            overflowX: 'auto',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '2rem',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                <th style={{ padding: '1.1rem 1.25rem', fontWeight: 700 }}>Project & Target URL</th>
                <th style={{ padding: '1.1rem 1.25rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '1.1rem 1.25rem', fontWeight: 700 }}>Latency</th>
                <th style={{ padding: '1.1rem 1.25rem', fontWeight: 700 }}>Stay Session (Phase 1)</th>
                <th style={{ padding: '1.1rem 1.25rem', fontWeight: 700 }}>Interval (Phase 2)</th>
                <th style={{ padding: '1.1rem 1.25rem', fontWeight: 700 }}>Cycles</th>
                <th style={{ padding: '1.1rem 1.25rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => {
                const isChecking = checkingIds.has(p.id);
                const activeStay = activeStaySessions?.[p.id];
                const schedule = checkScheduleStatus(p, now);
                const isAwake = p.enabled && (p.status === 'active' || p.status === 'cors_warmed');

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease',
                      opacity: p.enabled ? 1 : 0.65,
                    }}
                  >
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                        {p.name}
                      </div>
                      <a
                        href={normalizeUrl(p.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.74rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                          maxWidth: '220px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'inline-block',
                          textDecoration: 'none',
                        }}
                        title={p.url}
                      >
                        {p.url.replace(/^https?:\/\//i, '').replace(/\/$/, '')}
                      </a>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      {activeStay ? (
                        <span
                          className="status-pill"
                          style={{
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: 'var(--amber-primary)',
                            borderColor: 'rgba(245, 158, 11, 0.4)',
                          }}
                        >
                          <Flame size={12} />
                          Staying
                        </span>
                      ) : isChecking ? (
                        <span className="status-pill checking">
                          <span className="pulse-dot checking"></span>
                          Pinging...
                        </span>
                      ) : !p.enabled ? (
                        <span className="status-pill unknown">
                          <span className="pulse-dot unknown"></span>
                          Paused
                        </span>
                      ) : !schedule.isInSchedule ? (
                        <span className="status-pill scheduled">
                          <Moon size={12} />
                          Scheduled
                        </span>
                      ) : isAwake ? (
                        <span className="status-pill active">
                          <span className="pulse-dot active"></span>
                          Awake
                        </span>
                      ) : (
                        <span className="status-pill dormant">
                          <span className="pulse-dot dormant"></span>
                          Dormant
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {p.lastLatency ? (
                        <span style={{ color: p.lastLatency > 500 ? 'var(--amber-primary)' : 'var(--cyan-primary)' }}>
                          {p.lastLatency}ms
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>--</span>
                      )}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--amber-primary)', fontSize: '0.82rem' }}>
                      {p.stayDuration || 60}s ({p.stayMode === 'tab' ? 'Tab' : 'Frame'})
                    </td>

                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--indigo-light)', fontWeight: 600, fontSize: '0.82rem' }}>
                      Every {p.interval || 10}m
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: (p.completedCycles || 0) > 0 ? 'rgba(79, 70, 229, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                          color: (p.completedCycles || 0) > 0 ? 'var(--indigo-light)' : 'var(--text-secondary)',
                          border: `1px solid ${(p.completedCycles || 0) > 0 ? 'rgba(79, 70, 229, 0.35)' : 'var(--border-subtle)'}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <RotateCcw size={10} />
                        #{p.completedCycles || 0}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{ width: '30px', height: '30px' }}
                          onClick={() => onPing(p.id, true)}
                          title="Ping Now"
                        >
                          <Play size={12} fill="currentColor" color="var(--indigo-light)" />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{ width: '30px', height: '30px' }}
                          onClick={() => window.open(normalizeUrl(p.url), '_blank', 'noopener,noreferrer')}
                          title="Open Site in Tab"
                        >
                          <ExternalLink size={12} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon"
                          style={{ width: '30px', height: '30px' }}
                          onClick={() => onEdit(p)}
                          title="Edit Project"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{
                            width: '30px',
                            height: '30px',
                            color: p.enabled ? 'var(--emerald-light)' : 'var(--text-muted)',
                          }}
                          onClick={() => onToggle(p.id)}
                          title={p.enabled ? 'Pause' : 'Resume'}
                        >
                          <Power size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
