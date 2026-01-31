import time

from src.realtime.keyboard_listener import KeyboardCollector
from src.realtime.mouse_listener import MouseCollector
from src.realtime.eye_tracker import EyeTracker


def _clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


class RealTimeAggregator:
    def __init__(self):
        self.keyboard = KeyboardCollector()
        self.mouse = MouseCollector()
        self.eye = EyeTracker()   # 👁️ EAR + Blink rate

    def start(self):
        self.keyboard.start()
        self.mouse.start()

    def collect_features(self, label=None):
        """
        Collect features over a 3-second sliding window.
        Optionally attach label (for dataset collection).
        """
        time.sleep(3)

        features = {}

        # ---------------- Keyboard features ----------------
        kb_feats = self.keyboard.flush()
        features.update(kb_feats)

        # ---------------- Mouse features ----------------
        mouse_feats = self.mouse.flush()
        features.update(mouse_feats)

        # ---------------- Eye features ----------------
        # eye_feats = {
        #   "eye_aspect_mean": float,
        #   "eye_blink_rate": int
        # }
        eye_feats = self.eye.flush()
        features.update(eye_feats)

        # ---------------- Fatigue Score (🔥 NEW) ----------------
        ear = eye_feats.get("eye_aspect_mean", 0.0)
        blinks = eye_feats.get("eye_blink_rate", 0)

        ear_component = _clamp((0.28 - ear) / 0.10)
        blink_component = _clamp(blinks / 8.0)

        fatigue_score = int(100 * (0.6 * ear_component + 0.4 * blink_component))
        features["fatigue_score"] = fatigue_score

        # ---------------- Optional label ----------------
        if label is not None:
            features["label"] = int(label)

        return features
