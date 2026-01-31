import os
import time
import pickle
import joblib
import numpy as np
import torch
import pandas as pd
import warnings
warnings.filterwarnings("ignore", category=UserWarning)


from src.models.model_def import SimpleLSTM
from src.realtime.aggregator import RealTimeAggregator


class ModelServer:
    def __init__(self, model_path, metadata_path=None, device=None):
        self.model_path = model_path
        self.metadata = {}

        if metadata_path and os.path.exists(metadata_path):
            self.metadata = pickle.load(open(metadata_path, "rb"))

        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        # --------------------------------------------------
        # Load model (sklearn or LSTM)
        # --------------------------------------------------
        if model_path.endswith(".joblib"):
            store = joblib.load(model_path)
            self.model_type = "sklearn"

            self.clf = store["model"]
            self.scaler = store.get("scaler", None)
            self.columns = store.get("columns", None)

            if self.columns is None:
                raise ValueError("Saved model must include feature 'columns'")

        elif model_path.endswith(".pth"):
            self.model_type = "lstm"

            input_dim = self.metadata.get("input_dim")
            num_classes = self.metadata.get("num_classes", 3)

            if input_dim is None:
                raise ValueError("metadata must contain 'input_dim' for LSTM")

            self.model = SimpleLSTM(
                input_dim=input_dim,
                hidden_dim=128,
                num_layers=2,
                output_dim=num_classes,
            )

            self.model.load_state_dict(
                torch.load(model_path, map_location=self.device)
            )
            self.model.to(self.device)
            self.model.eval()

        else:
            raise ValueError("Unknown model type")

        # --------------------------------------------------
        # Real-time feature aggregator
        # --------------------------------------------------
        self.realtime_aggregator = RealTimeAggregator()
        self.realtime_aggregator.start()

    # ======================================================
    # PREDICT FROM FEATURE DICT (FIXED + CLEAN)
    # ======================================================
    def predict_from_feature_dict(self, feat_dict):
        if self.model_type == "sklearn":
            # Build feature vector WITH COLUMN NAMES
            x = pd.DataFrame(
                [[feat_dict.get(c, 0.0) for c in self.columns]],
                columns=self.columns
            )

            # Apply scaler (if present)
            if self.scaler is not None:
                x = self.scaler.transform(x)

            pred = int(self.clf.predict(x)[0])

            proba = (
                self.clf.predict_proba(x)[0].tolist()
                if hasattr(self.clf, "predict_proba")
                else None
            )

            return {"pred": pred, "proba": proba}

        # ---------------- LSTM PATH ----------------
        else:
            input_cols = self.metadata.get("columns")
            if input_cols is None:
                raise ValueError("metadata must include 'columns' for LSTM")

            x = np.array(
                [[feat_dict.get(c, 0.0) for c in input_cols]],
                dtype=float
            )

            x_t = torch.tensor(x, dtype=torch.float32).to(self.device)

            with torch.no_grad():
                logits = self.model(x_t)
                pred = int(torch.argmax(logits, dim=1).cpu().numpy()[0])
                probs = torch.softmax(logits, dim=1).cpu().numpy()[0].tolist()

            return {"pred": pred, "proba": probs}

    # ======================================================
    # REAL-TIME LIVE PREDICTION
    # ======================================================
    def predict_live(self, window_sec=3):
        """
        Collect real-time keyboard/mouse/eye features
        and run prediction
        """
        time.sleep(window_sec)

        feat_dict = self.realtime_aggregator.collect_features()
        result = self.predict_from_feature_dict(feat_dict)

        return {
            "features": feat_dict,
            "pred": result["pred"],
            "proba": result.get("proba"),
        }
