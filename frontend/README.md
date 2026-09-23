# ⚡ pulseOps Frontend — Intelligent Keepalive & Cold-Start Warmer Dashboard

> **Modern React 19 + Vite dashboard for continuous cloud keepalive, multi-schedule automation, and real-time response telemetry.**

---

## 🌟 Overview

The **pulseOps** frontend is a high-performance, cyberpunk-obsidian web application built with **React 19**, **Vite**, and **Vanilla CSS tokens**. It allows developers to monitor, prime, and keep their live applications awake on Render, Fly.io, Vercel, and Heroku with zero cold-start delay during interviews, recruiter reviews, and client demos.

---

## 🚀 Key Client Features

- **📊 Comprehensive Fleet Dashboard**:
  - Live 4-card telemetry stats: *Total Monitored Apps*, *Awake & Primed*, *In Keepalive Stay (Phase 1)*, and *Average Fleet Latency*.
  - Search and filter by status (*All*, *Awake*, *Staying*, *Scheduled*, *Dormant*, *Paused*).
  - One-click batch actions: **Ping All**, **Enable All**, **Pause All**, and **Open All**.

- **⏱️ Dual Sequential Timers (Phase 1 $\to$ Phase 2)**:
  - **Phase 1: Stay on Site**: Keeps the dyno connection primed for your selected stay duration (15s–120s or custom seconds).
  - **Phase 2: Interval Countdown**: The repeat interval countdown activates **only after** the stay duration completes, guaranteeing non-overlapping, predictable warming cycles.

- **🛡️ Two Keepalive Execution Modes**:
  - **⚡ Silent Background Frame (`stayMode: 'background'`)**: Silently warms your site in the background every 10 seconds via backend probe proxy without triggering popups or CORS/CORB issues.
  - **🗂️ Auto-Tab / Recruiter Mode (`stayMode: 'tab'`)**: Spawns your project in a browser tab and automatically closes it when the countdown reaches zero.

- **📅 2-Stage Scheduling Matrix**:
  - **Stage 1 (Calendar Date Range)**: *Permanent (Always Active)* or specific calendar start/end dates.
  - **Stage 2 (Daily Operating Hours)**: *24/7 Continuous* or recurring daily windows (e.g., `09:00 - 18:00` Recruiter hours or custom daytime/overnight windows).

- **📜 Real-time Activity Stream Console**:
  - Live probe audit feed with millisecond latency measurements, HTTP status codes, and completed cycle numbers.
  - Export audit history directly to **CSV** or **JSON**.

- **🔐 Encrypted Vault & Settings**:
  - Portable JSON backup export and import.
  - Live round-trip MongoDB Atlas health diagnostics.
  - User profile management with JWT authentication.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS Design Tokens (Glassmorphism, Dark Obsidian Palette, Glowing Indicators)
- **State & Data**: Custom React Hooks (`useProjectMonitor`, `useAuth`, `useLocalStorage`)
- **Transport**: Fetch API + Backend Proxy Integration

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx            # Sign in & registration modal with strength meter
│   │   ├── BackgroundWarmer.jsx     # Headless background keepalive engine
│   │   ├── ConfirmModal.jsx         # Custom confirmation dialogs with Esc/backdrop freeze
│   │   ├── Header.jsx               # Top brand bar, Add CTA & signout
│   │   ├── ImportExportModal.jsx    # Vault JSON export, import & inspector
│   │   ├── InfoBanner.jsx           # Popup blocker detection banner
│   │   ├── NavigationBar.jsx        # Modern 4-tab navigation pill bar
│   │   ├── ProjectCard.jsx          # Interactive fleet project card with live timers
│   │   ├── ProjectList.jsx          # Grid/Table fleet view & top telemetry stats
│   │   └── ProjectModal.jsx         # 2-stage project creation & schedule builder
│   │
│   ├── context/
│   │   └── AuthContext.jsx          # Global JWT auth provider & user state
│   │
│   ├── hooks/
│   │   ├── useLocalStorage.js       # Resilient JSON localStorage hook
│   │   └── useProjectMonitor.js     # Live countdown loop, stay sessions & DB sync
│   │
│   ├── pages/
│   │   ├── ActivityStreamPage.jsx   # Live telemetry console & CSV/JSON export
│   │   ├── DashboardPage.jsx        # Fleet control center & alerts
│   │   ├── LandingPage.jsx          # Hero onboarding & interactive simulator
│   │   ├── SchedulesPage.jsx        # Visual automation schedule matrix
│   │   └── SettingsPage.jsx         # Atlas diagnostics, backups & danger zone
│   │
│   ├── utils/
│   │   ├── api.js                   # REST API client with JWT bearer handling
│   │   ├── projectChecker.js        # Latency probe with server proxy + client fallback
│   │   ├── scheduleHelper.js        # Date window & daily hours schedule calculations
│   │   └── storage.js               # Storage keys & JSON export helper
│   │
│   ├── App.jsx                      # Main application shell & routing
│   ├── index.css                    # Design system tokens, utilities & animations
│   └── main.jsx                     # Vite mount entry & production console shield
│
├── .env                             # Local environment variables
├── .env.example                     # Environment configuration template
├── .gitignore                       # Frontend git ignore configuration
├── index.html                       # HTML5 entry with meta SEO tags
├── package.json                     # Frontend dependencies & scripts
└── vite.config.js                   # Vite configuration
```

---

## 🏃 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `VITE_API_URL` points to your running backend:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
The optimized static bundle will be generated in `frontend/dist/`.

---

## 🌐 Production Deployment

The frontend produces standard static assets (`dist/`) compatible with any static web host:

- **Vercel**: Set Build Command to `npm run build` and Output Directory to `dist`.
- **Netlify**: Set Build Command to `npm run build` and Publish Directory to `dist`.
- **Render (Static Site)**: Set Build Command to `npm run build` and Publish Directory to `dist`.
- **Cloudflare Pages**: Set Output Directory to `dist`.

---

## 📜 License
MIT © 2026 Tejas
