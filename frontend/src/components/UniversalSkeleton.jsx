import React from 'react';

/**
 * UniversalSkeleton Component
 * 
 * Provides high-fidelity, responsive skeleton wireframe layouts for all pages
 * and views across pulseOps:
 * - 'app' / 'full': Complete App layout with Header, Navigation Bar, and Dashboard Fleet.
 * - 'dashboard': Dashboard Fleet Metrics, Search Toolbar, and Project Cards Grid.
 * - 'schedules': Automation Header Banner, Metrics, Filter bar, and Schedule Timeline Cards.
 * - 'logs' | 'activity': Activity Stream Header Banner, Metrics, Filter bar, and Dark CLI Terminal.
 * - 'settings': System Stats, 3 Config Cards (Identity, DB Health, Vault Backup), and Danger Zone.
 * - 'card': Individual Project Card skeleton.
 * - 'table': Tabular rows skeleton.
 */
export default function UniversalSkeleton({ variant = 'app', count = 6 }) {
  if (variant === 'card') {
    return <SkeletonProjectCard />;
  }

  if (variant === 'table') {
    return <SkeletonTableRows count={count} />;
  }

  if (variant === 'dashboard') {
    return (
      <div className="page-container page-fade-in">
        <SkeletonDashboardContent count={count} />
      </div>
    );
  }

  if (variant === 'schedules') {
    return (
      <div className="page-container page-fade-in">
        <SkeletonSchedulesContent />
      </div>
    );
  }

  if (variant === 'logs' || variant === 'activity') {
    return (
      <div className="page-container page-fade-in">
        <SkeletonLogsContent />
      </div>
    );
  }

  if (variant === 'settings') {
    return (
      <div className="page-container page-fade-in">
        <SkeletonSettingsContent />
      </div>
    );
  }

  if (variant === 'landing') {
    return <SkeletonLandingContent />;
  }

  // Default: 'app' / 'full' layout (Header + Navigation + Dashboard)
  return (
    <div className="app-container page-fade-in skeleton-app-wrapper">
      {/* Background Atmosphere Orbs */}
      <div className="app-atmosphere">
        <div className="blob-orb blob-orb-1" />
        <div className="blob-orb blob-orb-2" />
        <div className="blob-orb blob-orb-3" />
      </div>

      {/* Header Skeleton */}
      <header className="header-wrapper skeleton-header-wrapper">
        <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="skeleton-bone skeleton-circle" style={{ width: '36px', height: '36px' }} />
          <div className="skeleton-bone" style={{ width: '130px', height: '26px', borderRadius: '6px' }} />
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="skeleton-bone skeleton-pill" style={{ width: '120px', height: '38px' }} />
          <div className="skeleton-bone skeleton-pill" style={{ width: '90px', height: '38px' }} />
        </div>
      </header>

      {/* Modern Multi-Page Navigation Bar Skeleton */}
      <nav className="nav-bar-container skeleton-nav-container">
        <div className="nav-tabs-wrapper">
          <div className="skeleton-bone skeleton-pill" style={{ width: '130px', height: '40px' }} />
          <div className="skeleton-bone skeleton-pill" style={{ width: '145px', height: '40px' }} />
          <div className="skeleton-bone skeleton-pill" style={{ width: '160px', height: '40px' }} />
          <div className="skeleton-bone skeleton-pill" style={{ width: '150px', height: '40px' }} />
        </div>
      </nav>

      {/* Dashboard Page Skeleton Content */}
      <div className="page-container">
        <SkeletonDashboardContent count={count} />
      </div>
    </div>
  );
}

