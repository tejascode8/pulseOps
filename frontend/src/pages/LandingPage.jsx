import React, { useState, useEffect } from 'react';
import {
  Activity,
  Gauge,
  ShieldCheck,
  Database,
  Flame,
  Calendar,
  Cpu,
  BarChart3,
  LogIn,
  ChevronDown,
  ChevronUp,
  Terminal,
  Check,
  X,
  Layers,
  Sun,
  Moon,
  Lock,
  Timer,
  AlertTriangle,
  RefreshCw,
  Wifi,
  Server,
  CheckCircle2,
  Zap,
  Globe,
  ArrowRight,
} from 'lucide-react';

export default function LandingPage({ onOpenAuthModal }) {
  // Always start from top hero section on load / refresh
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const handleBrandClick = (e) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.location.reload();
  };

  // Live Simulator state
  const [simulatorMode, setSimulatorMode] = useState('with_pulseops'); // 'with_pulseops' | 'without_pulseops'
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedLatency, setSimulatedLatency] = useState(109);
  const [simulatedLogs, setSimulatedLogs] = useState([
    {
      time: '4:54:25 PM',
      status: 200,
      code: 'OK',
      method: 'GET',
      route: '/api/v1/health',
      latency: '109ms',
      text: 'Instant 200 OK • Primed response in sub-second (Zero Cold Start)',
    },
    {
      time: '10:14:02 AM',
      status: 200,
      code: 'OK',
      method: 'GET',
      route: '/api/v1/health',
      latency: '98ms',
      text: 'Probe verified • Phase 1 stay frame active (60s dyno prime)',
    },
    {
      time: '10:04:00 AM',
      status: 200,
      code: 'OK',
      method: 'GET',
      route: '/api/v1/health',
      latency: '112ms',
      text: 'Cycle #14 completed • Worker threads hot & primed',
    },
    {
      time: '09:54:01 AM',
      status: 200,
      code: 'OK',
      method: 'GET',
      route: '/api/v1/health',
      latency: '105ms',
      text: 'Scheduled recruiter business window active (09:00 - 18:00)',
    },
  ]);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'Why do Render, Fly.io, and cloud instances sleep?',
      a: 'Ephemeral and containerized cloud platforms automatically spin down inactive virtual instances after 10–15 minutes of zero inbound traffic to conserve compute resources. When an interviewer or recruiter clicks your portfolio link, they experience a 50+ second cold-start delay or a 504 Gateway Timeout.',
    },
    {
      q: 'How does pulseOps keep serverless and cloud instances warm?',
      a: 'pulseOps employs intelligent dual-phase keepalive probes: Phase 1 maintains a lightweight active session on your target deployment, keeping the server worker primed. Phase 2 then runs an automated countdown timer before initiating the next scheduled probe.',
    },
    {
      q: 'How is pulseOps different from basic uptime pingers like UptimeRobot?',
      a: 'Basic uptime pingers only send a superficial 100ms HTTP ping that touches the network edge without keeping dyno worker threads active. pulseOps engages a full 60-second stay session (via silent background frame or auto-tab), includes smart daily business hours scheduling to save cloud limits, and provides CORS-tolerant handshakes.',
    },
    {
      q: 'Can I schedule keepalive probes only during recruiter business hours?',
      a: 'Yes. pulseOps provides comprehensive scheduling options including 24/7 Always Active, custom daily business windows (e.g., 09:00 - 18:00 on weekdays), or specific calendar date ranges to ensure your portfolio services are hot only when needed.',
    },
    {
      q: 'How does pulseOps handle CORS restrictions during browser-based checks?',
      a: 'When probing cross-origin deployment endpoints without explicit CORS headers, pulseOps performs intelligent CORS-tolerant network handshakes that awaken the target container instance even if direct response body inspection is restricted by browser security policies.',
    },
    {
      q: 'How is my account and database connection secured?',
      a: 'pulseOps utilizes industrial-strength Bcrypt password hashing with 12 salt rounds and stateless 30-day signed JWT session tokens. All project URLs, schedules, and telemetry logs are strictly scoped to your private user account inside MongoDB Atlas with zero plaintext data exposure.',
    },
    {
      q: 'Can I export and restore my project monitoring configurations?',
      a: 'Yes. You can export your complete project list, custom intervals, and scheduling configurations as a portable JSON backup file at any time, or import previous backups with a single click.',
    },
  ];

  const matrixItems = [
    {
      title: 'Dual-Phase Stay on Site (Phase 1)',
      desc: 'Holds live 60-second connection to prime worker memory caches, runtime threads, and database connection pools.',
      pulseOps: '60s Stay (Silent Frame & Tab)',
      legacy: 'Instant Tap Only (100ms)',
    },
    {
      title: 'Sequential Interval Countdown (Phase 2)',
      desc: 'Starts interval countdown strictly after Phase 1 finishes, eliminating timer collisions and overlapping probes.',
      pulseOps: 'Strict Sequential Phase 2',
      legacy: 'Blind Static Cron Loops',
    },
    {
      title: 'Smart Daily Business & Recruiter Windows',
      desc: 'Automates active windows (09:00 - 18:00 weekdays) during portfolio review hours to protect monthly cloud limits.',
      pulseOps: 'Saves 60%+ Cloud Hours',
      legacy: '24/7 Continuous Quota Drain',
    },
    {
      title: 'Intelligent CORS-Tolerant Awaken Mode',
      desc: 'Awakens single-page apps and backend microservices across origins without triggering false-offline alert spam.',
      pulseOps: '0% False Down Alerts',
      legacy: 'False Offline CORS Errors',
    },
    {
      title: 'Client-Side Sovereign Encrypted Vault',
      desc: 'Bcrypt-12 password hashing and user-partitioned MongoDB Atlas storage with 1-click JSON backup export.',
      pulseOps: 'Bcrypt-12 & Atlas Partition',
      legacy: 'Unencrypted / Plaintext',
    },
    {
      title: 'On-Demand Latency & Wake Benchmark Sandbox',
      desc: 'Live interactive telemetry console to probe cold-start vs primed response latency in real-time.',
      pulseOps: 'Built-in Real-Time Sandbox',
      legacy: 'Superficial Status Only',
    },
  ];

  const handleRunSimulation = (mode) => {
    setSimulatorMode(mode);
    setIsSimulating(true);

    if (mode === 'with_pulseops') {
      setTimeout(() => {
        setIsSimulating(false);
        const lat = Math.floor(Math.random() * 26) + 90;
        setSimulatedLatency(lat);
        setSimulatedLogs((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            status: 200,
            code: 'OK',
            method: 'GET',
            route: '/api/v1/health',
            latency: `${lat}ms`,
            text: 'Instant 200 OK • Primed response in sub-second (Zero Cold Start)',
          },
          ...prev.slice(0, 5),
        ]);
      }, 400);
    } else {
      setTimeout(() => {
        setIsSimulating(false);
        setSimulatedLatency(52400);
        setSimulatedLogs((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            status: 504,
            code: 'GATEWAY_TIMEOUT',
            method: 'GET',
            route: '/api/v1/health',
            latency: '52.4s',
            text: 'Cold Start Hang • Container spin-up took 52.4 seconds (Recruiter Abandons)',
          },
          ...prev.slice(0, 5),
        ]);
      }, 1100);
    }
  };

  return (
    <div className="landing-wrapper">
      {/* Background Atmosphere Orbs */}
      <div className="app-atmosphere">
        <div className="blob-orb blob-orb-1" />
        <div className="blob-orb blob-orb-2" />
        <div className="blob-orb blob-orb-3" />
      </div>

      {/* Screen 1: Hero Page Viewport */}
      <header className="landing-hero-screen">
        {/* Clean Transparent Navigation Bar */}
        <nav className="landing-nav">
          {/* Brand Identity */}
          <div
            className="landing-brand-wrap"
            onClick={handleBrandClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleBrandClick(e);
              }
            }}
            title="Reload pulseOps"
          >
            <div className="brand-icon-wrapper landing-brand-icon">
              <Activity size={20} color="#ffffff" />
            </div>
            <span className="landing-brand-text">
              pulse<span className="gradient-text-indigo">Ops</span>
            </span>
          </div>

          {/* Single Sign In Action */}
          <div className="landing-nav-actions">
            <button
              className="btn btn-secondary landing-signin-btn"
              onClick={() => onOpenAuthModal('login')}
              id="landing-signin-btn"
            >
              <LogIn size={15} color="var(--indigo-light)" />
              <span>Sign In</span>
            </button>
          </div>
        </nav>

        {/* Hero Headline, Subtitle & Primary CTA Button */}
        <div className="landing-hero-body">

          <h1 className="landing-headline">
            Never Let Your Portfolio Apps{' '}
            <span className="gradient-text-indigo">Go Cold Before An Interview</span>
          </h1>

          {/* Continuous Heartbeat Waveform Visual */}
          <div className="hero-pulse-waveform-wrap" aria-hidden="true">
            <svg className="hero-pulse-svg" viewBox="0 0 500 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="heroPulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                  <stop offset="30%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="70%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path
                className="hero-pulse-path"
                d="M0 12 H180 L195 4 L205 20 L215 2 L225 22 L235 12 L245 12 L252 7 L260 17 L268 12 H500"
                stroke="url(#heroPulseGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="landing-subtitle">
            Cloud instances sleep after 15 minutes of inactivity—causing{' '}
            <strong style={{ color: 'var(--rose-primary)', fontWeight: 700 }}>50+ second cold-start hangs</strong> when recruiters click your links.{' '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>pulseOps</strong> keeps your portfolio apps perpetually primed and instant.
          </p>

          <div className="landing-cta-row">
            <button
              className="hero-cta-btn"
              onClick={() => onOpenAuthModal('signup')}
              id="hero-create-vault-btn"
            >
              <ShieldCheck size={18} className="hero-btn-icon" />
              <span className="hero-btn-text">
                <span className="hero-btn-text-full">Create Encrypted Vault</span>
                <span className="hero-btn-text-short">Create Vault</span>
              </span>
              <span className="hero-btn-arrow-badge">
                <ArrowRight size={14} />
              </span>
            </button>
          </div>
        </div>

        {/* Feature Metrics 4-Card Strip (Shifted to Bottom of Viewport) */}
        <div className="landing-metrics-grid">
          <div className="landing-metric-card card-glow-emerald">
            <div className="landing-metric-icon metric-icon-emerald">
              <ShieldCheck size={20} />
            </div>
            <div className="landing-metric-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
                <span className="landing-metric-title">Bcrypt Salt 12</span>
              </div>
              <span className="landing-metric-subtitle">Zero Plaintext Storage</span>
            </div>
          </div>

          <div className="landing-metric-card card-glow-cyan">
            <div className="landing-metric-icon metric-icon-cyan">
              <Gauge size={20} />
            </div>
            <div className="landing-metric-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
                <span className="landing-metric-title">0.09s Primed</span>
              </div>
              <span className="landing-metric-subtitle">Instant Recruiter Loads</span>
            </div>
          </div>

          <div className="landing-metric-card card-glow-violet">
            <div className="landing-metric-icon metric-icon-violet">
              <Flame size={20} />
            </div>
            <div className="landing-metric-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
                <span className="landing-metric-title">Dual-Phase Engine</span>
              </div>
              <span className="landing-metric-subtitle">60s Deep Priming</span>
            </div>
          </div>

          <div className="landing-metric-card card-glow-amber">
            <div className="landing-metric-icon metric-icon-amber">
              <Calendar size={20} />
            </div>
            <div className="landing-metric-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
                <span className="landing-metric-title">Smart Windows</span>
              </div>
              <span className="landing-metric-subtitle">Daily 09:00 - 18:00 Rules</span>
            </div>
          </div>
        </div>
      </header>

      {/* Section 2: Interactive Cold-Start vs pulseOps Simulator Console */}
      <section className="landing-section" id="live-telemetry-benchmark">
        <div className="simulator-card">
          {/* Header & Controls */}
          <div className="simulator-header">
            <div className="simulator-header-text">
              <div className="simulator-title-row">
                <div className="simulator-title-icon">
                  <Cpu size={18} />
                </div>
                <h3 className="simulator-main-title">
                  Live Keepalive Telemetry & Response Benchmark
                </h3>
              </div>
              <p className="simulator-subtitle">
                Compare latency between a sleeping cloud container and a pulseOps primed endpoint.
              </p>
            </div>

            {/* Toggle Mode Switchers */}
            <div className="simulator-modes-wrap">
              <button
                type="button"
                className={`simulator-mode-btn ${simulatorMode === 'with_pulseops' ? 'active-hot' : ''}`}
                onClick={() => handleRunSimulation('with_pulseops')}
                disabled={isSimulating}
              >
                <Flame size={15} style={{ flexShrink: 0 }} />
                <span>With pulseOps (Instant Hot)</span>
              </button>
              <button
                type="button"
                className={`simulator-mode-btn ${simulatorMode === 'without_pulseops' ? 'active-cold' : ''}`}
                onClick={() => handleRunSimulation('without_pulseops')}
                disabled={isSimulating}
              >
                <Moon size={15} style={{ flexShrink: 0 }} />
                <span>Without pulseOps (Cold Sleep)</span>
              </button>
            </div>
          </div>

          {/* 2-Column Grid: Left Gauge Breakdown, Right Terminal Stream */}
          <div className="simulator-grid">
            {/* Left Column: Latency Benchmark & Network Telemetry */}
            <div className="simulator-gauge-card">
              {/* Endpoint Status Bar */}
              <div className="simulator-target-bar">
                <div className="simulator-target-info">
                  <span className="simulator-pulse-wrap">
                    <span
                      className={`simulator-pulse-ping ${simulatorMode === 'with_pulseops' ? 'ping-emerald' : 'ping-rose'}`}
                    />
                    <span
                      className={`simulator-pulse-core ${simulatorMode === 'with_pulseops' ? 'core-emerald' : 'core-rose'}`}
                    />
                  </span>
                  <span className="simulator-target-url">
                    target: api.portfolio-deploy.app/health
                  </span>
                </div>
                <span className={`status-target-tag ${simulatorMode === 'with_pulseops' ? 'tag-emerald' : 'tag-rose'}`}>
                  {simulatorMode === 'with_pulseops' ? '200 ACTIVE' : 'COLD SLEEP'}
                </span>
              </div>

              {/* Big Latency Gauge Display */}
              <div className="simulator-center-gauge">
                <div className="simulator-gauge-kicker">
                  END-TO-END RESPONSE LATENCY
                </div>
                <div
                  className={`simulator-latency-display ${simulatorMode === 'with_pulseops' ? 'latency-emerald' : 'latency-rose'}`}
                >
                  {isSimulating ? (
                    <span className="probing-spinner-text">
                      <RefreshCw size={24} className="spin-icon" /> Probing...
                    </span>
                  ) : simulatorMode === 'with_pulseops' ? (
                    `${simulatedLatency}ms`
                  ) : (
                    '52.4s'
                  )}
                </div>
              </div>

              {/* Visual Latency Comparison Bars */}
              <div className="simulator-bars-container">
                <div className="simulator-bar-item">
                  <div className="simulator-bar-label-row">
                    <span className="bar-label-hot">
                      <Flame size={13} style={{ flexShrink: 0 }} />
                      <span>pulseOps Primed (0.09s)</span>
                    </span>
                    <span className="bar-badge-hot">FAST</span>
                  </div>
                  <div className="simulator-progress-track">
                    <div className="simulator-progress-fill fill-emerald" style={{ width: simulatorMode === 'with_pulseops' ? '96%' : '4%' }} />
                  </div>
                </div>

                <div className="simulator-bar-item">
                  <div className="simulator-bar-label-row">
                    <span className="bar-label-cold">
                      <Moon size={13} style={{ flexShrink: 0 }} />
                      <span>Sleeping Container (52.4s)</span>
                    </span>
                    <span className="bar-badge-cold">HANG</span>
                  </div>
                  <div className="simulator-progress-track">
                    <div className="simulator-progress-fill fill-rose" style={{ width: simulatorMode === 'without_pulseops' ? '96%' : '10%' }} />
                  </div>
                </div>
              </div>

              {/* Micro Network Metrics Breakdown Grid */}
              <div className="simulator-breakdown-grid">
                <div className="simulator-micro-metric">
                  <span className="micro-label">DNS RESOLVE</span>
                  <span className="micro-value">8ms</span>
                </div>
                <div className="simulator-micro-metric">
                  <span className="micro-label">TLS HANDSHAKE</span>
                  <span className="micro-value">14ms</span>
                </div>
                <div className="simulator-micro-metric">
                  <span className="micro-label">TTFB</span>
                  <span className="micro-value" style={{ color: simulatorMode === 'with_pulseops' ? 'var(--emerald-light)' : '#be123c' }}>
                    {simulatorMode === 'with_pulseops' ? '24ms' : '52.4s'}
                  </span>
                </div>
                <div className="simulator-micro-metric">
                  <span className="micro-label">DYNO STATE</span>
                  <span className="micro-value" style={{ color: simulatorMode === 'with_pulseops' ? 'var(--emerald-light)' : '#be123c' }}>
                    {simulatorMode === 'with_pulseops' ? 'HOT' : 'SLEEP'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Telemetry Terminal Stream */}
            <div className="simulator-terminal-card">
              {/* Terminal Window Header */}
              <div className="terminal-header-bar">
                <div className="terminal-header-left">
                  <div className="terminal-dots-wrap">
                    <div className="terminal-dot dot-red" />
                    <div className="terminal-dot dot-yellow" />
                    <div className="terminal-dot dot-green" />
                  </div>
                  <div className="terminal-title">
                    <Terminal size={14} color="#818cf8" style={{ flexShrink: 0 }} />
                    <span>// Live Probe Telemetry Stream</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="terminal-probe-action"
                  onClick={() => handleRunSimulation(simulatorMode)}
                  disabled={isSimulating}
                  title="Send Test Probe Now"
                >
                  <RefreshCw size={12} className={isSimulating ? 'spin-icon' : ''} style={{ flexShrink: 0 }} />
                  <span>Send Probe</span>
                </button>
              </div>

              {/* Terminal Output Log Feed */}
              <div className="simulator-terminal-stream">
                {simulatedLogs.map((log, idx) => (
                  <div key={idx} className="terminal-log-row">
                    <div className="terminal-log-meta">
                      <span className="log-time">[{log.time}]</span>
                      <span className={`log-badge ${log.status === 200 ? 'log-badge-200' : 'log-badge-504'}`}>
                        {log.status} {log.code}
                      </span>
                    </div>
                    <span className="log-text">— {log.text}</span>
                  </div>
                ))}

                <div className="terminal-cursor-line">
                  <span className="cursor-prompt">pulseOps@probe:~$</span>
                  <span className="cursor-command"> stay --frame=60s --auto-prime</span>
                  <span className="terminal-blink-cursor">█</span>
                </div>
              </div>

              {/* Terminal Status Footer */}
              <div className="terminal-footer-bar">
                <div className="terminal-footer-item">
                  <Wifi size={12} color="#34d399" style={{ flexShrink: 0 }} />
                  <span>Telemetry Socket: Active</span>
                </div>
                <div className="terminal-footer-item">
                  <Server size={12} color="#818cf8" style={{ flexShrink: 0 }} />
                  <span>Dual-Phase Engine 1.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Feature Comparison: Traditional Pingers vs pulseOps */}
      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">
            Why Shallow Pingers Fail For Modern Cloud Apps
          </h2>
          <p className="landing-section-subtitle">
            Traditional 100ms HTTP pingers were engineered for 2005 static servers — not ephemeral cloud containers with cold-start spins, DB connection pools, and strict cloud quotas.
          </p>
        </div>

        {/* 2-Card Architecture Contrast Diagram */}
        <div className="comparison-architecture-grid">
          {/* Card A: Shallow Pingers Fatal Failure Loop */}
          <div className="comparison-card comparison-card-shallow">
            <div className="comparison-card-top">
              <div className="comparison-card-header">
                <div className="comparison-header-left">
                  <div className="comparison-icon-badge badge-icon-rose">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <span className="comparison-kicker text-rose">Legacy Monitoring</span>
                    <h3 className="comparison-card-title">The Instant-Tap Disconnect Flaw</h3>
                  </div>
                </div>
              </div>

              <p className="comparison-card-desc">
                Sends a bare 100ms HTTP ping and drops the socket immediately. The cloud dyno begins booting, but detects client disconnect and evicts memory within 30 seconds.
              </p>
            </div>

            {/* Stepper Flow Box */}
            <div className="comparison-pipeline-box pipeline-box-rose">
              <div className="pipeline-step">
                <span className="pipeline-dot dot-rose">01</span>
                <span className="pipeline-label">100ms Tap</span>
              </div>
              <div className="pipeline-connector connector-rose" />
              <div className="pipeline-step">
                <span className="pipeline-dot dot-rose">02</span>
                <span className="pipeline-label">Socket Drops</span>
              </div>
              <div className="pipeline-connector connector-rose" />
              <div className="pipeline-step">
                <span className="pipeline-dot dot-rose">03</span>
                <span className="pipeline-label">Dyno Sleeps</span>
              </div>
              <div className="pipeline-connector connector-rose" />
              <div className="pipeline-step">
                <span className="pipeline-dot dot-rose">04</span>
                <span className="pipeline-label">50s Timeout</span>
              </div>
            </div>

            {/* Points List */}
            <div className="comparison-points-list">
              <div className="comparison-point-item">
                <div className="point-icon-box point-icon-rose">
                  <X size={13} />
                </div>
                <div>
                  <strong className="point-title">No Cache or Pool Warming</strong>
                  <p className="point-desc">Closes sockets before Node/Python JIT or Prisma & Mongoose pools initialize.</p>
                </div>
              </div>
              <div className="comparison-point-item">
                <div className="point-icon-box point-icon-rose">
                  <X size={13} />
                </div>
                <div>
                  <strong className="point-title">24/7 Quota Depletion</strong>
                  <p className="point-desc">Blind continuous pinging exhausts Render and Fly.io monthly runtime limits in 15 days.</p>
                </div>
              </div>
              <div className="comparison-point-item">
                <div className="point-icon-box point-icon-rose">
                  <X size={13} />
                </div>
                <div>
                  <strong className="point-title">CORS False Down Alarms</strong>
                  <p className="point-desc">Superficial pingers trigger false "Server Offline" alerts on cross-origin web apps.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: pulseOps Dual-Phase Keepalive Engine */}
          <div className="comparison-card comparison-card-pulseops">
            <div className="comparison-card-top">
              <div className="comparison-card-header">
                <div className="comparison-header-left">
                  <div className="comparison-icon-badge badge-icon-indigo">
                    <Flame size={18} />
                  </div>
                  <div>
                    <span className="comparison-kicker text-indigo">pulseOps 1.0 Engine</span>
                    <h3 className="comparison-card-title">60s Deep Priming & Synchronized Interval</h3>
                  </div>
                </div>
              </div>

              <p className="comparison-card-desc">
                Maintains a verified 60s Stay Session in Phase 1 to fully initialize memory caches and database connection pools, followed by a collision-free Phase 2 countdown.
              </p>
            </div>

            {/* Stepper Flow Box */}
            <div className="comparison-pipeline-box pipeline-box-indigo">
              <div className="pipeline-step">
                <span className="pipeline-dot dot-emerald">01</span>
                <span className="pipeline-label">Phase 1 (60s)</span>
              </div>
              <div className="pipeline-connector connector-emerald" />
              <div className="pipeline-step">
                <span className="pipeline-dot dot-emerald">02</span>
                <span className="pipeline-label">Caches Warm</span>
              </div>
              <div className="pipeline-connector connector-emerald" />
              <div className="pipeline-step">
                <span className="pipeline-dot dot-emerald">03</span>
                <span className="pipeline-label">Phase 2 Sync</span>
              </div>
              <div className="pipeline-connector connector-emerald" />
              <div className="pipeline-step">
                <span className="pipeline-dot dot-emerald">04</span>
                <span className="pipeline-label">0.09s Load</span>
              </div>
            </div>

            {/* Points List */}
            <div className="comparison-points-list">
              <div className="comparison-point-item">
                <div className="point-icon-box point-icon-emerald">
                  <Check size={13} />
                </div>
                <div>
                  <strong className="point-title">Full Worker Thread Warm-Up</strong>
                  <p className="point-desc">Holds live socket sessions for 60s, guaranteeing zero cold-start delay for visitors.</p>
                </div>
              </div>
              <div className="comparison-point-item">
                <div className="point-icon-box point-icon-emerald">
                  <Check size={13} />
                </div>
                <div>
                  <strong className="point-title">Smart Business Windows</strong>
                  <p className="point-desc">Runs 09:00 - 18:00 weekdays to protect 60%+ of monthly cloud limits.</p>
                </div>
              </div>
              <div className="comparison-point-item">
                <div className="point-icon-box point-icon-emerald">
                  <Check size={13} />
                </div>
                <div>
                  <strong className="point-title">CORS-Tolerant Awaken Mode</strong>
                  <p className="point-desc">Dual background iframe & auto-closing tabs with 0% false alerts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison Matrix Wrapper */}
        <div className="landing-comparison-wrapper">
          <div className="landing-comparison-header">
            <div className="comparison-table-title-wrap">
              <div className="comparison-table-icon">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="comparison-table-heading">Full Technical Capability Matrix</h3>
                <span className="comparison-table-subheading">
                  Architecture comparison between pulseOps dual-phase keepalive and traditional HTTP uptime monitors
                </span>
              </div>
            </div>
            <span className="comparison-table-tag">Enterprise Specification</span>
          </div>

          {/* Desktop Table View (Displays on Desktop / Screens > 768px) */}
          <div className="landing-comparison-desktop">
            <table className="landing-comparison-table">
              <thead>
                <tr>
                  <th className="th-capability" style={{ width: '42%' }}>Capability & Reliability Feature</th>
                  <th className="th-pulseops" style={{ width: '33%' }}>
                    <div className="th-brand-wrap">
                      <span>pulseOps 1.0 (Dual-Phase)</span>
                    </div>
                  </th>
                  <th className="th-legacy" style={{ width: '25%' }}>Basic Uptime Pingers</th>
                </tr>
              </thead>
              <tbody>
                {matrixItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="td-feature">
                        <span className="td-title">{item.title}</span>
                        <p className="td-desc">{item.desc}</p>
                      </div>
                    </td>
                    <td className="pulseops-col-cell">
                      <span className="feature-pill-emerald">
                        <CheckCircle2 size={14} />
                        <span>{item.pulseOps}</span>
                      </span>
                    </td>
                    <td className="legacy-col-cell">
                      <span className="feature-pill-rose">
                        <X size={14} />
                        <span>{item.legacy}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View (Displays on Screens <= 768px) */}
          <div className="landing-comparison-mobile">
            {matrixItems.map((item, idx) => (
              <div key={idx} className="matrix-mobile-card">
                <div className="matrix-card-header">
                  <div className="matrix-card-number">{`0${idx + 1}`}</div>
                  <div>
                    <h4 className="matrix-card-title">{item.title}</h4>
                    <p className="matrix-card-desc">{item.desc}</p>
                  </div>
                </div>

                <div className="matrix-comparison-grid">
                  <div className="matrix-verdict-box verdict-pulseops">
                    <div className="verdict-label">
                      <span className="verdict-brand">pulseOps</span>
                    </div>
                    <div className="feature-pill-emerald">
                      <CheckCircle2 size={13} style={{ flexShrink: 0 }} />
                      <span>{item.pulseOps}</span>
                    </div>
                  </div>

                  <div className="matrix-verdict-box verdict-legacy">
                    <div className="verdict-label">
                      <span className="verdict-legacy-text">Basic Pingers</span>
                    </div>
                    <div className="feature-pill-rose">
                      <X size={13} style={{ flexShrink: 0 }} />
                      <span>{item.legacy}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: 4 Core Architecture Pillars */}
      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">
            Built for High-Stakes Interview Preparation
          </h2>
          <p className="landing-section-subtitle">
            When recruiters and hiring managers click your portfolio links, you have 5 seconds before they bounce. pulseOps guarantees your live projects are hot, responsive, and ready to impress.
          </p>
        </div>

        {/* 4 Deep Architecture Pillars Grid */}
        <div className="interview-pillars-grid">
          {/* Pillar 1: Dual-Phase Stay & Priming */}
          <div className="pillar-card">
            <div className="pillar-card-top">
              <div className="pillar-header-row">
                <div className="pillar-icon-box pillar-icon-amber">
                  <Flame size={20} />
                </div>
                <h3 className="pillar-card-title">
                  Dual-Phase Stay & Wake Logic
                </h3>
              </div>
              <p className="pillar-card-desc">
                Unlike shallow pingers that only tap endpoints, pulseOps holds a live <strong>60-second Stay Session</strong> in a silent background frame, ensuring memory caches, event loops, and DB connection pools remain fully primed.
              </p>
            </div>

            {/* Micro-Widget Simulation */}
            <div className="pillar-micro-widget widget-amber">
              <div className="pillar-widget-left">
                <Flame size={15} color="var(--amber-primary)" />
                <span>Phase 1 Stay: 60s Session</span>
              </div>
              <span className="pillar-widget-badge widget-badge-hot">
                HOT & PRIMED
              </span>
            </div>

            {/* Checklist */}
            <div className="pillar-checklist">
              <div className="pillar-check-item">
                <CheckCircle2 size={15} color="#059669" />
                <span>Eliminates 50-second cold-start delays</span>
              </div>
              <div className="pillar-check-item">
                <CheckCircle2 size={15} color="#059669" />
                <span>Primes Prisma, Mongoose & Redis pools</span>
              </div>
              <div className="pillar-check-item">
                <CheckCircle2 size={15} color="#059669" />
                <span>Sequential Phase 2 timer (zero collisions)</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Automated Smart Scheduling */}
          <div className="pillar-card">
            <div className="pillar-card-top">
              <div className="pillar-header-row">
                <div className="pillar-icon-box pillar-icon-cyan">
                  <Calendar size={20} />
                </div>
                <h3 className="pillar-card-title">
                  Automated Scheduling Matrix
                </h3>
              </div>
              <p className="pillar-card-desc">
                Smart Operating Windows (e.g. <strong>09:00 - 18:00 weekdays</strong>) keep your apps warm strictly when hiring managers review applications, saving <strong>60%+ of your cloud compute limits</strong> on Render & Fly.io.
              </p>
            </div>

            {/* Micro-Widget Simulation */}
            <div className="pillar-micro-widget widget-cyan">
              <div className="pillar-widget-left">
                <Sun size={15} color="var(--cyan-primary)" />
                <span>Recruiter Window: 09:00–18:00</span>
              </div>
              <span className="pillar-widget-badge widget-badge-window">
                SAVES 60% QUOTA
              </span>
            </div>

            {/* Checklist */}
            <div className="pillar-checklist">
              <div className="pillar-check-item">
                <CheckCircle2 size={15} color="#059669" />
                <span>1-Click presets (Recruiter, Interview Prep, 24/7)</span>
              </div>
              <div className="pillar-check-item">
                <CheckCircle2 size={15} color="#059669" />
                <span>Calendar date ranges for scheduled demo weeks</span>
              </div>
              <div className="pillar-check-item">
                <CheckCircle2 size={15} color="#059669" />
                <span>Batch apply automation across all fleet projects</span>
              </div>
            </div>
          </div>

          {/* Pillar 3: Bcrypt-12 Encrypted Vault */}
          <div className="pillar-card">
            <div className="pillar-card-top">
              <div className="pillar-header-row">
                <div className="pillar-icon-box pillar-icon-indigo">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="pillar-card-title">
                  Bcrypt-12 Encrypted Vault
                </h3>
              </div>
              <p className="pillar-card-desc">
                Zero plaintext storage. All user passwords are encrypted with <strong>12 salt rounds</strong>, and all project configurations are strictly partitioned under your private User ID in dedicated MongoDB Atlas collections.
              </p>
            </div>

            {/* Micro-Widget Simulation */}
            <div className="pillar-micro-widget widget-indigo">
              <div className="pillar-widget-left">
                <Lock size={15} color="#4f46e5" />
                <span>Stateless Signed JWT + Bcrypt</span>
              </div>
              <span className="pillar-widget-badge widget-badge-vault">
                USER SCOPED
              </span>
            </div>

            {/* Checklist */}
            <div className="pillar-checklist">
              <div className="pillar-check-item">
                <CheckCircle2 size={15} color="#059669" />
                <span>Multi-tenant private database partitioning</span>
              </div>
              <div className="pillar-check-item">
                <CheckCircle2 size={15} color="#059669" />
                <span>100% client-side sovereign data ownership</span>
              </div>
              <div className="pillar-check-item">
                <CheckCircle2 size={15} color="#059669" />
                <span>Zero tracking, telemetry isolation & instant wipe</span>
              </div>
            </div>
          </div>

          {/* Pillar 4: Live Telemetry & Backups */}
          <div className="pillar-card">
            <div className="pillar-card-top">
              <div className="pillar-header-row">
                <div className="pillar-icon-box pillar-icon-emerald">
                  <BarChart3 size={20} />
                </div>
                <h3 className="pillar-card-title">
                  Live Telemetry & JSON Backups
                </h3>
              </div>
              <p className="pillar-card-desc">
                Monitor real-time millisecond response gauges, cycle counters, and live activity streams. Export verified probe history and fleet configs with <strong>1-click portable JSON/CSV backups</strong> anytime.
              </p>
            </div>

            {/* Micro-Widget Simulation */}
            <div className="pillar-micro-widget widget-emerald">
              <div className="pillar-widget-left">
                <Timer size={15} color="#059669" />
                <span>Average Response: 24ms</span>
              </div>
              <span className="pillar-widget-badge widget-badge-latency">
                200 OK AUDITED
              </span>
            </div>

            {/* Checklist */}
            <div className="pillar-checklist">
              <div className="pillar-check-item">
                <CheckCircle2 size={15} color="#059669" />
                <span>Interactive on-demand Warmer Sandbox</span>
              </div>
              <div className="pillar-check-item">
                <CheckCircle2 size={15} color="#059669" />
                <span>Real-time Cyberpunk Terminal & Table logs</span>
              </div>
              <div className="pillar-check-item">
                <CheckCircle2 size={15} color="#059669" />
                <span>Portable JSON/CSV export & backup vault</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: 3-Step Setup Walkthrough */}
      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">
            Up & Running in 60 Seconds
          </h2>
          <p className="landing-section-subtitle">
            Three simple steps to eliminate cold-start spin delays and keep your apps responsive 24/7.
          </p>
        </div>

        <div className="landing-steps-grid">
          {/* Step 1 */}
          <div className="landing-step-card">
            <div className="step-card-top">
              <div className="step-card-header">
                <span className="step-badge step-badge-indigo">STEP 01</span>
                <div className="step-icon-wrap step-icon-indigo">
                  <Lock size={18} />
                </div>
              </div>
              <h3 className="step-card-title">Create Your Vault</h3>
              <p className="step-card-desc">
                Register your private account in seconds with zero setup friction. Bcrypt 12-round salted hashing and JWT sessions keep your credentials sovereign.
              </p>
            </div>
            <div className="step-micro-tag">
              <ShieldCheck size={14} color="#4f46e5" />
              <span>Bcrypt-12 Salted • Private Partition</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="landing-step-card">
            <div className="step-card-top">
              <div className="step-card-header">
                <span className="step-badge step-badge-cyan">STEP 02</span>
                <div className="step-icon-wrap step-icon-cyan">
                  <Globe size={18} />
                </div>
              </div>
              <h3 className="step-card-title">Add Your Endpoints</h3>
              <p className="step-card-desc">
                Paste your Render, Fly.io, or Railway URLs. Configure your 60-second stay session, custom probe intervals, and active recruiter review windows.
              </p>
            </div>
            <div className="step-micro-tag">
              <Calendar size={14} color="#0284c7" />
              <span>60s Deep Priming • Smart Windows</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="landing-step-card">
            <div className="step-card-top">
              <div className="step-card-header">
                <span className="step-badge step-badge-emerald">STEP 03</span>
                <div className="step-icon-wrap step-icon-emerald">
                  <Zap size={18} />
                </div>
              </div>
              <h3 className="step-card-title">Enjoy 100% Hot Uptime</h3>
              <p className="step-card-desc">
                pulseOps runs automated dual-phase keepalive probes so recruiters and visitors never experience a 50-second cold-start delay.
              </p>
            </div>
            <div className="step-micro-tag">
              <CheckCircle2 size={14} color="#059669" />
              <span>0.09s Instant Load • 0% Cold Starts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Interactive FAQ Accordion */}
      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">
            Frequently Asked Questions
          </h2>
          <p className="landing-section-subtitle">
            Everything you need to know about pulseOps keepalive architecture, security, and smart scheduling.
          </p>
        </div>

        <div className="landing-faq-container">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`landing-faq-card ${isOpen ? 'faq-card-open' : ''}`}
              >
                <button
                  type="button"
                  className="landing-faq-trigger"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <div className="faq-trigger-left">
                    <span className="faq-number">{`0${idx + 1}`}</span>
                    <span className="faq-question">{faq.q}</span>
                  </div>
                  <div className={`faq-chevron-icon ${isOpen ? 'chevron-rotated' : ''}`}>
                    <ChevronDown size={18} />
                  </div>
                </button>
                {isOpen && (
                  <div className="landing-faq-body">
                    <p className="faq-answer">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 7: Bottom Call To Action Banner */}
      <section className="landing-section" style={{ marginBottom: '2rem' }}>
        <div className="landing-bottom-cta">
          <div className="cta-content-wrap">
            <div className="cta-badge">
              <span>Zero Cold-Start Architecture</span>
            </div>

            <h2 className="cta-title">
              Ready for <span className="gradient-text-indigo">100% Primed Portfolio Apps</span>?
            </h2>

            <p className="cta-subtitle">
              Never let a recruiter or interviewer experience a 50-second cold-start delay again. Create your sovereign vault in 30 seconds.
            </p>

            <div className="cta-btn-group">
              <button
                type="button"
                className="btn btn-primary btn-lg btn-pill"
                onClick={() => onOpenAuthModal('signup')}
              >
                <ShieldCheck size={18} />
                <span>Get Started</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="btn cta-btn-secondary btn-lg btn-pill"
                onClick={() => onOpenAuthModal('login')}
              >
                <LogIn size={16} />
                <span>Sign In to Vault</span>
              </button>
            </div>

            <hr className="cta-divider-line" />

            {/* Trust Badges */}
            <div className="cta-trust-row">
              <div className="cta-trust-item">
                <span className="cta-trust-icon-wrap">
                  <CheckCircle2 size={13} className="cta-trust-icon" />
                </span>
                <span className="cta-trust-text">Instant Account Setup</span>
              </div>
              <div className="cta-trust-item">
                <span className="cta-trust-icon-wrap">
                  <CheckCircle2 size={13} className="cta-trust-icon" />
                </span>
                <span className="cta-trust-text">Bcrypt-12 Encrypted Vault</span>
              </div>
              <div className="cta-trust-item">
                <span className="cta-trust-icon-wrap">
                  <CheckCircle2 size={13} className="cta-trust-icon" />
                </span>
                <span className="cta-trust-text">Render & Fly.io Optimized</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Landing Minimal Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-left">
          <div
            className="landing-footer-brand"
            onClick={handleBrandClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleBrandClick(e);
              }
            }}
            style={{ cursor: 'pointer' }}
            title="Reload pulseOps"
          >
            <div className="footer-logo-icon">
              <Activity size={13} />
            </div>
            <span className="footer-brand-text">
              pulse<span className="gradient-text-indigo">Ops</span>
            </span>
          </div>
          <span className="footer-separator">•</span>
          <span className="landing-footer-copy">
            Enterprise-grade cloud dyno keepalive & warm-up engine.
          </span>
        </div>
        <div className="landing-footer-right">
          <span>&copy; {new Date().getFullYear()} pulseOps. Sovereign & Encrypted.</span>
        </div>
      </footer>
    </div>
  );
}

