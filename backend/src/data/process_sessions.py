# src/data/process_sessions.py

import os
import json
import glob
import argparse
import pickle
import numpy as np
import pandas as pd
from tqdm import tqdm

from feature_extractor import sliding_windows_from_session
from utils import ensure_dir


def load_session(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def assign_label(session):
    """
    TEMP labeling logic:
    - Since we don't have manual labels yet,
      we assign label = 0 (neutral) for now.
    Later, this will be replaced with real stress/distraction labels.
    """
    return 0


def main(args):
    ensure_dir(os.path.dirname(args.out_csv))
    ensure_dir(os.path.dirname(args.out_ts))

    session_files = glob.glob(os.path.join(args.input_dir, "*.json"))
    if not session_files:
        print("❌ No session files found")
        return

    all_rows = []

    print("🔄 Processing sessions...")
    for sf in tqdm(session_files):
        session = load_session(sf)
        session_id = os.path.basename(sf)

        windows = sliding_windows_from_session(
            session,
            window_size=args.window_size,
            step=args.window_step
        )

        label = assign_label(session)

        for w in windows:
            row = dict(w)
            row["session_id"] = session_id
            row["label"] = label
            all_rows.append(row)

    df = pd.DataFrame(all_rows)
    df.to_csv(args.out_csv, index=False)
    print(f"✅ Saved feature CSV → {args.out_csv}")

    # -------- TIME SERIES DATASET --------
    print("🔄 Building time-series dataset...")
    feature_cols = [
        c for c in df.columns
        if c not in ["session_id", "label", "window_start", "window_end", "window_center"]
    ]

    sequences = []
    grouped = df.sort_values("window_center").groupby("session_id")

    for _, g in grouped:
        X = g[feature_cols].fillna(0).values
        y = g["label"].values

        for i in range(0, len(X) - args.seq_len + 1, args.seq_step):
            seq_x = X[i:i + args.seq_len]
            seq_y = int(np.bincount(y[i:i + args.seq_len]).argmax())
            sequences.append({"X": seq_x, "y": seq_y})

    np.random.shuffle(sequences)

    n = len(sequences)
    train = sequences[: int(0.7 * n)]
    val = sequences[int(0.7 * n): int(0.85 * n)]
    test = sequences[int(0.85 * n):]

    meta = {
        "columns": feature_cols,
        "input_dim": len(feature_cols),
        "num_classes": len(set(df["label"]))
    }

    with open(args.out_ts, "wb") as f:
        pickle.dump({"train": train, "val": val, "test": test}, f)

    with open(args.out_ts + ".meta.pkl", "wb") as f:
        pickle.dump(meta, f)

    print("✅ Time-series dataset saved")
    print("📊 Samples →", len(train), "train |", len(val), "val |", len(test), "test")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", required=True)
    parser.add_argument("--out-csv", required=True)
    parser.add_argument("--out-ts", required=True)
    parser.add_argument("--window-size", type=float, default=10)
    parser.add_argument("--window-step", type=float, default=5)
    parser.add_argument("--seq-len", type=int, default=5)
    parser.add_argument("--seq-step", type=int, default=2)
    args = parser.parse_args()
    main(args)
