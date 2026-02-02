FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Same as local: backend is project root
WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy everything inside backend/
COPY . .

# EXACT same import path you use locally
CMD ["sh", "-c", "python -m uvicorn src.realtime.realtime_server:app --host 0.0.0.0 --port $PORT"]
