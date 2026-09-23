import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Globe,
  Clock,
  Calendar,
  Flame,
  Check,
  CheckCircle2,
  ArrowRight,
  Radio,
  RotateCcw,
  Sliders,
  CalendarClock,
  Infinity as InfinityIcon,
  Sun,
  Briefcase,
} from 'lucide-react';
import { isValidUrl, normalizeUrl } from '../utils/projectChecker';

const INTERVAL_PRESETS = [
  { label: '1 min', value: 1 },
  { label: '5 mins', value: 5 },
  { label: '10 mins (Recommended)', value: 10 },
  { label: '15 mins', value: 15 },
  { label: '30 mins', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
];

const STAY_PRESETS = [
  { label: '0s (Instant)', value: 0 },
  { label: '30 sec', value: 30 },
  { label: '1 min (Default)', value: 60 },
  { label: '2 mins', value: 120 },
  { label: '3 mins', value: 180 },
  { label: '5 mins', value: 300 },
];

export default function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialProject = null,
}) {
  const isEditing = Boolean(initialProject);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [interval, setInterval] = useState(10);
  const [customInterval, setCustomInterval] = useState('');
  const [isCustomInterval, setIsCustomInterval] = useState(false);

  // Stay Duration & Background Processing
  const [stayDuration, setStayDuration] = useState(60); // in seconds
  const [customStaySec, setCustomStaySec] = useState('');
  const [isCustomStay, setIsCustomStay] = useState(false);
  const [stayMode, setStayMode] = useState('background'); // 'background' | 'tab'
  const [enabled, setEnabled] = useState(true);

  // Unified Schedule Controls (1. Date Range + 2. Daily Hours)
  // Date Range Mode: 'always' | 'next_7' | 'next_14' | 'next_30' | 'custom'
  const [dateMode, setDateMode] = useState('always');
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');

  // Daily Hours Mode: '24_7' | 'recruiter' | 'interview_prep' | 'custom'
  const [dailyMode, setDailyMode] = useState('24_7');
  const [dailyStartTime, setDailyStartTime] = useState('09:00');
  const [dailyEndTime, setDailyEndTime] = useState('18:00');

  const [errors, setErrors] = useState({});

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

  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name || '');
      setUrl(initialProject.url || '');
      setEnabled(initialProject.enabled ?? true);

      // Interval setup
      const projInterval = Number(initialProject.interval) || 10;
      const matchingPreset = INTERVAL_PRESETS.find((p) => p.value === projInterval);
      if (matchingPreset) {
        setInterval(projInterval);
        setIsCustomInterval(false);
      } else {
        setInterval(projInterval);
        setCustomInterval(String(projInterval));
        setIsCustomInterval(true);
      }

      // Stay Duration setup (default 60s)
      const projStay = initialProject.stayDuration !== undefined ? Number(initialProject.stayDuration) : 60;
      const matchingStay = STAY_PRESETS.find((p) => p.value === projStay);
      if (matchingStay) {
        setStayDuration(projStay);
        setIsCustomStay(false);
      } else {
        setStayDuration(projStay);
        setCustomStaySec(String(projStay));
        setIsCustomStay(true);
      }
      setStayMode(initialProject.stayMode || (initialProject.autoOpenTab ? 'tab' : 'background'));

      // Date Range Setup
      if (initialProject.scheduleStart && initialProject.scheduleEnd) {
        setDateMode('custom');
        setScheduleStart(initialProject.scheduleStart);
        setScheduleEnd(initialProject.scheduleEnd);
      } else {
        setDateMode('always');
        setScheduleStart('');
        setScheduleEnd('');
      }

      // Daily Hours Setup
      const s = initialProject.dailyStartTime;
      const e = initialProject.dailyEndTime;
      if (initialProject.scheduleMode === 'daily_window' || (s && e && !(s === '00:00' && e === '23:59'))) {
        setDailyStartTime(s || '09:00');
        setDailyEndTime(e || '18:00');
        if (s === '09:00' && e === '18:00') setDailyMode('recruiter');
        else if (s === '08:00' && e === '22:00') setDailyMode('interview_prep');
        else setDailyMode('custom');
      } else {
        setDailyMode('24_7');
        setDailyStartTime('09:00');
        setDailyEndTime('18:00');
      }
    } else {
      setName('');
      setUrl('');
      setInterval(10);
      setCustomInterval('');
      setIsCustomInterval(false);
      setStayDuration(60);
      setCustomStaySec('');
      setIsCustomStay(false);
      setStayMode('background');
      setEnabled(true);
      setDateMode('always');
      setScheduleStart('');
      setScheduleEnd('');
      setDailyMode('24_7');
      setDailyStartTime('09:00');
      setDailyEndTime('18:00');
    }
    setErrors({});
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const isUrlValid = url.trim() ? isValidUrl(url) : null;

  const applyDatePreset = (days, modeKey) => {
    const start = new Date();
    const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const formatDt = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setScheduleStart(formatDt(start));
    setScheduleEnd(formatDt(end));
    setDateMode(modeKey);
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Project name is required';
    }
    if (!url.trim()) {
      errs.url = 'Project URL endpoint is required';
    } else if (!isValidUrl(url)) {
      errs.url = 'Please enter a valid URL (e.g. https://my-app.onrender.com)';
    }

    const currentInterval = isCustomInterval ? Number(customInterval) : Number(interval);
    if (!currentInterval || currentInterval < 1 || currentInterval > 1440) {
      errs.interval = 'Interval must be between 1 and 1440 minutes';
    }

    const currentStay = isCustomStay ? Number(customStaySec) : Number(stayDuration);
    if (isNaN(currentStay) || currentStay < 0 || currentStay > 3600) {
      errs.stay = 'Stay duration must be between 0 and 3600 seconds';
    }

    if (dateMode !== 'always') {
      if (scheduleStart && scheduleEnd) {
        if (new Date(scheduleStart) >= new Date(scheduleEnd)) {
          errs.schedule = 'End Date & Time must be after Start Date & Time';
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const finalInterval = isCustomInterval ? Number(customInterval) : Number(interval);
    const finalStaySec = isCustomStay ? Number(customStaySec) : Number(stayDuration);

    let finalScheduleMode = 'always';
    let finalScheduleStart = '';
    let finalScheduleEnd = '';
    let finalDailyStart = '00:00';
    let finalDailyEnd = '23:59';

    if (dateMode !== 'always') {
      finalScheduleMode = 'date_range';
      finalScheduleStart = scheduleStart;
      finalScheduleEnd = scheduleEnd;
    }

    if (dateMode !== 'always' && dailyMode !== '24_7') {
      finalScheduleMode = 'custom_combined';
    } else if (dateMode !== 'always') {
      finalScheduleMode = 'date_range';
    } else if (dailyMode !== '24_7') {
      finalScheduleMode = 'daily_window';
    } else {
      finalScheduleMode = 'always';
    }

    if (dailyMode !== '24_7') {
      finalDailyStart = dailyStartTime;
      finalDailyEnd = dailyEndTime;
    }

    onSubmit({
      name: name.trim(),
      url: normalizeUrl(url),
      interval: finalInterval,
      stayDuration: finalStaySec,
      stayMode,
      autoOpenTab: stayMode === 'tab',
      enabled,
      scheduleMode: finalScheduleMode,
      scheduleStart: finalScheduleStart,
      scheduleEnd: finalScheduleEnd,
      dailyStartTime: finalDailyStart,
      dailyEndTime: finalDailyEnd,
    });

    onClose();
  };

  const formatTime12hShort = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m || 0).padStart(2, '0')} ${period}`;
  };

  const formatDateShort = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const activeStaySec = isCustomStay ? Number(customStaySec) || 0 : Number(stayDuration) || 0;
  const activeIntervalMin = isCustomInterval ? Number(customInterval) || 0 : Number(interval) || 0;

  // Computed live summary labels
  const dateSummaryLabel = dateMode === 'always'
    ? 'Permanent (Always Active)'
    : scheduleStart && scheduleEnd
    ? `${formatDateShort(scheduleStart)} → ${formatDateShort(scheduleEnd)}`
    : 'Date Window Selected';

  const dailySummaryLabel = dailyMode === '24_7'
    ? '24/7 Continuous (All Day)'
    : `${formatTime12hShort(dailyStartTime)} - ${formatTime12hShort(dailyEndTime)}`;

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
                  background: isEditing ? 'var(--gradient-accent)' : 'var(--gradient-brand)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: isEditing
                    ? '0 4px 12px rgba(6, 182, 212, 0.3)'
                    : '0 4px 12px rgba(79, 70, 229, 0.3)',
                }}
              >
                {isEditing ? <Sliders size={18} /> : <Plus size={18} />}
              </div>
              <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {isEditing ? 'Configure Project Keepalive' : 'Add Project to Fleet'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Section 1: Identity & Endpoint */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <Globe size={16} color="var(--indigo-light)" />
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                1. Target Service Endpoint
              </span>
            </div>

            {/* Project Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                Project / Service Name <span style={{ color: 'var(--rose-primary)' }}>*</span>
              </label>
              <input
                id="project-name-input"
                name="projectName"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="e.g. Portfolio Backend (Render), Auth API"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ fontSize: '0.88rem', padding: '0.55rem 0.85rem' }}
                autoFocus={!isEditing}
              />
              {errors.name && <span className="form-error-msg">{errors.name}</span>}
            </div>

            {/* URL Endpoint */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                Full URL Endpoint <span style={{ color: 'var(--rose-primary)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="project-url-input"
                  name="projectUrl"
                  type="text"
                  className={`form-input ${errors.url ? 'error' : ''}`}
                  placeholder="https://my-app.onrender.com/health"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '0.55rem 2.2rem 0.55rem 0.85rem',
                  }}
                />
                {isUrlValid !== null && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {isUrlValid ? (
                      <CheckCircle2 size={16} color="var(--emerald-light)" />
                    ) : (
                      <span style={{ color: 'var(--rose-primary)', fontSize: '0.7rem', fontWeight: 700 }}>
                        Invalid
                      </span>
                    )}
                  </div>
                )}
              </div>
              {errors.url ? (
                <span className="form-error-msg">{errors.url}</span>
              ) : (
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                  Supports Render, Railway, Fly.io, Vercel, Heroku, Supabase, or any HTTP endpoint.
                </span>
              )}
            </div>
          </div>

          {/* Section 2: Timing, Keepalive Interval & Stay Duration */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Clock size={16} color="var(--indigo-light)" />
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  2. Keepalive Cycle & Stay Duration
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: 'var(--indigo-light)',
                  background: 'rgba(79, 70, 229, 0.1)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                Every {activeIntervalMin}m • Stay {activeStaySec}s
              </span>
            </div>

            {/* Stay Duration Presets (Phase 1) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Flame size={14} color="var(--amber-primary)" />
                  <span>Phase 1: Stay Active on Site Duration</span>
                </label>
                <span style={{ fontSize: '0.73rem', color: 'var(--amber-primary)', fontWeight: 600 }}>
                  Keeps free dyno hot
                </span>
              </div>

              {/* High-Contrast Stay Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.65rem' }}>
                {STAY_PRESETS.map((preset) => {
                  const isSelected = !isCustomStay && stayDuration === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => {
                        setStayDuration(preset.value);
                        setIsCustomStay(false);
                      }}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        border: isSelected ? '1.5px solid var(--amber-primary)' : '1px solid var(--border-medium)',
                        background: isSelected ? 'var(--amber-primary)' : 'var(--bg-card)',
                        color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        boxShadow: isSelected ? '0 2px 10px rgba(217, 119, 6, 0.35)' : 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                      <span>{preset.label}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsCustomStay(true)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isCustomStay ? '1.5px solid var(--amber-primary)' : '1px solid var(--border-medium)',
                    background: isCustomStay ? 'var(--amber-primary)' : 'var(--bg-card)',
                    color: isCustomStay ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: isCustomStay ? '0 2px 10px rgba(217, 119, 6, 0.35)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  {isCustomStay && <Check size={13} strokeWidth={3} />}
                  <span>Custom Seconds</span>
                </button>
              </div>

              {/* If Custom Stay is active */}
              {isCustomStay && (
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    marginBottom: '0.85rem',
                    animation: 'fadeIn 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber-primary)' }}>
                    Enter Custom Stay:
                  </span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input
                      id="custom-stay-sec-input"
                      name="customStaySec"
                      type="number"
                      min="0"
                      max="3600"
                      className="form-input"
                      style={{ width: '100px', padding: '0.35rem 0.65rem', fontSize: '0.84rem', fontWeight: 700 }}
                      placeholder="e.g. 45"
                      value={customStaySec}
                      onChange={(e) => setCustomStaySec(e.target.value)}
                      autoFocus
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      seconds
                    </span>
                  </div>
                </div>
              )}

              {/* Stay Execution Mode (Background vs Auto-Tab) */}
              <div className="modal-grid-2col" style={{ marginTop: '0.4rem' }}>
                <div
                  onClick={() => setStayMode('background')}
                  style={{
                    border: stayMode === 'background' ? '1.5px solid var(--indigo-primary)' : '1px solid var(--border-subtle)',
                    background: stayMode === 'background' ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <Radio size={14} color={stayMode === 'background' ? 'var(--indigo-light)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: stayMode === 'background' ? 'var(--indigo-light)' : 'var(--text-primary)' }}>
                      Silent Background Frame
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.3 }}>
                    Keeps the site connection alive silently inside the dashboard without popups.
                  </p>
                </div>

                <div
                  onClick={() => setStayMode('tab')}
                  style={{
                    border: stayMode === 'tab' ? '1.5px solid var(--indigo-primary)' : '1px solid var(--border-subtle)',
                    background: stayMode === 'tab' ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <Radio size={14} color={stayMode === 'tab' ? 'var(--indigo-light)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: stayMode === 'tab' ? 'var(--indigo-light)' : 'var(--text-primary)' }}>
                      Auto-Tab (Recruiter Mode)
                    </span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.3 }}>
                    Spawns tab, stays for duration, then auto-closes when countdown hits zero.
                  </p>
                </div>
              </div>
            </div>

            {/* Keepalive Interval Presets (Phase 2) */}
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} color="var(--indigo-light)" />
                  <span>Phase 2: Ping Frequency (Repeat Interval)</span>
                </label>
                <span style={{ fontSize: '0.73rem', color: 'var(--indigo-light)', fontWeight: 600 }}>
                  Countdown between probes
                </span>
              </div>

              {/* High-Contrast Interval Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.65rem' }}>
                {INTERVAL_PRESETS.map((preset) => {
                  const isSelected = !isCustomInterval && interval === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => {
                        setInterval(preset.value);
                        setIsCustomInterval(false);
                      }}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        border: isSelected ? '1.5px solid var(--indigo-primary)' : '1px solid var(--border-medium)',
                        background: isSelected ? 'var(--indigo-primary)' : 'var(--bg-card)',
                        color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        boxShadow: isSelected ? '0 2px 10px rgba(79, 70, 229, 0.35)' : 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                      <span>{preset.label}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsCustomInterval(true)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isCustomInterval ? '1.5px solid var(--indigo-primary)' : '1px solid var(--border-medium)',
                    background: isCustomInterval ? 'var(--indigo-primary)' : 'var(--bg-card)',
                    color: isCustomInterval ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: isCustomInterval ? '0 2px 10px rgba(79, 70, 229, 0.35)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  {isCustomInterval && <Check size={13} strokeWidth={3} />}
                  <span>Custom Minutes</span>
                </button>
              </div>

              {/* If Custom Minutes is active */}
              {isCustomInterval && (
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(79, 70, 229, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    marginBottom: '0.85rem',
                    animation: 'fadeIn 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--indigo-light)' }}>
                    Enter Interval:
                  </span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input
                      id="custom-interval-input"
                      name="customInterval"
                      type="number"
                      min="1"
                      max="1440"
                      className="form-input"
                      style={{ width: '100px', padding: '0.35rem 0.65rem', fontSize: '0.84rem', fontWeight: 700 }}
                      placeholder="e.g. 20"
                      value={customInterval}
                      onChange={(e) => setCustomInterval(e.target.value)}
                      autoFocus
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      minutes
                    </span>
                  </div>
                </div>
              )}
              {errors.interval && <span className="form-error-msg">{errors.interval}</span>}
            </div>

            {/* Lifecycle Sequence Preview Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                fontSize: '0.76rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-secondary)',
                padding: '0.55rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                <Flame size={13} color="var(--amber-primary)" /> 1. Stay Active ({activeStaySec}s)
              </span>
              <ArrowRight size={12} color="var(--text-muted)" />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                <Clock size={13} color="var(--indigo-light)" /> 2. Interval ({activeIntervalMin}m)
              </span>
              <ArrowRight size={12} color="var(--text-muted)" />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: 'var(--emerald-light)' }}>
                <RotateCcw size={13} /> 3. Re-warm Dyno
              </span>
            </div>
          </div>

          {/* Section 3: Unified Operating Schedule & Automation Pipeline (Date Range + Daily Hours) */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.35rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Section 3 Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarClock size={18} color="var(--cyan-primary)" />
                <div>
                  <span style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-primary)', display: 'block' }}>
                    3. Operating Schedule & Active Window
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Connected Pipeline Banner */}
            <div className="modal-pipeline-banner">
              <div>
                <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
                  1. Active Dates
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--cyan-primary)', marginTop: '2px' }}>
                  {dateSummaryLabel}
                </div>
              </div>

              <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={16} />
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
                  2. Daily Probing Hours
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--indigo-light)', marginTop: '2px' }}>
                  {dailySummaryLabel}
                </div>
              </div>
            </div>

            {/* STAGE 1: ACTIVE CALENDAR DATE RANGE */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'var(--cyan-primary)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    1
                  </span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Set Calendar Date Range (Horizon)
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', color: dateMode === 'always' ? 'var(--emerald-light)' : 'var(--cyan-primary)', fontWeight: 700 }}>
                  {dateMode === 'always' ? 'Permanent Always' : 'Scheduled Date Window'}
                </span>
              </div>

              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.65rem', lineHeight: 1.35 }}>
                Choose whether this service rule runs continuously forever without an expiration date, or only during specific calendar dates.
              </p>

              {/* High-Contrast Date Range Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setDateMode('always');
                    setScheduleStart('');
                    setScheduleEnd('');
                  }}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: dateMode === 'always' ? '1.5px solid var(--emerald-light)' : '1px solid var(--border-medium)',
                    background: dateMode === 'always' ? 'var(--emerald-light)' : 'var(--bg-secondary)',
                    color: dateMode === 'always' ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: dateMode === 'always' ? '0 2px 10px rgba(16, 185, 129, 0.35)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <InfinityIcon size={13} />
                  <span>Permanent (Always Active)</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyDatePreset(7, 'next_7')}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: dateMode === 'next_7' ? '1.5px solid var(--cyan-primary)' : '1px solid var(--border-medium)',
                    background: dateMode === 'next_7' ? 'var(--cyan-primary)' : 'var(--bg-secondary)',
                    color: dateMode === 'next_7' ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: dateMode === 'next_7' ? '0 2px 10px rgba(6, 182, 212, 0.35)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Calendar size={13} />
                  <span>Next 7 Days</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyDatePreset(14, 'next_14')}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: dateMode === 'next_14' ? '1.5px solid var(--cyan-primary)' : '1px solid var(--border-medium)',
                    background: dateMode === 'next_14' ? 'var(--cyan-primary)' : 'var(--bg-secondary)',
                    color: dateMode === 'next_14' ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: dateMode === 'next_14' ? '0 2px 10px rgba(6, 182, 212, 0.35)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Calendar size={13} />
                  <span>Next 14 Days</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyDatePreset(30, 'next_30')}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: dateMode === 'next_30' ? '1.5px solid var(--cyan-primary)' : '1px solid var(--border-medium)',
                    background: dateMode === 'next_30' ? 'var(--cyan-primary)' : 'var(--bg-secondary)',
                    color: dateMode === 'next_30' ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: dateMode === 'next_30' ? '0 2px 10px rgba(6, 182, 212, 0.35)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Calendar size={13} />
                  <span>Next 30 Days</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDateMode('custom')}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: dateMode === 'custom' ? '1.5px solid var(--cyan-primary)' : '1px solid var(--border-medium)',
                    background: dateMode === 'custom' ? 'var(--cyan-primary)' : 'var(--bg-secondary)',
                    color: dateMode === 'custom' ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: dateMode === 'custom' ? '0 2px 10px rgba(6, 182, 212, 0.35)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <CalendarClock size={13} />
                  <span>Custom Dates</span>
                </button>
              </div>

              {/* Date pickers when not perpetual */}
              {dateMode !== 'always' && (
                <div
                  className="modal-grid-2col"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.85rem',
                    animation: 'fadeIn 0.15s ease',
                  }}
                >
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                      Start Date & Time
                    </label>
                    <input
                      id="schedule-start-input"
                      name="scheduleStart"
                      type="datetime-local"
                      className="form-input"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', fontWeight: 600 }}
                      value={scheduleStart}
                      onChange={(e) => {
                        setScheduleStart(e.target.value);
                        setDateMode('custom');
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                      End Date & Time
                    </label>
                    <input
                      id="schedule-end-input"
                      name="scheduleEnd"
                      type="datetime-local"
                      className="form-input"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem', fontWeight: 600 }}
                      value={scheduleEnd}
                      onChange={(e) => {
                        setScheduleEnd(e.target.value);
                        setDateMode('custom');
                      }}
                    />
                  </div>
                </div>
              )}
              {errors.schedule && <span className="form-error-msg">{errors.schedule}</span>}
            </div>

            {/* STAGE CONNECTOR INDICATOR */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '-0.3rem 0',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--indigo-light)',
                  background: 'var(--bg-secondary)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                ↓ Then Configure Daily Active Hours
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
            </div>

            {/* STAGE 2: DAILY OPERATING HOURS */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'var(--indigo-primary)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    2
                  </span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Set Daily Operating Hours (Time of Day)
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', color: dailyMode === '24_7' ? 'var(--emerald-light)' : 'var(--indigo-light)', fontWeight: 700 }}>
                  {dailyMode === '24_7' ? '24/7 Continuous' : `${formatTime12hShort(dailyStartTime)} - ${formatTime12hShort(dailyEndTime)}`}
                </span>
              </div>

              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.65rem', lineHeight: 1.35 }}>
                During the active calendar dates above, specify what hours each day pulseOps should actively ping and keep your dynos warm.
              </p>

              {/* High-Contrast Daily Hours Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setDailyMode('24_7');
                    setDailyStartTime('00:00');
                    setDailyEndTime('23:59');
                  }}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: dailyMode === '24_7' ? '1.5px solid var(--emerald-light)' : '1px solid var(--border-medium)',
                    background: dailyMode === '24_7' ? 'var(--emerald-light)' : 'var(--bg-secondary)',
                    color: dailyMode === '24_7' ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: dailyMode === '24_7' ? '0 2px 10px rgba(16, 185, 129, 0.35)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <InfinityIcon size={13} />
                  <span>24/7 Continuous (All Day)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDailyMode('recruiter');
                    setDailyStartTime('09:00');
                    setDailyEndTime('18:00');
                  }}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: dailyMode === 'recruiter' ? '1.5px solid var(--indigo-primary)' : '1px solid var(--border-medium)',
                    background: dailyMode === 'recruiter' ? 'var(--indigo-primary)' : 'var(--bg-secondary)',
                    color: dailyMode === 'recruiter' ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: dailyMode === 'recruiter' ? '0 2px 10px rgba(79, 70, 229, 0.35)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Briefcase size={13} />
                  <span>Recruiter Hours (09:00 - 18:00)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDailyMode('interview_prep');
                    setDailyStartTime('08:00');
                    setDailyEndTime('22:00');
                  }}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: dailyMode === 'interview_prep' ? '1.5px solid var(--amber-primary)' : '1px solid var(--border-medium)',
                    background: dailyMode === 'interview_prep' ? 'var(--amber-primary)' : 'var(--bg-secondary)',
                    color: dailyMode === 'interview_prep' ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: dailyMode === 'interview_prep' ? '0 2px 10px rgba(217, 119, 6, 0.35)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Sun size={13} />
                  <span>Extended / Interview Prep (08:00 - 22:00)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDailyMode('custom')}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: dailyMode === 'custom' ? '1.5px solid var(--indigo-primary)' : '1px solid var(--border-medium)',
                    background: dailyMode === 'custom' ? 'var(--indigo-primary)' : 'var(--bg-secondary)',
                    color: dailyMode === 'custom' ? '#ffffff' : 'var(--text-primary)',
                    boxShadow: dailyMode === 'custom' ? '0 2px 10px rgba(79, 70, 229, 0.35)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Clock size={13} />
                  <span>Custom Hours</span>
                </button>
              </div>

              {/* Time inputs when not 24/7 */}
              {dailyMode !== '24_7' && (
                <div
                  className="modal-grid-2col"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid rgba(79, 70, 229, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.85rem',
                    animation: 'fadeIn 0.15s ease',
                  }}
                >
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                      Daily Start Time ({formatTime12hShort(dailyStartTime)})
                    </label>
                    <input
                      id="daily-start-time-input"
                      name="dailyStartTime"
                      type="time"
                      className="form-input"
                      style={{ fontSize: '0.82rem', padding: '0.35rem 0.6rem', fontWeight: 700 }}
                      value={dailyStartTime}
                      onChange={(e) => {
                        setDailyStartTime(e.target.value);
                        setDailyMode('custom');
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                      Daily End Time ({formatTime12hShort(dailyEndTime)})
                    </label>
                    <input
                      id="daily-end-time-input"
                      name="dailyEndTime"
                      type="time"
                      className="form-input"
                      style={{ fontSize: '0.82rem', padding: '0.35rem 0.6rem', fontWeight: 700 }}
                      value={dailyEndTime}
                      onChange={(e) => {
                        setDailyEndTime(e.target.value);
                        setDailyMode('custom');
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div
            className="modal-actions modal-actions-responsive"
            style={{
              marginTop: '0.65rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            {/* Enabled toggle status */}
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: enabled ? 'var(--emerald-light)' : 'var(--text-muted)',
              }}
            >
              <input
                id="project-modal-enabled"
                name="enabled"
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                style={{ accentColor: 'var(--emerald-light)', width: '15px', height: '15px' }}
              />
              <span>{enabled ? 'Active & Primed' : 'Created as Paused'}</span>
            </label>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose} style={{ fontWeight: 600 }}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  fontWeight: 700,
                  background: isEditing ? 'var(--gradient-accent)' : 'var(--gradient-brand)',
                }}
              >
                {isEditing ? <Check size={15} /> : <Plus size={15} />}
                <span>{isEditing ? 'Save Changes' : 'Add to Fleet'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
