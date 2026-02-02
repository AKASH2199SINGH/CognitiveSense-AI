FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# IMPORTANT: backend ke andar kaam karo
WORKDIR /app/backend

# Python ko bata do yahin se imports resolve karne hain
ENV PYTHONPATH=/app/backend

COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY backend .

# EXACT same as your local command (Render-safe)
CMD ["sh", "-c", "python -m uvicorn src.realtime.realtime_server:app --host 0.0.0.0 --port $PORT"]
