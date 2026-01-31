

# src/data/utils.py
import os
import json
import pandas as pd
from datetime import datetime

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def save_json(obj, path):
    ensure_dir(os.path.dirname(path) or ".")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, default=str)

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def timestamp_now():
    return datetime.utcnow().isoformat() + "Z"

def df_save_csv(df: pd.DataFrame, path: str):
    ensure_dir(os.path.dirname(path) or ".")
    df.to_csv(path, index=False)
