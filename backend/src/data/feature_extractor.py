# src/data/feature_extractor.py
"""
Feature extraction utilities for:
- keystroke dynamics (dwell, flight)
- mouse dynamics (speed, acceleration, path curvature)
- screen activity (active window durations)
- face micro-expression proxies (mouth/eye/eyebrow motion)

This module provides functions to convert raw event streams into per-window feature vectors.

Assumes raw session files are JSON lists of timestamped events.
"""

import numpy as np
import pandas as pd
from collections import deque
from scipy.stats import skew, kurtosis
import math
from typing import List, Dict

# helpers
def safe_stats(arr):
    if len(arr) == 0:
        return [0.0]*6
    a = np.array(arr, dtype=float)
    return [a.mean(), a.std(ddof=0).item(), np.percentile(a,25), np.percentile(a,50), np.percentile(a,75), a.max().item()]

# --- Keystroke features ---
def extract_keystroke_features(events: List[Dict], window_start=None, window_end=None):
    """
    events: list of {'type': 'key_down'/'key_up', 'key': 'a', 'ts': float}
    returns feature dict for the window
    """
    # build per-key down times
    down_times = {}
    dwell_times = []
    flight_times = []

    # keep previous up timestamp for flight calculation
    prev_up = None
    for ev in events:
        if window_start and ev['ts'] < window_start: continue
        if window_end and ev['ts'] > window_end: break
        if ev['type'] == 'key_down':
            down_times[(ev['key'], ev.get('id'))] = ev['ts']
        elif ev['type'] == 'key_up':
            # find matching down
            # approximate by key label; this is robust for single-user streams
            # prefer exact match by 'id' if present
            k = (ev['key'], ev.get('id'))
            tdown = down_times.pop(k, None)
            if tdown is None:
                # fallback: match by key label only
                # find any down for same key
                for k2 in list(down_times.keys()):
                    if k2[0] == ev['key']:
                        tdown = down_times.pop(k2)
                        break
            if tdown is not None:
                dwell = ev['ts'] - tdown
                if dwell >= 0:
                    dwell_times.append(dwell)
                if prev_up is not None:
                    flight = tdown - prev_up
                    if flight >= 0:
                        flight_times.append(flight)
                prev_up = ev['ts']

    features = {}
    # counts
    features['key_count'] = len(dwell_times)
    features['unique_keys'] = len({e['key'] for e in events})
    # basic stats for dwell and flight
    d_stats = safe_stats(dwell_times)
    f_stats = safe_stats(flight_times)
    names = ['mean','std','q25','median','q75','max']
    for i,nm in enumerate(names):
        features[f'dwell_{nm}'] = d_stats[i]
        features[f'flight_{nm}'] = f_stats[i]
    # rhythm metrics: key_rate (per sec)
    if window_start is not None and window_end is not None:
        dur = max(1e-6, window_end - window_start)
        features['key_rate'] = features['key_count'] / dur
    else:
        features['key_rate'] = features['key_count'] / max(1, (events[-1]['ts']-events[0]['ts']) if events else 1)
    return features

# --- Mouse features ---
def extract_mouse_features(events: List[Dict], window_start=None, window_end=None):
    """
    mouse events: {'type':'mouse_move'/'mouse_click', 'x':..., 'y':..., 'ts':...}
    returns features: speed stats, acceleration stats, click counts
    """
    xs, ys, ts = [], [], []
    clicks = 0
    prev_v = None
    speeds = []
    accs = []
    for ev in events:
        if window_start and ev['ts'] < window_start: continue
        if window_end and ev['ts'] > window_end: break
        if ev['type'] == 'mouse_move':
            xs.append(ev['x']); ys.append(ev['y']); ts.append(ev['ts'])
        elif ev['type'] == 'mouse_click':
            clicks += 1

    for i in range(1, len(ts)):
        dt = ts[i] - ts[i-1]
        if dt <= 0: continue
        dx = xs[i] - xs[i-1]; dy = ys[i] - ys[i-1]
        dist = math.hypot(dx, dy)
        v = dist / dt
        speeds.append(v)
        if prev_v is not None:
            a = (v - prev_v) / dt
            accs.append(a)
        prev_v = v

    features = {}
    features['mouse_move_count'] = len(speeds)
    features['mouse_click_count'] = clicks
    s_stats = safe_stats(speeds)
    a_stats = safe_stats(accs)
    names = ['mean','std','q25','median','q75','max']
    for i,nm in enumerate(names):
        features[f'mspeed_{nm}'] = s_stats[i]
        features[f'macc_{nm}'] = a_stats[i]
    return features

