📘 BACKEND — backend/README.md
# CognitiveSense AI – Backend (Realtime ML Inference Server)

This backend is the **core intelligence layer** of the CognitiveSense AI system.  
It is responsible for **real-time behavioral data aggregation, ML inference, and live streaming of predictions** to frontend clients via HTTP and WebSockets.

---

## 🧠 Core Responsibilities

- Capture **live user interaction signals**
  - Keyboard activity
  - Mouse movement
  - Eye-tracking (OpenCV + MediaPipe)
- Aggregate signals into feature vectors
- Run **ML inference in real time**
- Stream predictions to multiple clients simultaneously
- Maintain short-term state history for analytics

---

## 🏗 Architecture Overview



Keyboard / Mouse / Eye Tracker
↓
RealTimeAggregator
↓
Feature Vector
↓
ML Model (Random Forest / Torch-ready)
↓
FastAPI Server
├── REST APIs
└── WebSocket (/ws/live)


---

## 📂 Folder Structure



backend/
├── src/
│ └── realtime/
│ ├── realtime_server.py # FastAPI entrypoint
│ ├── infer.py # ModelServer (ML inference)
│ ├── aggregator.py # Feature aggregation logic
│ ├── keyboard_listener.py # Keyboard activity capture
│ ├── mouse_listener.py # Mouse activity capture
│ ├── eye_tracker.py # Eye tracking (OpenCV + MediaPipe)
│ └── live_data_collector.py # Unified live data pipeline
│
├── models/
│ └── rf_baseline.joblib # Trained ML model
│
├── requirements.txt
├── README.md
└── venv/


---

## 🤖 Machine Learning Model

### Model Type
- **Random Forest Classifier**
- Stored as: `models/rf_baseline.joblib`

### Output Labels

| ID | Label     | Meaning                     |
|----|----------|-----------------------------|
| 0  | Normal   | Focused / stable behavior   |
| 1  | Stressed | Cognitive overload detected |
| 2  | Fatigued | Low attention / fatigue     |

### Inference Output Payload

```json
{
  "label_id": 1,
  "label_name": "Stressed",
  "confidence": 0.81,
  "features": { "...": "..." },
  "proba": [0.1, 0.81, 0.09],
  "history": [
    { "time": 1710000000, "label": 1 }
  ]
}

🌐 API Endpoints
REST
Endpoint	Method	Description
/health	GET	Server health check
/predict	POST	Manual feature-based inference
/predict_live	POST	Automatic real-time inference
WebSocket (Core Feature)
ws://127.0.0.1:8000/ws/live


Streams inference every ~3 seconds

Supports multiple concurrent clients

Used by:

Web dashboard

Electron main window

Electron PiP overlay

▶ Running the Backend
1. Activate virtual environment
cd backend
.\venv\Scripts\activate

2. Install dependencies
pip install -r requirements.txt

3. Start server
python -m uvicorn src.realtime.realtime_server:app --reload --port 8000

🔐 Notes & Design Decisions

WebSocket supports multiple renderers (important for Electron)

Backend is stateless per client

No frontend-specific assumptions

Ready for future Torch / deep models

🚀 Future Extensions

Model hot-swapping

User-specific baselines

GPU inference

Cloud deployment (Docker / K8s)

Backend Status: ✅ Stable, production-ready


---

# 📘 FRONTEND — `frontend/README.md`

```md
# CognitiveSense AI – Frontend (Web + Electron)

This frontend provides **real-time visualization, control, and system-wide PiP monitoring** for CognitiveSense AI.

The **same React codebase** runs as:
- 🌐 Web dashboard
- 🖥 Electron desktop app
- 📌 System-wide PiP overlay (always-on-top)

---

## 🧠 Key Features

- Real-time AI state monitoring
- Live confidence & inference visualization
- WebSocket-driven updates
- Advanced Picture-in-Picture (PiP)
- Electron-based system overlay
- Zustand-based global state management

---

