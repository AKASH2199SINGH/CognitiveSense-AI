# ================= BASE IMAGE =================
FROM python:3.10-slim

# ================= SYSTEM DEPENDENCIES =================
# Needed for:
# - torch (CPU)
# - scipy / numpy
# - opencv-python-headless
# - pynput (even if conditionally disabled)
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# ================= WORKDIR =================
# backend is the logical project root (same as local)
WORKDIR /app

# ================= PYTHON SETTINGS =================
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ================= DEPENDENCIES =================
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ================= COPY APP =================
COPY . .

# ================= RENDER ENV FLAG =================
# Used to disable desktop-only modules like pynput
ENV RENDER=true

# ================= START SERVER =================
CMD ["sh", "-c", "python -m uvicorn src.realtime.realtime_server:app --host 0.0.0.0 --port $PORT"]