# --- Screen / active window features ---
def extract_screen_features(events: List[Dict], window_start=None, window_end=None):
    """
    screen events: {'type':'active_window', 'title':str, 'ts':...}
    derive counts, entropy of window titles, average switch time
    """
    window_changes = []
    for ev in events:
        if ev['type'] != 'active_window': continue
        if window_start and ev['ts'] < window_start: continue
        if window_end and ev['ts'] > window_end: break
        window_changes.append((ev['title'], ev['ts']))

    titles = [t for t, _ in window_changes]
    counts = {}
    for t in titles:
        counts[t] = counts.get(t, 0) + 1

    total = sum(counts.values()) or 1
    probs = [v/total for v in counts.values()]
    # entropy
    entropy = -sum(p*math.log(p+1e-12) for p in probs)

    # average dwell per window (approx)
    dwell_times = []
    for i in range(1, len(window_changes)):
        dt = window_changes[i][1] - window_changes[i-1][1]
        if dt > 0:
            dwell_times.append(dt)
    stats = safe_stats(dwell_times)
    features = {
        'window_switches': len(window_changes),
        'window_entropy': entropy,
        'window_dwell_mean': stats[0],
        'window_dwell_std': stats[1],
    }
    return features

# --- Face features (proxies for micro-expressions) ---
def extract_face_features(face_frames: List[Dict], window_start=None, window_end=None):
    """
    face_frames: list of {'ts': float, 'landmarks': {<name>: (x,y,z)}, 'eye_aspect': float, 'mouth_open': float, 'eyebrow_diff': float}}
    We expect preprocessing (MediaPipe) to provide landmarks and some helper measures.
    We compute stats over these proxies.
    """
    eye_aspects = []
    mouth_opens = []
    eyebrow_diffs = []
    for f in face_frames:
        if window_start and f['ts'] < window_start: continue
        if window_end and f['ts'] > window_end: break
        eye_aspects.append(f.get('eye_aspect', 0.0))
        mouth_opens.append(f.get('mouth_open', 0.0))
        eyebrow_diffs.append(f.get('eyebrow_diff', 0.0))

    features = {}
    for arr, prefix in [(eye_aspects,'eye'), (mouth_opens,'mouth'), (eyebrow_diffs,'brow')]:
        stats = safe_stats(arr)
        names = ['mean','std','q25','median','q75','max']
        for i,nm in enumerate(names):
            features[f'{prefix}_{nm}'] = stats[i]
    features['face_frame_rate'] = len(face_frames) / max(1.0, (face_frames[-1]['ts'] - face_frames[0]['ts'])) if len(face_frames) > 1 else 0.0
    return features

# --- Compose all modality features into one vector per window ---
def extract_window_features(streams: Dict[str, List[Dict]], window_start: float, window_end: float):
    """
    streams: {
      'keystrokes': [...],
      'mouse': [...],
      'screen': [...],
      'face': [...]
    }
    returns flattened feature dict
    """
    feats = {}
    kf = extract_keystroke_features(streams.get('keystrokes', []), window_start, window_end)
    mf = extract_mouse_features(streams.get('mouse', []), window_start, window_end)
    sf = extract_screen_features(streams.get('screen', []), window_start, window_end)
    ff = extract_face_features(streams.get('face', []), window_start, window_end)

    feats.update(kf); feats.update(mf); feats.update(sf); feats.update(ff)
    # add window boundaries
    feats['window_start'] = window_start
    feats['window_end'] = window_end
    return feats

# --- Rolling window aggregator for a session stream ---
def sliding_windows_from_session(session_streams: Dict[str, List[Dict]], window_size=10.0, step=5.0):
    """
    session_streams: each modality is a list of events sorted by ts.
    windows: yield feature dicts for each sliding time window.
    """
    # find session start/end from any available stream
    all_ts = []
    for mod, evs in session_streams.items():
        if evs:
            all_ts.append(evs[0]['ts'])
            all_ts.append(evs[-1]['ts'])
    if not all_ts:
        return []
    start = min(all_ts)
    end = max(all_ts)
    features = []
    t = start
    while t + window_size <= end + 1e-6:
        wstart = t
        wend = t + window_size
        feats = extract_window_features(session_streams, wstart, wend)
        feats['window_center'] = (wstart + wend) / 2.0
        features.append(feats)
        t += step
    return features