## 🏗 Architecture Overview



FastAPI Backend (WS)
↓
WebSocket Service (singleton)
↓
Zustand Store
↓
React UI
├── Dashboard
├── Logs
├── Chat
└── Picture-in-Picture


Electron simply **hosts the same React app** in two windows.

---

## 📂 Folder Structure



frontend/
├── src/
│ ├── components/
│ │ ├── PictureInPicture.tsx # Core PiP UI
│ │ ├── AppSidebar.tsx
│ │ └── ...
│ ├── services/
│ │ └── websocket.ts # WS singleton (critical)
│ ├── store/
│ │ └── useAppStore.ts # Zustand global store
│ ├── pages/
│ │ ├── Dashboard.tsx
│ │ ├── Logs.tsx
│ │ ├── Chat.tsx
│ │ └── Settings.tsx
│ └── App.tsx
│
├── electron/
│ ├── main.ts # Electron main process
│ └── preload.ts
│
├── dist-electron/
│ └── main.cjs # Compiled Electron entry
│
├── vite.config.ts
├── package.json
└── README.md


---

## 🔌 WebSocket Design (IMPORTANT)

- **Single WebSocket service**
- Initialized **once in App bootstrap**
- Shared by:
  - Normal dashboard window
  - Electron PiP window

### WebSocket URL



ws://127.0.0.1:8000/ws/live


### Key Rule (learned during debugging)

> ❌ Never initialize WebSocket inside UI components  
> ✅ Initialize once in `AppContent`

This prevents random disconnects in Electron.

---

## 📌 Picture-in-Picture (PiP) Design

- Uses the **same `<PictureInPicture />` component**
- Electron loads PiP via:


http://localhost:8082/?pip=true


### PiP Capabilities
- Always-on-top (Electron)
- Draggable
- Lockable
- Minimize / Expand
- Live confidence graph
- Live inference & activity

No duplicate UI, no Electron-specific UI code.

---

## 🖥 Electron Integration

### Windows Created
1. **Main Window**
   - Full dashboard
2. **PiP Window**
   - System-wide overlay
   - Always visible over other apps

Electron **does not control UI** — only windows.

---

## ▶ Running Frontend (Web)

