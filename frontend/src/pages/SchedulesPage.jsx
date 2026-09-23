import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  CalendarClock,
  Clock,
  Calendar,
  Layers,
  Edit2,
  Power,
  Play,
  CheckCircle2,
  Moon,
  Sun,
  Sliders,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Infinity,
  Briefcase,
  Flame,
  Globe,
  Plus,
  Info,
  ChevronDown,
  Check,
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  checkScheduleStatus,
  formatTime12h,
  formatScheduleSummary,
  getScheduleTimeline,
} from '../utils/scheduleHelper';
import { normalizeUrl } from '../utils/projectChecker';

export default function SchedulesPage({
  projects = [],
  now = Date.now(),
  onEdit,
  onToggle,
  onOpenAddModal,
  onUpdateProject,
  onEnableAll,
  onDisableAll,
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active_now' | 'resting_now' | 'paused'
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState('all'); // 'all' | 'always' | 'daily_window' | 'date_range' | 'recruiter' | 'interview_prep'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Default to visual card view by default across mobile, tab, and responsive modes
  const [viewLayout, setViewLayout] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      return 'grid';
    }
    return 'grid'; // 'grid' | 'table'
  });
  const dropdownRef = useRef(null);

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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Local Time & Timezone calculation
  const currentDate = useMemo(() => new Date(now), [now]);
  const formattedTime = useMemo(
    () =>
      currentDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
    [currentDate]
  );
  const timeZoneName = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    } catch {
      return 'Local Time';
    }
  }, []);

  // Compute live schedule evaluations for all projects
  const evaluatedProjects = useMemo(() => {
    return projects.map((p) => {
      const scheduleInfo = checkScheduleStatus(p, now);
      const timeline = getScheduleTimeline(p, now);
      const summaryText = formatScheduleSummary(p);
      return {
        ...p,
        scheduleInfo,
        timeline,
        summaryText,
      };
    });
  }, [projects, now]);

  // Aggregated Metrics
  const stats = useMemo(() => {
    const total = evaluatedProjects.length;
    const activeNow = evaluatedProjects.filter((p) => p.enabled && p.scheduleInfo.isInSchedule).length;
    const restingNow = evaluatedProjects.filter((p) => p.enabled && !p.scheduleInfo.isInSchedule).length;
    const paused = evaluatedProjects.filter((p) => !p.enabled).length;
    const alwaysActive = evaluatedProjects.filter(
      (p) =>
        (!p.scheduleMode || p.scheduleMode === 'always') &&
        (!p.dailyStartTime || (p.dailyStartTime === '00:00' && p.dailyEndTime === '23:59')) &&
        !p.scheduleEnd
    ).length;
    const dailyWindows = evaluatedProjects.filter(
      (p) =>
        p.scheduleMode === 'daily_window' ||
        p.scheduleMode === 'custom_combined' ||
        (p.dailyStartTime && p.dailyEndTime && !(p.dailyStartTime === '00:00' && p.dailyEndTime === '23:59'))
    ).length;
    const dateRanges = evaluatedProjects.filter(
      (p) =>
        (p.scheduleMode === 'date_range' || p.scheduleMode === 'custom_combined' || (p.scheduleStart && p.scheduleEnd)) &&
        Boolean(p.scheduleEnd)
    ).length;
    const recruiterHours = evaluatedProjects.filter(
      (p) => p.dailyStartTime === '09:00' && p.dailyEndTime === '18:00'
    ).length;
    const interviewPrep = evaluatedProjects.filter(
      (p) => p.dailyStartTime === '08:00' && p.dailyEndTime === '22:00'
    ).length;

    return { total, activeNow, restingNow, paused, alwaysActive, recruiterHours, interviewPrep, dailyWindows, dateRanges };
  }, [evaluatedProjects]);

  // Dropdown options configuration
  const modeOptions = useMemo(
    () => [
      { key: 'all', label: 'All Schedule Modes', icon: <Layers size={14} />, count: stats.total },
      { key: 'always', label: '24/7 Continuous', icon: <Infinity size={14} color="var(--cyan-primary)" />, count: stats.alwaysActive },
      { key: 'daily_window', label: 'Daily Operating Windows', icon: <Clock size={14} color="var(--indigo-light)" />, count: stats.dailyWindows },
      { key: 'recruiter', label: 'Recruiter Hours (09:00 - 18:00)', icon: <Briefcase size={14} color="var(--indigo-light)" />, count: stats.recruiterHours },
      { key: 'interview_prep', label: 'Interview Prep (08:00 - 22:00)', icon: <Sun size={14} color="var(--amber-primary)" />, count: stats.interviewPrep },
      { key: 'date_range', label: 'Calendar Date Horizons', icon: <Calendar size={14} color="var(--cyan-primary)" />, count: stats.dateRanges },
    ],
    [stats]
  );

  const activeModeItem = useMemo(() => {
    return modeOptions.find((m) => m.key === scheduleTypeFilter) || modeOptions[0];
  }, [modeOptions, scheduleTypeFilter]);

  // Filtering & Search
  const filteredProjects = useMemo(() => {
    return evaluatedProjects.filter((p) => {
      // Search text filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.url.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter === 'active_now') {
        if (!p.enabled || !p.scheduleInfo.isInSchedule) return false;
      } else if (statusFilter === 'resting_now') {
        if (!p.enabled || p.scheduleInfo.isInSchedule) return false;
      } else if (statusFilter === 'paused') {
        if (p.enabled) return false;
      }

      // Schedule Type & Preset filter
      if (scheduleTypeFilter === 'always') {
        const is247 =
          (!p.scheduleMode || p.scheduleMode === 'always') &&
          (!p.dailyStartTime || (p.dailyStartTime === '00:00' && p.dailyEndTime === '23:59')) &&
          !p.scheduleEnd;
        if (!is247) return false;
      } else if (scheduleTypeFilter === 'daily_window') {
        const isDaily =
          p.scheduleMode === 'daily_window' ||
          p.scheduleMode === 'custom_combined' ||
          (p.dailyStartTime && p.dailyEndTime && !(p.dailyStartTime === '00:00' && p.dailyEndTime === '23:59'));
        if (!isDaily) return false;
      } else if (scheduleTypeFilter === 'recruiter') {
        if (!(p.dailyStartTime === '09:00' && p.dailyEndTime === '18:00')) return false;
      } else if (scheduleTypeFilter === 'interview_prep') {
        if (!(p.dailyStartTime === '08:00' && p.dailyEndTime === '22:00')) return false;
      } else if (scheduleTypeFilter === 'date_range') {
        const isDateRange =
          (p.scheduleMode === 'date_range' || p.scheduleMode === 'custom_combined' || (p.scheduleStart && p.scheduleEnd)) &&
          Boolean(p.scheduleEnd);
        if (!isDateRange) return false;
      }

      return true;
    });
  }, [evaluatedProjects, searchQuery, statusFilter, scheduleTypeFilter]);

  const hasActiveFilters = statusFilter !== 'all' || scheduleTypeFilter !== 'all' || Boolean(searchQuery);

  const handleResetFilters = () => {
    setStatusFilter('all');
    setScheduleTypeFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="page-container page-fade-in">
      {/* Page Header Banner */}
      <div className="card schedules-header-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, maxWidth: '100%', flex: '1 1 auto' }}>
          <div
            className="brand-icon-wrapper"
            style={{
              width: '46px',
              height: '46px',
              background: 'linear-gradient(135deg, #a855f7 0%, #c026d3 100%)',
              borderRadius: '14px',
              boxShadow: '0 4px 14px rgba(168, 85, 247, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            <CalendarClock size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>
              Schedules & Automation Rule Matrix
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Configure automated keepalive schedules, operating hours, and date ranges to keep cloud services warm.
            </p>
          </div>
        </div>

        {/* Live Clock & Timezone Widget */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.65rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-sm)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
            <Clock size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                {formattedTime}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ({timeZoneName})
              </span>
            </div>
            <div style={{ fontSize: '0.70rem', color: 'var(--text-secondary)' }}>
              Evaluates against local time
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Stat Cards (Interactive 4-Grid Filter) */}
      <div className="schedule-stats-grid" style={{ marginBottom: '1.25rem' }}>
        {/* Total Monitored Rules */}
        <div
          className="schedule-stat-card"
          onClick={() => {
            setStatusFilter('all');
            setScheduleTypeFilter('all');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'all' && scheduleTypeFilter === 'all' ? '1.5px solid var(--indigo-primary)' : '1px solid var(--border-subtle)',
            boxShadow: statusFilter === 'all' && scheduleTypeFilter === 'all' ? '0 4px 16px rgba(79, 70, 229, 0.15)' : 'var(--shadow-sm)',
            background: statusFilter === 'all' && scheduleTypeFilter === 'all' ? 'rgba(79, 70, 229, 0.04)' : 'var(--bg-card)',
          }}
          title="Click to view all monitored rules"
        >
          <div className="schedule-stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--indigo-light)' }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--indigo-light)', lineHeight: 1.1 }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Total Monitored Rules
            </div>
          </div>
        </div>

        {/* Active Now */}
        <div
          className="schedule-stat-card"
          onClick={() => {
            setStatusFilter(statusFilter === 'active_now' ? 'all' : 'active_now');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'active_now' ? '1.5px solid var(--emerald-light)' : '1px solid var(--border-subtle)',
            boxShadow: statusFilter === 'active_now' ? '0 4px 16px rgba(16, 185, 129, 0.15)' : 'var(--shadow-sm)',
            background: statusFilter === 'active_now' ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
          }}
          title="Click to filter projects actively running right now"
        >
          <div className="schedule-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald-light)' }}>
            <Sun size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--emerald-light)', lineHeight: 1.1 }}>
              {stats.activeNow}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Active Now (In Window)
            </div>
          </div>
        </div>

        {/* Resting / Off-Hours */}
        <div
          className="schedule-stat-card"
          onClick={() => {
            setStatusFilter(statusFilter === 'resting_now' ? 'all' : 'resting_now');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'resting_now' ? '1.5px solid var(--amber-primary)' : '1px solid var(--border-subtle)',
            boxShadow: statusFilter === 'resting_now' ? '0 4px 16px rgba(217, 119, 6, 0.15)' : 'var(--shadow-sm)',
            background: statusFilter === 'resting_now' ? 'rgba(217, 119, 6, 0.04)' : 'var(--bg-card)',
          }}
          title="Click to filter projects resting during off-hours or outside date ranges"
        >
          <div className="schedule-stat-icon" style={{ background: 'rgba(217, 119, 6, 0.1)', color: 'var(--amber-primary)' }}>
            <Moon size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--amber-primary)', lineHeight: 1.1 }}>
              {stats.restingNow}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Resting / Off-Hours
            </div>
          </div>
        </div>

        {/* 24/7 Always Active */}
        <div
          className="schedule-stat-card"
          onClick={() => {
            setScheduleTypeFilter(scheduleTypeFilter === 'always' ? 'all' : 'always');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: scheduleTypeFilter === 'always' ? '1.5px solid var(--cyan-primary)' : '1px solid var(--border-subtle)',
            boxShadow: scheduleTypeFilter === 'always' ? '0 4px 16px rgba(6, 182, 212, 0.15)' : 'var(--shadow-sm)',
            background: scheduleTypeFilter === 'always' ? 'rgba(6, 182, 212, 0.04)' : 'var(--bg-card)',
          }}
          title="Click to filter continuous 24/7 keepalive projects"
        >
          <div className="schedule-stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--cyan-primary)' }}>
            <Infinity size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--cyan-primary)', lineHeight: 1.1 }}>
              {stats.alwaysActive}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              24/7 Continuous
            </div>
          </div>
        </div>
      </div>

      {/* Sleek, Single-Row Filter & Fleet Hub */}
      <div
        className="card"
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
        }}
      >
        {/* Left: Status Segmented Control + Mode Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', maxWidth: '100%' }}>
          {/* Segmented Status Tabs */}
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
              <span>All</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('active_now')}
              style={{
                border: 'none',
                background: statusFilter === 'active_now' ? 'var(--bg-card)' : 'transparent',
                color: statusFilter === 'active_now' ? 'var(--emerald-light)' : 'var(--text-secondary)',
                boxShadow: statusFilter === 'active_now' ? 'var(--shadow-sm)' : 'none',
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
              <span>Active</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('resting_now')}
              style={{
                border: 'none',
                background: statusFilter === 'resting_now' ? 'var(--bg-card)' : 'transparent',
                color: statusFilter === 'resting_now' ? 'var(--amber-primary)' : 'var(--text-secondary)',
                boxShadow: statusFilter === 'resting_now' ? 'var(--shadow-sm)' : 'none',
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
              <Moon size={12} color="var(--amber-primary)" />
              <span>Resting</span>
            </button>

            {stats.paused > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('paused')}
                style={{
                  border: 'none',
                  background: statusFilter === 'paused' ? 'var(--bg-card)' : 'transparent',
                  color: statusFilter === 'paused' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: statusFilter === 'paused' ? 'var(--shadow-sm)' : 'none',
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
                <Power size={12} />
                <span>Paused</span>
              </button>
            )}
          </div>

          {/* Mode Dropdown Selector */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`btn btn-sm ${scheduleTypeFilter !== 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontWeight: 600,
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-pill)',
                padding: '0.38rem 0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              {activeModeItem.icon}
              <span>{activeModeItem.label}</span>
              {scheduleTypeFilter !== 'all' && activeModeItem.count !== undefined && (
                <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>({activeModeItem.count})</span>
              )}
              <ChevronDown
                size={13}
                style={{
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>

            {/* Dropdown Menu Popover */}
            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 60,
                  minWidth: '270px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                  padding: '0.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  animation: 'fadeIn 0.12s ease',
                }}
              >
                <div style={{ padding: '0.35rem 0.65rem 0.25rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Filter by Schedule Architecture:
                </div>
                {modeOptions.map((opt) => {
                  const isSelected = scheduleTypeFilter === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setScheduleTypeFilter(opt.key);
                        setIsDropdownOpen(false);
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        {opt.icon}
                        <span>{opt.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {opt.count !== undefined && (
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.72rem',
                              color: isSelected ? 'var(--indigo-light)' : 'var(--text-muted)',
                              fontWeight: 700,
                            }}
                          >
                            ({opt.count})
                          </span>
                        )}
                        {isSelected && <Check size={13} color="var(--indigo-light)" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reset Filters Chip (Only if active) */}
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

        {/* Right: Search Input + Batch Actions + View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div className="search-input-wrapper" style={{ minWidth: '160px', maxWidth: '100%', position: 'relative' }}>
            <Search className="search-icon" size={13} />
            <input
              id="schedules-search-input"
              name="searchQuery"
              type="text"
              className="search-input"
              placeholder="Search rules or URLs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              style={{ padding: '0.38rem 1.75rem 0.38rem 1.9rem', fontSize: '0.8rem', height: '32px' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
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

          {/* Fleet Batch Controls */}
          {onEnableAll && onDisableAll && projects.length > 0 && (
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
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onEnableAll}
                title="Resume probes for all projects"
                style={{
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  padding: '0.28rem 0.6rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Play size={12} color="var(--emerald-light)" />
                <span>Resume All</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onDisableAll}
                title="Pause probes for all projects"
                style={{
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  padding: '0.28rem 0.6rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Power size={12} color="var(--amber-primary)" />
                <span>Pause All</span>
              </button>
            </div>
          )}

          {/* Table / Grid Switcher */}
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-pill)',
              padding: '2px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <button
              className={`btn btn-icon ${viewLayout === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-pill)' }}
              onClick={() => setViewLayout('table')}
              title="Table Matrix View"
            >
              <TableIcon size={13} />
            </button>
            <button
              className={`btn btn-icon ${viewLayout === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-pill)' }}
              onClick={() => setViewLayout('grid')}
              title="Visual Cards View"
            >
              <LayoutGrid size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <CalendarClock size={32} />
          </div>
          <h3 className="empty-title">
            {projects.length === 0 ? 'No Projects Configured Yet' : 'No Schedules Found'}
          </h3>
          <p className="empty-desc">
            {projects.length === 0
              ? 'Add your project URLs to set up 24/7 keepalive rules, daily interview prep hours, or scheduled calendar windows.'
              : 'No project schedules match your current search and filter criteria.'}
          </p>
          {projects.length === 0 ? (
            <button className="btn btn-primary" onClick={onOpenAddModal}>
              <Plus size={16} />
              <span>Add Your First Project</span>
            </button>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewLayout === 'table' ? (
        /* ==========================================================================
           1. MATRIX TABLE VIEW
           ========================================================================== */
        <div className="schedules-table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Project & Target Endpoint</th>
                <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: '220px' }}>Schedule Configuration</th>
                <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: '260px' }}>
                  24-Hour Timeline & Active Window
                </th>
                <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Interval</th>
                <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stay on Site</th>
                <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Status</th>
                <th style={{ padding: '0.9rem 1.25rem', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => {
                const { scheduleInfo, timeline } = p;
                const hasDateRange = (p.scheduleMode === 'date_range' || p.scheduleMode === 'custom_combined' || (p.scheduleStart && p.scheduleEnd)) && Boolean(p.scheduleEnd);
                const isDailyWindow = p.scheduleMode === 'daily_window' || p.scheduleMode === 'custom_combined' || (p.dailyStartTime && p.dailyEndTime && !(p.dailyStartTime === '00:00' && p.dailyEndTime === '23:59'));
                const is247 = !hasDateRange && !isDailyWindow;

                const dateStartStr = p.scheduleStart ? new Date(p.scheduleStart).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Now';
                const dateEndStr = p.scheduleEnd ? new Date(p.scheduleEnd).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'End';

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease',
                      opacity: p.enabled ? 1 : 0.65,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Project & Endpoint */}
                    <td style={{ padding: '0.9rem 1.25rem' }}>
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
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontFamily: 'var(--font-mono)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          textDecoration: 'none',
                        }}
                        title={p.url}
                      >
                        <Globe size={11} />
                        <span>{p.url.replace(/^https?:\/\//i, '').replace(/\/$/, '')}</span>
                      </a>
                    </td>

                    {/* Schedule Configuration (Dual-Stage Clean Presentation) */}
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          <Calendar size={13} color="var(--cyan-primary)" />
                          <span>{hasDateRange ? `${dateStartStr} → ${dateEndStr}` : 'Permanent (No Expiration)'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--indigo-light)', fontWeight: 600 }}>
                          <Sun size={13} color="var(--indigo-light)" />
                          <span>{isDailyWindow ? `${formatTime12h(p.dailyStartTime)} - ${formatTime12h(p.dailyEndTime)}` : '24/7 All Day (Continuous)'}</span>
                        </div>
                      </div>
                    </td>

                    {/* 24-Hour Timeline & Window Details */}
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      {is247 ? (
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald-light)', marginBottom: '0.2rem' }}>
                            Continuous 24/7 Probe Cycle
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                            No resting periods <br /> Keeps instances hot non-stop
                          </div>
                        </div>
                      ) : isDailyWindow ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {timeline.startFormatted} — {timeline.endFormatted}
                            </span>
                            <span
                              style={{
                                fontSize: '0.74rem',
                                color: timeline.inWindow ? 'var(--emerald-light)' : 'var(--amber-primary)',
                                fontWeight: 600,
                              }}
                            >
                              {timeline.countdownText}
                            </span>
                          </div>

                          {/* Mini Timeline Track */}
                          <div className="schedule-timeline-track" title="24-Hour Active Window Tracker">
                            <div
                              className="schedule-timeline-window"
                              style={{
                                left: `${timeline.startPercent}%`,
                                width: `${Math.max(4, timeline.endPercent - timeline.startPercent)}%`,
                              }}
                            />
                            <div
                              className="schedule-timeline-now"
                              style={{ left: `${timeline.currentPercent}%` }}
                              title={`Current Time: ${formattedTime}`}
                            />
                          </div>

                          <div className="schedule-timeline-labels">
                            <span>00:00</span>
                            <span>12:00</span>
                            <span>24:00</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {dateStartStr} → {dateEndStr}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                            {timeline.countdownText}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Interval */}
                    <td style={{ padding: '0.9rem 1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--indigo-light)', fontWeight: 700, fontSize: '0.82rem' }}>
                      Every {p.interval || 10}m
                    </td>

                    {/* Stay on Site */}
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Flame size={13} color="var(--amber-primary)" />
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber-primary)', fontWeight: 700, fontSize: '0.82rem' }}>
                          {p.stayDuration || 60}s
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {p.stayMode === 'tab' ? 'Auto-Tab' : 'Silent Frame'}
                      </div>
                    </td>

                    {/* Current Status */}
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      {!p.enabled ? (
                        <span
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontWeight: 600,
                          }}
                        >
                          <Power size={13} /> Paused
                        </span>
                      ) : scheduleInfo.isInSchedule ? (
                        <span
                          style={{
                            color: 'var(--emerald-light)',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontWeight: 700,
                          }}
                        >
                          <Sun size={14} /> Active Window
                        </span>
                      ) : (
                        <span
                          style={{
                            color: 'var(--amber-primary)',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontWeight: 700,
                          }}
                        >
                          <Moon size={14} /> Sleeping (Off-Hours)
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          style={{ width: '28px', height: '28px' }}
                          onClick={() => onEdit(p)}
                          title="Edit Schedule & Timers"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{
                            width: '28px',
                            height: '28px',
                            color: p.enabled ? 'var(--emerald-light)' : 'var(--text-muted)',
                          }}
                          onClick={() => onToggle(p.id)}
                          title={p.enabled ? 'Pause Project' : 'Resume Project'}
                        >
                          <Power size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ==========================================================================
           2. VISUAL CARDS GRID VIEW
           ========================================================================== */
        <div className="schedule-grid" style={{ marginBottom: '2rem' }}>
          {filteredProjects.map((p) => {
            const { scheduleInfo, timeline } = p;
            const hasDateRange = (p.scheduleMode === 'date_range' || p.scheduleMode === 'custom_combined' || (p.scheduleStart && p.scheduleEnd)) && Boolean(p.scheduleEnd);
            const isDailyWindow = p.scheduleMode === 'daily_window' || p.scheduleMode === 'custom_combined' || (p.dailyStartTime && p.dailyEndTime && !(p.dailyStartTime === '00:00' && p.dailyEndTime === '23:59'));
            const is247 = !hasDateRange && !isDailyWindow;

            const dateStartStr = p.scheduleStart ? new Date(p.scheduleStart).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Now';
            const dateEndStr = p.scheduleEnd ? new Date(p.scheduleEnd).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'End';

            return (
              <div
                key={p.id}
                className="schedule-card"
                style={{
                  opacity: p.enabled ? 1 : 0.65,
                }}
              >
                {/* Card Top Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                      {p.name}
                    </h4>
                    <div
                      style={{
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        maxWidth: '220px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={p.url}
                    >
                      {p.url}
                    </div>
                  </div>
                </div>

                {/* Connected 2-Stage Schedule Strip */}
                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.55rem 0.75rem',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.74rem',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={13} color="var(--cyan-primary)" />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {hasDateRange ? `${dateStartStr} → ${dateEndStr}` : 'Permanent (Always)'}
                    </span>
                  </div>
                  <ArrowRight size={12} color="var(--text-muted)" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Sun size={13} color="var(--indigo-light)" />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isDailyWindow ? `${formatTime12h(p.dailyStartTime)} - ${formatTime12h(p.dailyEndTime)}` : '24/7 All Day'}
                    </span>
                  </div>
                </div>

                {/* Timeline Box */}
                <div className="schedule-timeline-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {is247
                        ? '24/7 Continuous Cycle'
                        : isDailyWindow
                        ? `${timeline.startFormatted} — ${timeline.endFormatted}`
                        : 'Calendar Date Range Horizon'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: timeline.inWindow ? 'var(--emerald-light)' : 'var(--amber-primary)',
                      }}
                    >
                      {timeline.statusBadge}
                    </span>
                  </div>

                  {isDailyWindow && (
                    <>
                      <div className="schedule-timeline-track" title="24-Hour Active Window Tracker">
                        <div
                          className="schedule-timeline-window"
                          style={{
                            left: `${timeline.startPercent}%`,
                            width: `${Math.max(4, timeline.endPercent - timeline.startPercent)}%`,
                          }}
                        />
                        <div
                          className="schedule-timeline-now"
                          style={{ left: `${timeline.currentPercent}%` }}
                          title={`Current Time: ${formattedTime}`}
                        />
                      </div>
                      <div className="schedule-timeline-labels">
                        <span>00:00</span>
                        <span>12:00</span>
                        <span>24:00</span>
                      </div>
                    </>
                  )}

                  <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {timeline.countdownText}
                  </div>
                </div>

                {/* Parameters Matrix (Interval & Stay) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.65rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Interval (Phase 2)</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--indigo-light)', fontSize: '0.85rem' }}>
                      Every {p.interval || 10}m
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Stay (Phase 1)</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--amber-primary)', fontSize: '0.85rem' }}>
                      {p.stayDuration || 60}s ({p.stayMode === 'tab' ? 'Tab' : 'Frame'})
                    </div>
                  </div>
                </div>

                {/* Card Action Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem' }}>
                  <div>
                    {!p.enabled ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Power size={13} /> Paused
                      </span>
                    ) : scheduleInfo.isInSchedule ? (
                      <span style={{ color: 'var(--emerald-light)', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Sun size={14} /> Active Window
                      </span>
                    ) : (
                      <span style={{ color: 'var(--amber-primary)', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Moon size={14} /> Sleeping (Off-Hours)
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ width: '28px', height: '28px' }}
                      onClick={() => onEdit(p)}
                      title="Edit Schedule & Timers"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon"
                      style={{
                        width: '28px',
                        height: '28px',
                        color: p.enabled ? 'var(--emerald-light)' : 'var(--text-muted)',
                      }}
                      onClick={() => onToggle(p.id)}
                      title={p.enabled ? 'Pause Project' : 'Resume Project'}
                    >
                      <Power size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rule Best Practices & Operational Explainer */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.04) 0%, rgba(6, 182, 212, 0.04) 100%)',
          borderColor: 'var(--border-subtle)',
          padding: '1.4rem 1.65rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Info size={19} color="var(--indigo-light)" />
          <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Automation Rules & Keepalive Best Practices
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.15rem' }}>
          <div style={{ background: 'var(--bg-card)', padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h5 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--indigo-light)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Briefcase size={14} /> 1. Conserve Cloud Quota With Daily Windows
            </h5>
            <p style={{ fontSize: '0.79rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              Use <strong>Daily Operating Hours</strong> (e.g. 09:00 - 18:00) during interview weeks. pulseOps automatically sleeps during nights and off-hours so you never burn unnecessary server compute hours.
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h5 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--amber-primary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Flame size={14} /> 2. Dual-Phase Sequential Keepalive
            </h5>
            <p style={{ fontSize: '0.79rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              When a probe triggers, <strong>Phase 1 (Stay on Site)</strong> maintains an active session for your duration (e.g. 60s). Only after Phase 1 finishes does <strong>Phase 2 (Interval Countdown)</strong> begin.
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1rem 1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h5 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--emerald-light)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} /> 3. Calendar Date Windows For Deadlines
            </h5>
            <p style={{ fontSize: '0.79rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              Set a <strong>Calendar Date Range</strong> (e.g. Next 14 Days) for application reviews. The rule runs automatically during those dates and gracefully expires with zero manual cleanup required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
