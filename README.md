# ⚡ pulseOps — Full-Stack MERN Portfolio Uptime Monitor & Cold-Start Warmer

<p align="center">
  <img src="https://img.shields.io/badge/pulseOps-1.0.0-6366f1?style=for-the-badge&logo=activity&logoColor=white" alt="pulseOps Version" />
  <img src="https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6.0-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB_Atlas-8.0-47a248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Atlas" />
  <img src="https://img.shields.io/badge/License-MIT-amber?style=for-the-badge" alt="License" />
</p>

> **Never let your Render, Vercel & Fly.io projects go cold before an interview, client demo, or recruiter review.**  
> **pulseOps** keeps your live applications pre-warmed, responsive, and continuously healthy with dual sequential warming loops, multi-mode stay sessions, 2-stage scheduling automation, and real-time MongoDB Atlas cloud persistence.

---

## 🌟 Table of Contents
1. [The Problem & The Solution](#-the-problem--the-solution)
2. [Key Features & Capabilities](#-key-features--capabilities)
3. [System Architecture & Data Flow](#-system-architecture--data-flow)
4. [Monorepo Directory Layout](#-monorepo-directory-layout)
5. [Quick Start Guide](#-quick-start-guide)
6. [Environment Variables Matrix](#-environment-variables-matrix)
7. [REST API Documentation](#-rest-api-documentation)
8. [Deployment Playbook](#-deployment-playbook)
9. [Security & Production Hardening](#-security--production-hardening)
10. [License](#-license)

---

## 🎯 The Problem & The Solution

### The Cold-Start Dilemma
Free-tier and serverless container platforms (such as **Render**, **Fly.io**, **Vercel Functions**, and **Heroku**) spin down inactive web services after **10 to 15 minutes of inactivity** to conserve CPU cycles. When an interviewer, recruiter, or potential client clicks a project link from your resume or portfolio:
- The server takes **50+ seconds** to perform a cold-start boot.
- Browsers often return a **504 Gateway Timeout** before the dyno finishes spinning up.
- First impressions are compromised.

### The pulseOps Solution
**pulseOps** provides an automated, non-invasive warming fleet:
- **Zero Cold Starts**: Periodically pings endpoints to keep worker threads hot and database connections cached.
- **Dual-Phase Non-Overlapping Timers**: Simulates genuine human visits by staying on site (*Phase 1: Stay Session*) before initiating the rest interval (*Phase 2: Interval Countdown*).
- **Silent Background Frames & Auto-Tabs**: Dispatches probes silently without intrusive popups or runs in auto-closing recruiter tabs.
- **Zero Browser Errors**: Routes keepalive pulses through an internal backend proxy, eliminating all browser CORS and CORB warnings.

---

## 🚀 Key Features & Capabilities

### 1. 🍃 Full MERN Stack with MongoDB Atlas
- **Automatic Cloud Sync**: Persists all monitored projects, schedule windows, probe latencies, cycle counts, and activity stream history directly into your MongoDB Atlas cluster.
- **Offline & Standby Resiliency**: Instantaneous fallback to browser LocalStorage indexed cache if the backend is starting up or temporarily offline.

### 2. ⏱️ Dual Independent Sequential Timers (Phase 1 $\to$ Phase 2)
- **Phase 1 (Stay on Site)**: Engages upon wake-up ping for the exact duration you configure (e.g., 60 seconds).
- **Phase 2 (Interval Countdown Activation)**: The repeat interval countdown activates and begins counting down **only after** the stay session has fully finished, guaranteeing non-overlapping, predictable warming cycles.

### 3. 🛡️ Multi-Mode Stay Mechanisms
- **⚡ Silent Background Frame (`stayMode: 'background'`)**: Dispatches lightweight keepalive pulses every 10 seconds via the backend probe proxy without opening popups or tabs.
- **🗂️ Auto-Tab / Recruiter Mode (`stayMode: 'tab'`)**: Spawns your site in an actual browser tab and automatically closes it the moment the stay countdown hits zero.
- **🚫 Instant Probe**: Standard HTTP latency ping with 0s stay duration.

### 4. 📅 2-Stage Scheduling Matrix
- **Stage 1 (Calendar Date Range)**: *Permanent (Always Active)* or specific calendar start/end dates and times (e.g., active during interview prep week).
- **Stage 2 (Daily Operating Hours)**: *24/7 Continuous* or recurring daily windows (e.g., `09:00 - 18:00` Recruiter hours or custom daytime/overnight windows).

### 5. 📜 Real-time Activity Stream & Telemetry
- Live event feed tracking HTTP response status codes, millisecond latencies, stay durations, and completed cycle milestones (`Cycle #N`).
- Search and filter by event category (*All*, *Awake*, *Stay Sessions*, *Milestones*, *Errors*).
- One-click export to **CSV** or **JSON**.

### 6. 🔐 Encrypted Vault & Portability
- One-click portable JSON configuration backups.
- Round-trip database and API diagnostics directly inside the settings vault without noisy top-bar alerts.
- Complete data control with Danger Zone purge utilities.

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Client [Browser - React 19 Frontend]
        UI[User Dashboard & Fleet Cards]
        Engine[Monitoring & Countdown Engine]
        Warmer[Background Warmer Component]
        LocalStore[(LocalStorage Fallback Cache)]
    end

    subgraph Backend [Node.js Express Server]
        API[Express REST API - /api]
        AuthMid[JWT Bearer Middleware]
        ProxyProbe[CORS-Free Proxy Probe Controller]
    end

    subgraph CloudTargets [External Cloud Hosts]
        Render[Render Web Services]
        Fly[Fly.io Apps]
        Vercel[Vercel Serverless Functions]
        Custom[Custom API Endpoints]
    end

    subgraph Database [MongoDB Atlas Cloud]
        Atlas[(pulseOps Database)]
        CollUsers[Users Collection]
        CollProjects[Projects Collection]
        CollLogs[Logs Collection]
    end

    UI --> Engine
    Engine --> Warmer
    Engine <--> LocalStore
    Engine <-->|REST API + Bearer JWT| API

    Warmer -->|POST /api/projects/probe| ProxyProbe
    ProxyProbe -->|Server-to-Server GET Ping| Render
    ProxyProbe -->|Server-to-Server GET Ping| Fly
    ProxyProbe -->|Server-to-Server GET Ping| Vercel
    ProxyProbe -->|Server-to-Server GET Ping| Custom

    API --> AuthMid
    AuthMid --> Atlas
    Atlas --- CollUsers
    Atlas --- CollProjects
    Atlas --- CollLogs
```

---

## 📁 Monorepo Directory Layout

```
pulseOps/
├── backend/                  # Node.js + Express + Mongoose REST API
│   ├── config/
│   │   └── db.js             # Mongoose connection manager with auto-reconnect
│   ├── controllers/
│   │   ├── authController.js    # Registration, login & JWT user profile retrieval
│   │   ├── projectController.js # Fleet CRUD, cycle reset, bulk import & proxy probe
│   │   └── logController.js     # Querying & purging activity stream logs
│   ├── middleware/
│   │   └── authMiddleware.js # JWT Bearer token verification
│   ├── models/
│   │   ├── User.js           # User schema with bcrypt password hashing
│   │   ├── Project.js        # Project schema (intervals, stay, schedules, cycles)
│   │   └── Log.js            # Telemetry audit log schema
│   ├── routes/
│   │   ├── authRoutes.js     # /api/auth routes
│   │   ├── projectRoutes.js  # /api/projects routes
│   │   └── logRoutes.js      # /api/logs routes
│   ├── server.js             # Express entry point (Port 5000)
│   ├── .env                  # Backend local environment secrets
│   ├── .env.example          # Backend environment deployment template
│   ├── .gitignore            # Backend git ignore configuration
│   └── README.md             # Dedicated Backend Documentation
│
├── frontend/                 # React 19 + Vite Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx        # Login/Signup modal with strength meter
│   │   │   ├── BackgroundWarmer.jsx # Headless keepalive engine
│   │   │   ├── ConfirmModal.jsx     # Dialogs with backdrop freeze & Escape listener
│   │   │   ├── Header.jsx           # Top brand bar, Add CTA & signout button
│   │   │   ├── ImportExportModal.jsx# Vault JSON backup/restore & inspector
│   │   │   ├── InfoBanner.jsx       # Popup blocker detection alert
│   │   │   ├── NavigationBar.jsx    # 4-tab modern navigation pill bar
│   │   │   ├── ProjectCard.jsx      # Fleet project card with live reverse countdown
│   │   │   ├── ProjectList.jsx      # Grid/Table view & top fleet telemetry stats
│   │   │   └── ProjectModal.jsx     # 2-stage project builder & schedule matrix
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global authentication provider & user state
│   │   ├── hooks/
│   │   │   ├── useLocalStorage.js   # Resilient JSON localStorage hook
│   │   │   └── useProjectMonitor.js # Ticker loop, stay sessions & Atlas sync
│   │   ├── pages/
│   │   │   ├── ActivityStreamPage.jsx # Live telemetry feed & CSV/JSON export
│   │   │   ├── DashboardPage.jsx    # Fleet control center & alerts
│   │   │   ├── LandingPage.jsx      # Hero onboarding & interactive simulator
│   │   │   ├── SchedulesPage.jsx    # Automation schedule matrix
│   │   │   └── SettingsPage.jsx     # Atlas diagnostics, backups & danger zone
│   │   ├── utils/
│   │   │   ├── api.js               # REST client with JWT Bearer auth
│   │   │   ├── projectChecker.js    # Latency probe with proxy + client fallback
│   │   │   ├── scheduleHelper.js    # Schedule status & window calculations
│   │   │   └── storage.js           # Storage keys & JSON export helper
│   │   ├── App.jsx                  # Main application shell & routing
│   │   ├── index.css                # Vanilla CSS design tokens & animations
│   │   └── main.jsx                 # React root mount & production console shield
│   ├── .env                         # Frontend local environment variables
│   ├── .env.example                 # Frontend environment deployment template
│   ├── .gitignore                   # Frontend git ignore configuration
│   ├── index.html                   # HTML5 entry with meta tags
│   └── README.md                    # Dedicated Frontend Documentation
│
├── .gitignore                       # Repository-wide monorepo git ignore
├── package.json                     # Monorepo root scripts & metadata
└── README.md                        # Master Full-Stack Documentation
```

---

## 🏃 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI (or local MongoDB)

---

### Step 1: Install Dependencies
Install dependencies for both backend and frontend in one step:
```bash
npm run install:all
```
*(Or run `npm install` inside `/backend` and `/frontend` individually).*

---

### Step 2: Configure Environment Variables

#### Backend Environment:
Copy `backend/.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` with your MongoDB Atlas connection string and a secure JWT secret:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/pulseOps?retryWrites=true&w=majority
CORS_ORIGIN=*
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=30d
```

#### Frontend Environment:
Copy `frontend/.env.example` to `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```
Ensure `VITE_API_URL` points to your backend:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 3: Launch pulseOps

#### Terminal 1 — Start Backend Server:
```bash
npm run server
# 🚀 pulseOps Backend Server running on http://localhost:5000
```

#### Terminal 2 — Start Frontend Dashboard:
```bash
npm run client
# ⚡ Local: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start managing your fleet!

---

## 🔐 Environment Variables Matrix

| Scope | Variable | Purpose | Default / Example |
| :--- | :--- | :--- | :--- |
| **Backend** | `PORT` | Express server listening port | `5000` |
| **Backend** | `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/pulseOps` |
| **Backend** | `CORS_ORIGIN` | Allowed CORS origins (`*` or domain) | `*` or `https://pulseops.dev` |
| **Backend** | `JWT_SECRET` | Secret key for signing session tokens | `your_32_character_jwt_secret_key` |
| **Backend** | `JWT_EXPIRES_IN` | Token validity expiration | `30d` |
| **Frontend** | `VITE_API_URL` | Backend REST API endpoint URL | `http://localhost:5000/api` |

---

## 📡 REST API Documentation

### 1. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user (`name, email, password`) | No |
| `POST` | `/api/auth/login` | Authenticate user & receive signed JWT bearer token | No |
| `GET` | `/api/auth/me` | Fetch current authenticated user profile | **Yes (Bearer)** |

---

### 2. Fleet & Keepalive Endpoints (`/api/projects`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/projects/probe` | Server-to-server proxy probe for any external URL | No (Public) |
| `GET` | `/api/projects` | Fetch all monitored projects for authenticated user | **Yes (Bearer)** |
| `POST` | `/api/projects` | Create a new monitored project | **Yes (Bearer)** |
| `PUT` | `/api/projects/:id` | Update project configuration, interval, or schedule | **Yes (Bearer)** |
| `DELETE` | `/api/projects/:id` | Permanently delete monitored project | **Yes (Bearer)** |
| `PATCH` | `/api/projects/:id/toggle` | Toggle enabled/paused status (resets cycle count) | **Yes (Bearer)** |
| `POST` | `/api/projects/:id/restart` | Reset cycle counter to 0 & trigger immediate warm | **Yes (Bearer)** |
| `POST` | `/api/projects/reset-defaults` | Clear all projects for user | **Yes (Bearer)** |
| `POST` | `/api/projects/import` | Bulk import / overwrite project fleet from JSON | **Yes (Bearer)** |

---

### 3. Activity Stream Endpoints (`/api/logs`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/logs?limit=50` | Fetch recent telemetry audit logs | **Yes (Bearer)** |
| `POST` | `/api/logs` | Record a new probe / cycle completion milestone | **Yes (Bearer)** |
| `DELETE` | `/api/logs` | Purge all activity logs for authenticated user | **Yes (Bearer)** |

---

### 4. Health Check Endpoint (`/api/health`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Check Express server and MongoDB Atlas connection status | No |

---

## 🌐 Deployment Playbook

### Backend Deployment (e.g., Render / Railway / Fly.io)
1. Create a new **Node.js Web Service** pointing to the repository's `backend/` directory.
2. Set Build Command: `npm install`
3. Set Start Command: `npm start`
4. Set Environment Variables in dashboard: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `PORT`.

### Frontend Deployment (e.g., Vercel / Netlify / Cloudflare Pages)
1. Create a new **Static Web App** pointing to the repository's `frontend/` directory.
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Set Environment Variable: `VITE_API_URL=https://your-backend-api.onrender.com/api`

---

## 🔒 Security & Production Hardening

- **Zero Console Data Leaks**: All debug outputs and stack traces are suppressed in production builds via the production console shield in [main.jsx](file:///d:/dev/The%20Projects/pulseOps/frontend/src/main.jsx).
- **Password Encryption**: User passwords are encrypted using `bcryptjs` with salt rounds and excluded from queries by default (`select: false`).
- **Tenant Partitioning**: All project and log operations in MongoDB are strictly scoped to the authenticated user's `userId`.
- **CORS & CORB Elimination**: Keepalive pulses route via backend proxy probes with fallback pre-fetch image probes, preventing browser security blockages.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Crafted with ❤️ by <strong>Tejas</strong> • Powered by React 19 & MongoDB Atlas
</p>
