# ---------- BASE IMAGE ----------
FROM python:3.10-slim

# ---------- SYSTEM DEPENDENCIES ----------
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# ---------- WORKDIR ----------
WORKDIR /app

# ---------- COPY REQUIREMENTS ----------
COPY backend/requirements.txt .

# ---------- INSTALL PYTHON DEPENDENCIES ----------
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ---------- COPY BACKEND CODE ----------
COPY backend /app/backend

# ---------- EXPOSE PORT ----------
EXPOSE 8000

# ---------- START COMMAND ----------
CMD ["python", "-m", "uvicorn", "src.realtime.realtime_server:app", "--host", "0.0.0.0", "--port", "8000"]