/** Dashboard Content Wireframe */
function SkeletonDashboardContent({ count = 6 }) {
  return (
    <div className="skeleton-view-container">
      {/* Fleet Telemetry Stats Bar (4-Grid) */}
      <div className="schedule-stats-grid skeleton-stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="schedule-stat-card skeleton-stat-card">
            <div className="skeleton-bone skeleton-circle" style={{ width: '42px', height: '42px', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', width: '100%' }}>
              <div className="skeleton-bone" style={{ width: '55%', height: '24px', borderRadius: '4px' }} />
              <div className="skeleton-bone" style={{ width: '80%', height: '14px', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Search, Filter Toolbar & View Layout Switcher Skeleton */}
      <div className="control-bar skeleton-control-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="skeleton-bone" style={{ height: '42px', flex: '1 1 260px', borderRadius: '10px' }} />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="skeleton-bone skeleton-pill" style={{ width: '70px', height: '36px' }} />
          <div className="skeleton-bone skeleton-pill" style={{ width: '85px', height: '36px' }} />
          <div className="skeleton-bone skeleton-pill" style={{ width: '90px', height: '36px' }} />
          <div className="skeleton-bone skeleton-pill" style={{ width: '80px', height: '36px' }} />
        </div>
      </div>

      {/* Project Cards Grid Skeleton */}
      <div className="project-grid">
        {Array.from({ length: count }).map((_, idx) => (
          <SkeletonProjectCard key={idx} />
        ))}
      </div>
    </div>
  );
}

/** Single Project Card Wireframe */
export function SkeletonProjectCard() {
  return (
    <div className="project-card skeleton-card-item">
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
          <div className="skeleton-bone skeleton-circle" style={{ width: '36px', height: '36px', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '75%' }}>
            <div className="skeleton-bone" style={{ width: '80%', height: '18px', borderRadius: '4px' }} />
            <div className="skeleton-bone" style={{ width: '55%', height: '12px', borderRadius: '4px' }} />
          </div>
        </div>
        <div className="skeleton-bone skeleton-pill" style={{ width: '72px', height: '24px' }} />
      </div>

      {/* URL & Link Bar */}
      <div className="skeleton-bone" style={{ width: '100%', height: '32px', borderRadius: '6px', marginBottom: '0.85rem' }} />

      {/* Status & Timing Metrics Box */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: '0.75rem', background: 'rgba(241, 245, 249, 0.6)', borderRadius: '8px', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton-bone" style={{ width: '40%', height: '13px', borderRadius: '3px' }} />
          <div className="skeleton-bone" style={{ width: '25%', height: '13px', borderRadius: '3px' }} />
        </div>
        <div className="skeleton-bone" style={{ width: '100%', height: '6px', borderRadius: '3px' }} />
      </div>

      {/* Footer Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.65rem', borderTop: '1px solid var(--border-subtle)', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.45rem' }}>
          <div className="skeleton-bone skeleton-pill" style={{ width: '75px', height: '32px' }} />
          <div className="skeleton-bone skeleton-pill" style={{ width: '65px', height: '32px' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <div className="skeleton-bone skeleton-circle" style={{ width: '32px', height: '32px' }} />
          <div className="skeleton-bone skeleton-circle" style={{ width: '32px', height: '32px' }} />
        </div>
      </div>
    </div>
  );
}

/** Schedules Page Content Wireframe */
function SkeletonSchedulesContent() {
  return (
    <div className="skeleton-view-container">
      {/* Schedules Banner */}
      <div className="schedules-header-banner skeleton-banner-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '650px' }}>
          <div className="skeleton-bone skeleton-pill" style={{ width: '140px', height: '24px' }} />
          <div className="skeleton-bone" style={{ width: '85%', height: '30px', borderRadius: '6px' }} />
          <div className="skeleton-bone" style={{ width: '95%', height: '16px', borderRadius: '4px' }} />
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="schedule-stats-grid" style={{ marginBottom: '1.5rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="schedule-stat-card skeleton-stat-card">
            <div className="skeleton-bone skeleton-circle" style={{ width: '42px', height: '42px', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', width: '100%' }}>
              <div className="skeleton-bone" style={{ width: '50%', height: '22px', borderRadius: '4px' }} />
              <div className="skeleton-bone" style={{ width: '75%', height: '13px', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Filters Toolbar */}
      <div className="control-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="skeleton-bone" style={{ height: '42px', flex: '1 1 240px', borderRadius: '10px' }} />
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <div className="skeleton-bone skeleton-pill" style={{ width: '90px', height: '36px' }} />
          <div className="skeleton-bone skeleton-pill" style={{ width: '110px', height: '36px' }} />
          <div className="skeleton-bone skeleton-pill" style={{ width: '100px', height: '36px' }} />
        </div>
      </div>

      {/* 24-Hour Schedule Matrix Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card-item" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="skeleton-bone skeleton-circle" style={{ width: '34px', height: '34px' }} />
                <div className="skeleton-bone" style={{ width: '180px', height: '20px', borderRadius: '4px' }} />
              </div>
              <div className="skeleton-bone skeleton-pill" style={{ width: '100px', height: '28px' }} />
            </div>
            {/* Simulated 24-Hour Timeline Bar */}
            <div className="skeleton-bone" style={{ width: '100%', height: '38px', borderRadius: '8px', marginBottom: '0.75rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="skeleton-bone" style={{ width: '120px', height: '14px', borderRadius: '3px' }} />
              <div className="skeleton-bone" style={{ width: '140px', height: '14px', borderRadius: '3px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Activity Stream Content Wireframe */
function SkeletonLogsContent() {
  return (
    <div className="skeleton-view-container">
      {/* Activity Stream Header Banner */}
      <div className="activity-header-card skeleton-banner-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '600px' }}>
            <div className="skeleton-bone skeleton-pill" style={{ width: '150px', height: '24px' }} />
            <div className="skeleton-bone" style={{ width: '80%', height: '28px', borderRadius: '6px' }} />
            <div className="skeleton-bone" style={{ width: '90%', height: '15px', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <div className="skeleton-bone skeleton-pill" style={{ width: '120px', height: '38px' }} />
            <div className="skeleton-bone skeleton-pill" style={{ width: '120px', height: '38px' }} />
          </div>
        </div>
      </div>

      {/* Latency & Telemetry Stats Grid */}
      <div className="activity-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="schedule-stat-card skeleton-stat-card">
            <div className="skeleton-bone skeleton-circle" style={{ width: '40px', height: '40px', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', width: '100%' }}>
              <div className="skeleton-bone" style={{ width: '45%', height: '22px', borderRadius: '4px' }} />
              <div className="skeleton-bone" style={{ width: '70%', height: '13px', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Terminal CLI Window Skeleton */}
      <div className="terminal-container skeleton-terminal-box" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#090d16' }}>
        {/* Terminal Header Bar */}
        <div style={{ padding: '0.85rem 1.25rem', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10b981' }} />
          </div>
          <div className="skeleton-bone skeleton-pill" style={{ width: '220px', height: '22px', background: 'rgba(255,255,255,0.08)' }} />
          <div className="skeleton-bone skeleton-pill" style={{ width: '80px', height: '22px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Terminal Log Rows */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="skeleton-bone" style={{ width: '80px', height: '16px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }} />
              <div className="skeleton-bone skeleton-pill" style={{ width: '70px', height: '20px', background: 'rgba(79, 70, 229, 0.15)' }} />
              <div className="skeleton-bone" style={{ width: '30%', height: '16px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }} />
              <div className="skeleton-bone" style={{ width: '20%', height: '16px', borderRadius: '3px', background: 'rgba(255,255,255,0.05)' }} />
              <div className="skeleton-bone skeleton-pill" style={{ width: '60px', height: '18px', marginLeft: 'auto', background: 'rgba(16, 185, 129, 0.15)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Settings & Vault Content Wireframe */
function SkeletonSettingsContent() {
  return (
    <div className="skeleton-view-container">
      {/* Settings Top Summary Grid */}
      <div className="schedule-stats-grid" style={{ marginBottom: '1.5rem' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="schedule-stat-card skeleton-stat-card">
            <div className="skeleton-bone skeleton-circle" style={{ width: '42px', height: '42px', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', width: '100%' }}>
              <div className="skeleton-bone" style={{ width: '50%', height: '22px', borderRadius: '4px' }} />
              <div className="skeleton-bone" style={{ width: '75%', height: '13px', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* 3 Config Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card-item" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div className="skeleton-bone skeleton-circle" style={{ width: '38px', height: '38px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '60%' }}>
                <div className="skeleton-bone" style={{ width: '85%', height: '18px', borderRadius: '4px' }} />
                <div className="skeleton-bone" style={{ width: '60%', height: '12px', borderRadius: '4px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div className="skeleton-bone" style={{ width: '100%', height: '38px', borderRadius: '8px' }} />
              <div className="skeleton-bone" style={{ width: '100%', height: '38px', borderRadius: '8px' }} />
            </div>
            <div className="skeleton-bone skeleton-pill" style={{ width: '120px', height: '36px', marginTop: 'auto' }} />
          </div>
        ))}
      </div>

      {/* Danger Zone Skeleton */}
      <div className="skeleton-card-item" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px dashed rgba(225, 29, 72, 0.25)', background: 'rgba(225, 29, 72, 0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div className="skeleton-bone" style={{ width: '160px', height: '20px', borderRadius: '4px', background: 'rgba(225, 29, 72, 0.15)' }} />
            <div className="skeleton-bone" style={{ width: '280px', height: '13px', borderRadius: '4px' }} />
          </div>
          <div className="skeleton-bone skeleton-pill" style={{ width: '130px', height: '36px', background: 'rgba(225, 29, 72, 0.15)' }} />
        </div>
      </div>
    </div>
  );
}

/** Tabular Rows Wireframe */
function SkeletonTableRows({ count = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-bone" style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
      ))}
    </div>
  );
}

/** Landing Page Wireframe Skeleton */
function SkeletonLandingContent() {
  return (
    <div className="landing-container skeleton-app-wrapper page-fade-in" style={{ padding: '0 1rem 4rem' }}>
      {/* Background Atmosphere Orbs */}
      <div className="app-atmosphere">
        <div className="blob-orb blob-orb-1" />
        <div className="blob-orb blob-orb-2" />
        <div className="blob-orb blob-orb-3" />
      </div>

      {/* Landing Navbar Skeleton */}
      <header className="landing-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', maxWidth: '1280px', margin: '0 auto 2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="skeleton-bone skeleton-circle" style={{ width: '38px', height: '38px' }} />
          <div className="skeleton-bone" style={{ width: '140px', height: '28px', borderRadius: '6px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="skeleton-bone skeleton-pill" style={{ width: '100px', height: '38px' }} />
          <div className="skeleton-bone skeleton-pill" style={{ width: '130px', height: '38px' }} />
        </div>
      </header>

      {/* Landing Hero Section */}
      <div style={{ maxWidth: '900px', margin: '0 auto 3.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
        <div className="skeleton-bone skeleton-pill" style={{ width: '280px', height: '32px' }} />
        <div className="skeleton-bone" style={{ width: '85%', height: '56px', borderRadius: '12px' }} />
        <div className="skeleton-bone" style={{ width: '65%', height: '48px', borderRadius: '12px' }} />
        <div className="skeleton-bone" style={{ width: '75%', height: '22px', borderRadius: '6px', marginTop: '0.5rem' }} />
        <div className="skeleton-bone" style={{ width: '55%', height: '20px', borderRadius: '6px' }} />
        
        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div className="skeleton-bone skeleton-pill" style={{ width: '200px', height: '48px' }} />
          <div className="skeleton-bone skeleton-pill" style={{ width: '180px', height: '48px' }} />
        </div>
      </div>

      {/* Landing 4-Metrics Bar */}
      <div className="landing-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', maxWidth: '1200px', margin: '0 auto 4rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card-item" style={{ padding: '1.25rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div className="skeleton-bone skeleton-circle" style={{ width: '42px', height: '42px', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
              <div className="skeleton-bone" style={{ width: '60%', height: '22px', borderRadius: '4px' }} />
              <div className="skeleton-bone" style={{ width: '85%', height: '14px', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Simulator Section Skeleton */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="skeleton-card-item" style={{ padding: '1.75rem', borderRadius: '18px', height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="skeleton-bone" style={{ width: '45%', height: '26px', borderRadius: '6px' }} />
            <div className="skeleton-bone skeleton-circle" style={{ width: '120px', height: '120px', margin: '0 auto' }} />
            <div className="skeleton-bone" style={{ width: '80%', height: '18px', borderRadius: '4px', margin: '0 auto' }} />
          </div>
          <div className="terminal-container skeleton-terminal-box" style={{ borderRadius: '18px', height: '320px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#090d16', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="skeleton-bone" style={{ width: '60%', height: '20px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }} />
            <div className="skeleton-bone" style={{ width: '85%', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }} />
            <div className="skeleton-bone" style={{ width: '70%', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }} />
            <div className="skeleton-bone" style={{ width: '90%', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

