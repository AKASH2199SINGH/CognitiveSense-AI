# src/eval/evaluate.py
"""
Evaluation utilities for saved baseline (joblib) and LSTM models.
This script demonstrates loading a saved joblib model and running predictions.
"""
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, f1_score
import torch
from models.model_def import SimpleLSTM

def eval_baseline(joblib_path, csv_path):
    store = joblib.load(joblib_path)
    model = store['model']
    columns = store['columns']
    df = pd.read_csv(csv_path).fillna(0.0)
    X = df[columns].values
    y = df['label'].values
    preds = model.predict(X)
    print(classification_report(y, preds))
    print("Confusion matrix:\n", confusion_matrix(y, preds))

def eval_lstm(model_path, pkldata):
    # expects pkldata with 'test' list of {'X':..., 'y':...}
    import pickle
    data = pickle.load(open(pkldata, "rb"))
    test_items = data['test']
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    input_dim = test_items[0]['X'].shape[1]
    num_classes = int(max(d['y'] for d in test_items) + 1)
    model = SimpleLSTM(input_dim=input_dim, hidden_dim=128, num_layers=2, output_dim=num_classes)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()
    preds = []
    trues = []
    with torch.no_grad():
        for it in test_items:
            X = torch.tensor(it['X'][None,:,:], dtype=torch.float32).to(device)
            logits = model(X)
            p = logits.argmax(dim=1).cpu().numpy()[0]
            preds.append(p)
            trues.append(it['y'])
    from sklearn.metrics import classification_report
    print(classification_report(trues, preds))
