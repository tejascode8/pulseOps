import React, { useMemo, useState } from 'react';
import {
  ExternalLink,
  RefreshCw,
  Edit2,
  Trash2,
  Clock,
  Globe,
  Check,
  Copy,
  Flame,
  RotateCcw,
  Moon,
} from 'lucide-react';
import { normalizeUrl } from '../utils/projectChecker';
import { checkScheduleStatus, formatScheduleSummary } from '../utils/scheduleHelper';

export default function ProjectCard({
  project,
  now,
  isChecking,
  activeStaySession,
  onPing,
  onRestart,
  onEdit,
  onDelete,
  onToggle,
}) {
  const [copied, setCopied] = useState(false);

  // Copy URL to clipboard
  const handleCopyUrl = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(project.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePingCard = (e) => {
    e.stopPropagation();
    onPing(project.id, true);
  };

  const handleRestartCard = (e) => {
    e.stopPropagation();
    if (onRestart) onRestart(project.id);
  };

  const handleOpenUrl = (e) => {
    e.stopPropagation();
    window.open(normalizeUrl(project.url), '_blank', 'noopener,noreferrer');
  };

  // Phase 1: Stay Countdown Calculation (Active stay on site before interval)
  const stayCountdown = useMemo(() => {
    if (!activeStaySession) return null;
    const durationSec = Number(
      activeStaySession.durationSec ||
      activeStaySession.stayDurationSec ||
      project.stayDuration ||
      60
    );
    const stayUntil = Number(
      activeStaySession.stayUntil || (now + durationSec * 1000)
    );

    const remainingMs = Math.max(0, stayUntil - now);
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
    const elapsedSec = Math.max(0, durationSec - remainingSec);
    const percent = Math.min(100, Math.max(0, (elapsedSec / durationSec) * 100));

    const mins = Math.floor(remainingSec / 60);
    const secs = remainingSec % 60;
    const formatted = mins > 0 ? `${mins}m ${String(secs).padStart(2, '0')}s` : `${secs}s`;

    return {
      remainingSec,
      percent,
      formatted,
    };
  }, [activeStaySession, now, project.stayDuration]);

  // Phase 2: Interval Countdown Calculation (Resting countdown between cycles)
  const intervalCountdown = useMemo(() => {
    if (!project.enabled || !project.nextCheckTimestamp) {
      return { text: 'Paused', percent: 0 };
    }

    const diffMs = project.nextCheckTimestamp - now;
    if (diffMs <= 0) {
      return { text: 'Ready', percent: 100 };
    }

    const totalIntervalMs = (project.interval || 10) * 60 * 1000;
    const elapsedMs = totalIntervalMs - diffMs;
    const percent = Math.min(100, Math.max(0, (elapsedMs / totalIntervalMs) * 100));

    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formatted =
      minutes > 0
        ? `${minutes}m ${String(seconds).padStart(2, '0')}s`
        : `${seconds}s`;

    return {
      text: formatted,
      percent,
    };
  }, [project.enabled, project.nextCheckTimestamp, project.interval, now]);

  const completedCycles = Number(project.completedCycles) || 0;
  const stayDurationSec = project.stayDuration !== undefined ? Number(project.stayDuration) : 60;

  const schedule = checkScheduleStatus(project, now);
  const scheduleSummary = formatScheduleSummary(project);

  return (
    <div className={`project-card ${!project.enabled ? 'disabled' : ''}`}>
      {/* Top row: Name, URL, Cycle Badge, and Live Status */}
      <div className="card-top-row">
        <div className="card-title-group" style={{ maxWidth: '65%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <h3 className="card-title" title={project.name}>
              {project.name}
            </h3>
            <span
              style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                background: completedCycles > 0 ? 'rgba(79, 70, 229, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                color: completedCycles > 0 ? 'var(--indigo-light)' : 'var(--text-secondary)',
                border: `1px solid ${completedCycles > 0 ? 'rgba(79, 70, 229, 0.35)' : 'var(--border-subtle)'}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title={`Completed cycles: ${completedCycles}. Resets upon pause or restart.`}
            >
              <RotateCcw size={10} />
              Cycle #{completedCycles}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
            <a
              href={normalizeUrl(project.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="card-url-link"
              title={project.url}
            >
              <Globe size={13} />
              <span>{project.url.replace(/^https?:\/\//i, '').replace(/\/$/, '')}</span>
            </a>
            <button
              onClick={handleCopyUrl}
              className="btn btn-ghost btn-sm"
              style={{ padding: '2px 5px', height: 'auto' }}
              title="Copy URL"
            >
              {copied ? <Check size={12} color="var(--emerald-light)" /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* Status Pill */}
        <div>
          {stayCountdown ? (
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
          ) : !project.enabled ? (
            <span className="status-pill unknown">
              <span className="pulse-dot unknown"></span>
              Paused
            </span>
          ) : !schedule.isInSchedule ? (
            <span className="status-pill scheduled">
              <Moon size={12} />
              Scheduled
            </span>
          ) : project.status === 'down' ? (
            <span className="status-pill down">
              <span className="pulse-dot down"></span>
              Dormant
            </span>
          ) : (
            <span className="status-pill active">
              <span className="pulse-dot active"></span>
              {project.lastLatency || project.latencyMs ? `${project.lastLatency || project.latencyMs}ms` : 'Awake'}
            </span>
          )}
        </div>
      </div>

      {/* Countdown Progress */}
      {stayCountdown ? (
        /* Phase 1: Stay Active Countdown */
        <div className="countdown-box" style={{ background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.25)' }}>
          <div className="countdown-label-row">
            <span style={{ color: 'var(--amber-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 600 }}>
              <Flame size={13} color="var(--amber-primary)" />
              Phase 1: Staying on Site ({stayDurationSec}s)
            </span>
            <span className="countdown-time" style={{ color: 'var(--amber-primary)' }}>
              {stayCountdown.formatted} left
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${stayCountdown.percent}%`,
                background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.71rem', color: 'var(--amber-primary)', marginTop: '2px', opacity: 0.85 }}>
            <span>Priming memory & worker threads</span>
            <span>{project.stayMode === 'tab' ? 'Auto-Close Tab' : 'Silent Frame'}</span>
          </div>
        </div>
      ) : (
        /* Phase 2: Interval Countdown */
        <div className="countdown-box">
          <div className="countdown-label-row">
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
              <Clock size={13} color="var(--indigo-light)" />
              Next Check (Every {project.interval || 10}m)
            </span>
            <span className="countdown-time" style={{ color: project.enabled ? 'var(--indigo-light)' : 'var(--text-muted)' }}>
              {intervalCountdown.text}
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${project.enabled ? intervalCountdown.percent : 0}%`,
                opacity: project.enabled ? 1 : 0.2,
                background: 'var(--gradient-brand)',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            <span>Stay: {stayDurationSec}s ({project.stayMode === 'tab' ? 'Tab' : 'Frame'})</span>
            <span title={scheduleSummary} style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {scheduleSummary}
            </span>
          </div>
        </div>
      )}

      {/* Card Action Row */}
      <div className="card-actions-row">
        <div className="card-btn-group">
          <label className="switch" title={project.enabled ? 'Pause monitoring' : 'Resume monitoring'}>
            <input
              id={`project-toggle-${project.id}`}
              name={`project-toggle-${project.id}`}
              type="checkbox"
              checked={!!project.enabled}
              onChange={() => onToggle(project.id)}
            />
            <span className="slider"></span>
          </label>

          <button
            className="btn btn-outline-indigo btn-sm"
            onClick={handlePingCard}
            disabled={isChecking || Boolean(stayCountdown)}
            title="Ping and stay on site now"
          >
            <RefreshCw size={13} className={isChecking || stayCountdown ? 'spin' : ''} />
            <span>{stayCountdown ? 'Staying...' : isChecking ? 'Pinging' : 'Ping & Stay'}</span>
          </button>
        </div>

        <div className="card-btn-group">
          <button
            className="btn btn-ghost btn-icon"
            style={{ width: '32px', height: '32px' }}
            onClick={handleRestartCard}
            title="Reset Cycle count to #0 and restart probe"
          >
            <RotateCcw size={13} color="var(--indigo-light)" />
          </button>

          <button
            className="btn btn-secondary btn-icon"
            style={{ width: '32px', height: '32px' }}
            onClick={handleOpenUrl}
            title="Open website in new tab"
          >
            <ExternalLink size={13} />
          </button>

          <button
            className="btn btn-secondary btn-icon"
            style={{ width: '32px', height: '32px' }}
            onClick={() => onEdit(project)}
            title="Edit timing and schedules"
          >
            <Edit2 size={13} color="var(--indigo-light)" />
          </button>

          <button
            className="btn btn-ghost btn-icon"
            style={{ width: '32px', height: '32px', color: 'var(--rose-primary)' }}
            onClick={() => onDelete(project)}
            title="Delete project"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
