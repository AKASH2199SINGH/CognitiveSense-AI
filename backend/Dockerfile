FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# 🔥 IMPORTANT: src ko WORKDIR banao
WORKDIR /app/backend/src

COPY backend/requirements.txt /app/backend/
RUN pip install --upgrade pip && pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy full backend
COPY backend /app/backend

# 🔥 src ke andar se run karo
CMD ["sh", "-c", "python -m uvicorn realtime.realtime_server:app --host 0.0.0.0 --port $PORT"]
