# VMS Monitor — Professional IP Camera Surveillance Dashboard

<p align="center">
  <img src="https://cdn.bkappi.com/ProjectsAssets/VMS-Monitor/GithubReadmeAssets/camerasViewDarkTheme.png" alt="VMS Monitor - Camera Grid View" width="100%" />
</p>

> A high-performance **Video Management System (VMS)** for real-time IP camera monitoring. Featuring ONVIF auto-discovery, ultra-low latency RTSP transcoding, 5 premium grid layouts, PTZ control, drag-and-drop reordering, system resource monitoring, dark/light themes, and multi-language support.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-required-007808?logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)
[![License](https://img.shields.io/badge/License-MIT-8b5cf6)](LICENSE)

---

## Features

### Camera Grid Views

<p align="center">
  <img src="https://cdn.bkappi.com/ProjectsAssets/VMS-Monitor/GithubReadmeAssets/camerasViewDarkTheme.png" alt="Camera Grid View" width="100%" />
</p>

**5 precision-engineered 16:9 grid layouts** — all cells maintain strict widescreen proportions, eliminating black bars (pillarbox/letterbox):

| Layout | Cameras | Description |
|--------|---------|-------------|
| **Dual Grid 2×2** | 4 | Equal cells — ideal for focused monitoring |
| **Grid 3×3** | 9 | 9 cameras displayed harmonically |
| **High-Density 4×4** | 16 | Maximum simultaneous coverage |
| **Spotlight 3×3** | 6 | 1 enlarged 2×2 main camera + 5 satellite feeds |
| **Spotlight 4×4** | 8 | 1 giant 3×3 main camera + 7 satellite feeds in an "L" |

### Auto-Discovery

Automatically scans the local subnet for cameras with open RTSP port `554`, then probes ONVIF capabilities on common HTTP ports (`80`, `5000`, `8000`, `8080`, `8899`, `37777`). Zero manual configuration required for ONVIF-compatible cameras.

### Ultra-Low Latency Streaming

The backend spawns on-demand **FFmpeg** child processes to transcode RTSP H.264 streams to MPEG-1 in real-time, delivering binary data via **WebSockets** directly to a `<canvas>` rendered by **JSMpeg** — achieving latency under **0.5 seconds**.

### PTZ Control

Control **Pan, Tilt & Zoom** via an interactive D-Pad from the camera zoom/focus panel with **3 speed levels** (Slow, Medium, Fast) and an automatic failsafe stop after 500ms.

### Drag & Drop Reorder

Rearrange cameras in the grid by dragging cards to any position. The new order is instantly applied and persisted to the local database.

### System Resource Monitoring

<p align="center">
  <img src="https://cdn.bkappi.com/ProjectsAssets/VMS-Monitor/GithubReadmeAssets/ResourceUsageCpuRamDark.png" alt="Resource Monitoring" width="100%" />
</p>

Live dashboard with metrics refreshed every **2.5 seconds**:

- **CPU** — real-time usage %, processor model, thread count
- **RAM** — total, used, free memory + backend process RSS
- **Active Streams** — list of all active FFmpeg transcoding processes with connected client count
- **Uptime** — host OS uptime and VMS server uptime

### Camera Management List

<p align="center">
  <img src="https://cdn.bkappi.com/ProjectsAssets/VMS-Monitor/GithubReadmeAssets/CamerasListDark.png" alt="Camera Management List" width="100%" />
</p>

Unified table view with search, online/offline status badges, per-camera stream controls, and manual camera registration.

### Additional Features

- **Eco Mode** — pause all active streams to reduce CPU/bandwidth usage
- **Dark / Light Themes** — automatically detects OS preference (`prefers-color-scheme`) with dark mode as fallback
- **Multi-Language** — English and Portuguese via i18next; architecture ready for more languages
- **Instant Snapshots** — download pixel-perfect PNGs from any active live stream
- **Fullscreen Mode** — one-click fullscreen for the entire VMS dashboard

---

## Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** + Vite | UI framework + build tool |
| **TypeScript** | Type safety |
| **Redux Toolkit** | Global state management |
| **TailwindCSS** | Glassmorphism + neon styling |
| **i18next** | Internationalization |
| **JSMpeg** | Canvas 2D MPEG-1 video rendering |
| **Lucide React** | Icon library |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** + **Express** | REST API server |
| **TypeScript** | Type safety |
| **ws** | WebSocket server for binary stream delivery |
| **fluent-ffmpeg** | FFmpeg process orchestration |
| **@2bad/onvif** | ONVIF SOAP protocol for discovery & PTZ |
| **Helmet** + **CORS** | Security middleware |

---

## Project Structure

```
vms-monitor/
├── frontend/                     # React 18 + Vite application
│   └── src/
│       ├── modules/
│       │   ├── Dashboard/        # Main VMS domain (DDD)
│       │   │   ├── components/   # UI components (Grid, Header, Card, Resources...)
│       │   │   ├── hooks/        # Custom React hooks
│       │   │   ├── pages/        # Dashboard page
│       │   │   ├── services/     # API service layer
│       │   │   ├── store/        # Redux slice
│       │   │   └── types/        # TypeScript types
│       │   └── Theme/            # Theme context, hooks, toggle component
│       ├── i18n.ts               # Internationalization config (EN + PT)
│       └── store/                # Root Redux store
│
├── backend/                      # Express + WebSocket API
│   ├── bin/                      # Local FFmpeg binary (fallback)
│   ├── src/
│   │   ├── controllers/          # HTTP request handlers
│   │   ├── services/             # Business logic (Stream, Camera, System)
│   │   ├── repositories/         # Data persistence (SQLite)
│   │   ├── routes/               # API route definitions
│   │   ├── middlewares/          # Error handler
│   │   ├── config/               # App configuration (ports, env)
│   │   └── server.ts             # Express + WebSocket bootstrap
│   └── .env.example              # Environment variable template
│
├── landing-page/                 # Static HTML/CSS/JS landing page
├── setup-vms.bat                 # Windows: first-time setup script
├── start-vms.bat                 # Windows: start all servers
├── stop-vms.bat                  # Windows: stop all servers
├── install-ffmpeg.ps1            # PowerShell: auto-install FFmpeg
└── package.json                  # Workspace root (concurrently runner)
```

---

## Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org/)
- **FFmpeg** — [ffmpeg.org](https://ffmpeg.org/download.html)
  - **Windows**: Download a full build, extract it (e.g., to `C:\ffmpeg`), and add `C:\ffmpeg\bin` to your system `PATH` environment variable. Alternatively, run `setup-vms.bat` and choose the automatic install option.
  - **Linux/macOS**: `sudo apt install ffmpeg` or `brew install ffmpeg`

---

## Installation

### Windows — Automated (Recommended)

The project includes three `.bat` scripts that automate the entire lifecycle:

#### 1. `setup-vms.bat` — First-time setup

Double-click this file to:
- Check for Node.js and FFmpeg installations
- Offer automatic local FFmpeg download if not found in PATH
- Copy `backend/.env.example` → `backend/.env`
- Install all root and submodule (frontend + backend) Node.js dependencies

> Run this only once after cloning the repository.

#### 2. `start-vms.bat` — Start the application

Double-click to:
- Start both the backend (Express + WebSocket) and frontend (Vite) servers concurrently
- Automatically open `http://localhost:42100` in your default browser

#### 3. `stop-vms.bat` — Stop the application

Double-click to:
- Gracefully stop all running servers and FFmpeg transcoding processes
- Free ports `42100`, `42200`, and `42300`

---

### Manual CLI Setup

```bash
# 1. Clone the repository
git clone https://github.com/BrunoKappi/vms-monitor.git
cd vms-monitor

# 2. Install root workspace dependencies
npm install

# 3. Install all frontend and backend dependencies
npm run install-all

# 4. Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your camera credentials

# 5. Start both servers
npm run dev
```

Open your browser at: **http://localhost:42100**

---

## Environment Variables

Edit `backend/.env` after installation:

```env
PORT=42200                                  # REST API port
WS_STREAM_PORT=42300                        # WebSocket streaming port
FRONTEND_PORT=42100                         # Vite dev server port
CAMERA_DEFAULT_USER=admin                   # Default username for discovery
CAMERA_DEFAULT_PASS=yourpassword            # Default password for discovery
CAMERA_DEFAULT_IPS=192.168.1.24,192.168.1.8 # Known camera IPs (comma-separated)
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `42200` | Express REST API server port |
| `WS_STREAM_PORT` | `42300` | WebSocket server for MPEG-1 binary streams |
| `FRONTEND_PORT` | `42100` | Vite development server port |
| `CAMERA_DEFAULT_USER` | `admin` | Username used during ONVIF auto-discovery |
| `CAMERA_DEFAULT_PASS` | — | Password used during ONVIF auto-discovery |
| `CAMERA_DEFAULT_IPS` | — | Comma-separated list of known camera IPs for faster scanning |

---

## Available Scripts

From the project root:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend concurrently |
| `npm run install-all` | Install dependencies for both frontend and backend |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cameras` | List all registered cameras |
| `POST` | `/api/cameras` | Register a new camera |
| `DELETE` | `/api/cameras/:id` | Remove a camera |
| `POST` | `/api/cameras/discover` | Trigger ONVIF subnet discovery |
| `PUT` | `/api/cameras/reorder` | Persist camera display order |
| `GET` | `/api/system/metrics` | Get CPU, RAM, uptime, and active streams |
| `POST` | `/api/system/shutdown` | Gracefully shutdown all VMS servers |

---

## Developer

**Bruno Kappi** — Fullstack Developer & Systems Analyst  
Novo Hamburgo, Rio Grande do Sul, Brazil

- Portfolio: [myportfolio.bkappi.com](https://myportfolio.bkappi.com/)
- LinkedIn: [linkedin.com/in/brunokappi](https://www.linkedin.com/in/brunokappi/)
- Blog: [blog.bkappi.com](https://blog.bkappi.com/)

---

## License

This project is licensed under the **MIT License**.
