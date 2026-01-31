import argparse
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, f1_score
from sklearn.preprocessing import StandardScaler
import os


def main(args):
    print("🔄 Loading dataset...")
    df = pd.read_csv(args.data_path)

    if "label" not in df.columns:
        raise ValueError("Dataset must contain a 'label' column")

    # -----------------------------
    # Feature / label split
    # -----------------------------
    drop_cols = [
        "label",
        "session_id",
        "window_start",
        "window_end",
        "window_center"
    ]

    feature_cols = [c for c in df.columns if c not in drop_cols]

    X = df[feature_cols].fillna(0)
    y = df["label"].values

    print("📊 Samples:", len(X), "| Features:", X.shape[1])
    print("🧠 Feature columns:", feature_cols)

    # -----------------------------
    # Train / Test split
    # -----------------------------
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    # -----------------------------
    # 🔥 SCALING (CRITICAL FIX)
    # -----------------------------
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # -----------------------------
    # Model
    # -----------------------------
    print("🤖 Training RandomForest...")
    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train_scaled, y_train)

    # -----------------------------
    # Evaluation
    # -----------------------------
    print("🔍 Evaluating...")
    preds = model.predict(X_test_scaled)

    print("Accuracy:", accuracy_score(y_test, preds))
    print("F1 (macro):", f1_score(y_test, preds, average="macro"))
    print(classification_report(y_test, preds))

    # -----------------------------
    # Save EVERYTHING needed for inference
    # -----------------------------
    os.makedirs(os.path.dirname(args.out), exist_ok=True)

    joblib.dump(
        {
            "model": model,
            "scaler": scaler,          # ✅ VERY IMPORTANT
            "columns": feature_cols    # ✅ feature order
        },
        args.out
    )

    print("✅ Baseline model + scaler saved to:", args.out)

    # -----------------------------
    # Feature Importance
    # -----------------------------
    print("\n🔥 Top Feature Importances:")
    importances = model.feature_importances_

    feat_imp = sorted(
        zip(feature_cols, importances),
        key=lambda x: x[1],
        reverse=True
    )

    for name, score in feat_imp[:15]:
        print(f"{name:30s} : {score:.4f}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-path", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    main(args)