```bash
cd frontend
npm install
npm run dev

▶ Running Frontend (Electron + PiP)
npm run electron:dev


This launches:

React dev server

Electron app

PiP overlay

🧪 Tech Stack

React + TypeScript

Vite

Zustand

WebSockets

Recharts

Framer Motion

Electron

🔐 Key Lessons from This Project

Electron renderers are isolated

WebSocket must be singleton

UI must stay platform-agnostic

Electron should only manage windows

PiP stability requires strict WS discipline

🚀 Future Improvements

Tray icon

Click-through PiP

Windows installer (.exe)

Auto-start on boot

Cloud backend support

📘 README.md (Root – Full Project)
# CognitiveSense AI

CognitiveSense AI is a **real-time cognitive state monitoring system** that analyzes **user behavior signals** (keyboard, mouse, eye-tracking) and performs **live machine learning inference** to estimate cognitive states such as **Normal, Stressed, and Fatigued**.

The system is designed as a **full-stack, real-time AI application** with:
- A **FastAPI backend** for data aggregation and ML inference
- A **React frontend** for visualization and control
- An **Electron desktop app** with a **system-wide Picture-in-Picture (PiP) overlay**

---

## 🧠 What Problem This Solves

Modern users spend long hours interacting with computers, but systems lack awareness of:
- Cognitive overload
- Fatigue
- Attention drift

CognitiveSense AI continuously observes **behavioral signals** and provides:
- Real-time cognitive state estimation
- Live confidence metrics
- Always-visible PiP monitoring across applications

---

## 🏗 High-Level Architecture



User Interaction Signals
(Keyboard / Mouse / Eye Tracking)
↓
Backend (FastAPI)
├── Data Aggregation
├── Feature Engineering
├── ML Inference
└── WebSocket Streaming
↓
Frontend (React)
├── Dashboard
├── Logs / Chat
└── Picture-in-Picture
↓
Electron Desktop App
├── Main Window
└── System-wide PiP Overlay


---

## 📂 Monorepo Structure



CognitiveSense AI/
├── backend/
│ ├── src/
│ │ └── realtime/
│ │ ├── realtime_server.py
│ │ ├── infer.py
│ │ ├── aggregator.py
│ │ ├── keyboard_listener.py
│ │ ├── mouse_listener.py
│ │ ├── eye_tracker.py
│ │ └── live_data_collector.py
│ ├── models/
│ │ └── rf_baseline.joblib
│ ├── requirements.txt
│ └── README.md
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ └── PictureInPicture.tsx
│ │ ├── services/
│ │ │ └── websocket.ts
│ │ ├── store/
│ │ │ └── useAppStore.ts
│ │ ├── pages/
│ │ │ ├── Dashboard.tsx
│ │ │ ├── Logs.tsx
│ │ │ ├── Chat.tsx
│ │ │ └── Settings.tsx
│ │ └── App.tsx
│ ├── electron/
│ │ ├── main.ts
│ │ └── preload.ts
│ ├── dist-electron/
│ │ └── main.cjs
│ ├── package.json
│ └── README.md
│
└── README.md # (this file)


---

## 🤖 Machine Learning Overview

### Model
- **Random Forest Classifier**
- Stored as `backend/models/rf_baseline.joblib`

### Cognitive States

| ID | Label     | Description |
|----|----------|-------------|
| 0  | Normal   | Focused, stable behavior |
| 1  | Stressed | Cognitive overload |
| 2  | Fatigued | Reduced attention / fatigue |

### Features (High-Level)
- Keyboard activity frequency
- Mouse movement dynamics
- Eye gaze / blink patterns
- Temporal aggregation windows

---

## 🌐 Communication Layer

### WebSocket (Core Pipeline)



ws://127.0.0.1:8000/ws/live


- Streams inference every ~3 seconds
- Supports **multiple concurrent clients**
- Used simultaneously by:
  - Web dashboard
  - Electron main window
  - Electron PiP overlay

### Design Rule (Critical)

> WebSocket is initialized **once per renderer**  
> UI components never create WebSocket connections

This avoids instability in Electron.

---

## 📌 Picture-in-Picture (PiP) System

### Key Properties
- Same React PiP component used everywhere
- No Electron-specific UI code
- Electron only controls window behavior

### Electron PiP
- Always-on-top
- Visible over all applications
- Draggable, lockable, minimizable
- Shows live confidence and inference

Electron loads PiP via:


http://localhost:8082/?pip=true


---

## ▶ Running the Project

### 1️⃣ Backend

```bash
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn src.realtime.realtime_server:app --reload --port 8000

2️⃣ Frontend (Web)
cd frontend
npm install
npm run dev

3️⃣ Frontend (Electron + System-wide PiP)
cd frontend
npm run electron:dev


This launches:

React dev server

Electron desktop app

System-wide PiP overlay

🧪 Tech Stack
Backend

Python

FastAPI

WebSockets

OpenCV

MediaPipe

Scikit-learn

Frontend

React + TypeScript

Vite

Zustand

Recharts

Framer Motion

Desktop

Electron

🔐 Key Engineering Learnings

Electron renderers are isolated processes

WebSocket must be singleton per renderer

UI logic must remain platform-agnostic

Electron should only manage windows

Real-time systems require strict connection discipline

🚀 Future Scope

Deep learning models (LSTM / Transformers)

User-specific cognitive baselines

GPU inference

Windows installer (.exe)

Auto-start & tray integration

Cloud / distributed backend

📄 License & Usage

This project is intended for:

Academic research

Prototyping

Learning real-time AI systems

Project Status:
✅ Backend stable
✅ Frontend stable
✅ Electron PiP stable
✅ Real-time inference working