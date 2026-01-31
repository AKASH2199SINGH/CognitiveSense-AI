"""Realtime Server for CognitiveSense AI
FastAPI realtime server exposing:
- /predict           -> POST single feature-dict (manual / testing)
- /predict_live      -> POST auto real-time prediction (keyboard/mouse)
- /ws/live           -> WebSocket streaming real-time predictions

Run:
uvicorn src.realtime.realtime_server:app --reload --port 8000
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from src.realtime.infer import ModelServer

import asyncio
import os
import time
from collections import deque
from typing import List

# -------------------------------------------------
# App & CORS
# -------------------------------------------------
app = FastAPI(title="CognitiveSense AI – Realtime Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Load model
# -------------------------------------------------
DEFAULT_MODEL_PATH = os.environ.get(
    "COGNITIVESENSE_MODEL",
    "models/rf_baseline.joblib"
)
DEFAULT_METADATA = os.environ.get(
    "COGNITIVESENSE_METADATA",
    None
)

if not os.path.exists(DEFAULT_MODEL_PATH):
    raise RuntimeError("Model file not found")

model_server = ModelServer(
    model_path=DEFAULT_MODEL_PATH,
    metadata_path=DEFAULT_METADATA
)

# -------------------------------------------------
# Label mapping (HUMAN READABLE)
# -------------------------------------------------
LABEL_MAP = {
    0: "Normal",
    1: "Stressed",
    2: "Fatigued"
}

# -------------------------------------------------
# State history (for graphs)
# -------------------------------------------------
STATE_HISTORY = deque(maxlen=60)  # ~ last 3 min (3s window)

# -------------------------------------------------
# WebSocket Connection Manager
# -------------------------------------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for conn in list(self.active_connections):
            try:
                await conn.send_json(message)
            except Exception:
                self.disconnect(conn)

manager = ConnectionManager()

# =================================================
# HTTP ENDPOINTS
# =================================================

@app.post("/predict")
async def predict(feat: dict):
    """
    Manual prediction (testing / legacy)
    """
    try:
        res = model_server.predict_from_feature_dict(feat)
        return JSONResponse(content=res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/predict_live")
async def predict_live():
    """
    Fully automated real-time prediction
    """
    try:
        out = model_server.predict_live()

        pred = out["pred"]
        proba = out.get("proba")

        record = {
            "time": time.time(),
            "label": pred
        }
        STATE_HISTORY.append(record)

        return {
            "label_id": pred,
            "label_name": LABEL_MAP.get(pred, "Unknown"),
            "confidence": max(proba) if proba else None,
            "features": out["features"],
            "proba": proba,
            "history": list(STATE_HISTORY)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =================================================
# WEBSOCKET – TRUE REAL-TIME STREAMING
# =================================================

@app.websocket("/ws/live")
async def websocket_live(websocket: WebSocket):
    """
    Client receives continuous real-time predictions
    """
    await manager.connect(websocket)

    try:
        while True:
            out = model_server.predict_live()

            pred = out["pred"]
            proba = out.get("proba")

            STATE_HISTORY.append({
                "time": time.time(),
                "label": pred
            })

            payload = {
                "engine_state": "RUNNING",   # ✅ NEW (IMPORTANT)
                "label_id": pred,
                "label_name": LABEL_MAP.get(pred, "Unknown"),
                "confidence": max(proba) if proba else None,
                "features": out["features"],
                "proba": proba,
                "history": list(STATE_HISTORY)
            }

            await manager.broadcast(payload)

            await asyncio.sleep(3)  # sliding window

    except WebSocketDisconnect:
        manager.disconnect(websocket)
