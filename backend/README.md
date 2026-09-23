# ⚡ pulseOps Backend — REST API & MongoDB Atlas Sync Server

> **Node.js, Express & Mongoose API server powering pulseOps fleet synchronization, JWT authentication, and CORS-free server-to-server URL probing.**

---

## 🌟 Overview

The **pulseOps** backend provides secure, tenant-isolated cloud persistence and network proxy utilities for the pulseOps platform:
- **MongoDB Atlas Persistence**: Automatically stores user accounts, monitored project rules, intervals, stay configurations, and live telemetry audit logs.
- **CORS-Free Probe Proxy (`/api/projects/probe`)**: Pings external servers from the backend environment, delivering accurate HTTP status codes (200, 401, 404, 500) and response latency measurements without browser CORS restrictions.
- **JWT Authentication with Bcrypt**: Secure token-based session verification with encrypted passwords.

---

## 🛠️ Technology Stack

- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 4](https://expressjs.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) via [Mongoose 8](https://mongoosejs.com/)
- **Security & Auth**: [JSON Web Tokens (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken) + [Bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Middleware**: [Cors](https://github.com/expressjs/cors), [Morgan](https://github.com/expressjs/morgan), [Dotenv](https://github.com/motdotla/dotenv)

---

## 📁 Backend Structure

```
backend/
├── config/
│   └── db.js                 # Mongoose connection manager with auto-reconnect
│
├── controllers/
│   ├── authController.js     # User registration, login & JWT profile retrieval
│   ├── projectController.js  # Project CRUD, cycle resets, bulk import & URL probe
│   └── logController.js      # Activity stream telemetry querying & purging
│
├── middleware/
│   └── authMiddleware.js     # Bearer token verification & user population
│
├── models/
│   ├── Log.js                # Activity log entry Mongoose schema
│   ├── Project.js            # Monitored project Mongoose schema
│   └── User.js               # User account schema with bcrypt password hashing
│
├── routes/
│   ├── authRoutes.js         # Routes for /api/auth
│   ├── projectRoutes.js      # Routes for /api/projects
│   └── logRoutes.js          # Routes for /api/logs
│
├── .env                      # Local environment secrets
├── .env.example              # Environment template for deployment
├── .gitignore                # Backend git ignore configuration
├── package.json              # Backend dependencies & start scripts
└── server.js                 # Express application initialization & middleware
```

---

## 📡 REST API Reference

### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user (`name, email, password`) | No |
| `POST` | `/api/auth/login` | Authenticate user & receive signed JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | **Yes (Bearer)** |

---

### 2. Projects & Fleet Endpoints (`/api/projects`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/projects/probe` | Server-to-server proxy probe for any URL | No (Public) |
| `GET` | `/api/projects` | Fetch all monitored projects for authenticated user | **Yes (Bearer)** |
| `POST` | `/api/projects` | Create a new monitored project | **Yes (Bearer)** |
| `PUT` | `/api/projects/:id` | Update project configuration, interval, or schedule | **Yes (Bearer)** |
| `DELETE` | `/api/projects/:id` | Irreversibly delete project | **Yes (Bearer)** |
| `PATCH` | `/api/projects/:id/toggle` | Toggle enabled status (resets cycle count to 0) | **Yes (Bearer)** |
| `POST` | `/api/projects/:id/restart` | Reset cycle counter to 0 & trigger immediate warm | **Yes (Bearer)** |
| `POST` | `/api/projects/reset-defaults` | Clear all projects for user | **Yes (Bearer)** |
| `POST` | `/api/projects/import` | Bulk import / overwrite project fleet from JSON | **Yes (Bearer)** |

---

### 3. Activity Stream Endpoints (`/api/logs`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/logs?limit=50` | Fetch recent telemetry audit logs | **Yes (Bearer)** |
| `POST` | `/api/logs` | Record a new probe / cycle completion event | **Yes (Bearer)** |
| `DELETE` | `/api/logs` | Purge all activity logs for authenticated user | **Yes (Bearer)** |

---

### 4. Health Check Endpoint (`/api/health`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Check Express server and MongoDB Atlas connection status | No |

---

## 🏃 Quick Start Guide

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your MongoDB Atlas connection string:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/pulseOps?retryWrites=true&w=majority
CORS_ORIGIN=*
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=30d
```

### 3. Start the Server
```bash
npm start
```
Server runs on [http://localhost:5000](http://localhost:5000).

---

## 🌐 Production Deployment

Deploy the backend to any Node.js cloud platform:

- **Render (Web Service)**:
  - Runtime: `Node`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Environment Variables: Set `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `PORT`.
- **Railway**: Connect repository, select root directory `backend`, and set environment variables.
- **Fly.io**: Run `fly launch` inside `backend/` directory.

---

## 📜 License
MIT © 2026 Tejas
