# src/models/train_timeseries.py
"""
Train LSTM on serialized time-series windows.

Expect input: a pickle containing a list of sequences where each item is dict {'X': np.array(seq_len, feat_dim), 'y': int}

Usage:
python src/models/train_timeseries.py --data-path dataset/ts_data.pkl --out models/lstm.pth
"""
import argparse
import pickle
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
import torch.nn as nn
import torch.optim as optim
from tqdm import tqdm
from model_def import SimpleLSTM
import os

class TimeSeriesDataset(Dataset):
    def __init__(self, items):
        # items: list of {'X': np.array(seq_len, feat_dim), 'y': int}
        self.items = items

    def __len__(self):
        return len(self.items)

    def __getitem__(self, idx):
        it = self.items[idx]
        X = torch.tensor(it['X'], dtype=torch.float32)
        y = torch.tensor(it['y'], dtype=torch.long)
        return X, y

def train_loop(model, loader, opt, crit, device):
    model.train()
    tot_loss = 0.0
    for X,y in loader:
        X = X.to(device); y = y.to(device)
        opt.zero_grad()
        logits = model(X)
        loss = crit(logits, y)
        loss.backward()
        opt.step()
        tot_loss += loss.item() * X.size(0)
    return tot_loss / len(loader.dataset)

def eval_loop(model, loader, device):
    model.eval()
    preds = []
    trues = []
    with torch.no_grad():
        for X,y in loader:
            X = X.to(device)
            logits = model(X)
            pred = logits.argmax(dim=1).cpu().numpy()
            preds.append(pred)
            trues.append(y.numpy())
    if preds:
        preds = np.concatenate(preds)
        trues = np.concatenate(trues)
        acc = (preds == trues).mean()
    else:
        acc = 0.0
    return acc

def main(args):
    data = pickle.load(open(args.data_path, "rb"))
    # data expected to be dict with keys 'train' and 'val' lists
    train_items = data['train']
    val_items = data.get('val', [])
    # infer feature dim
    input_dim = train_items[0]['X'].shape[1]
    num_classes = int(max(d['y'] for d in train_items + val_items) + 1)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = SimpleLSTM(input_dim=input_dim, hidden_dim=128, num_layers=2, output_dim=num_classes).to(device)
    train_ds = TimeSeriesDataset(train_items)
    val_ds = TimeSeriesDataset(val_items) if val_items else None
    train_loader = DataLoader(train_ds, batch_size=32, shuffle=True, drop_last=False)
    val_loader = DataLoader(val_ds, batch_size=64) if val_ds else None

    opt = optim.Adam(model.parameters(), lr=1e-3)
    crit = nn.CrossEntropyLoss()

    best_val = -1.0
    for epoch in range(args.epochs):
        loss = train_loop(model, train_loader, opt, crit, device)
        val_acc = eval_loop(model, val_loader, device) if val_loader else 0.0
        print(f"Epoch {epoch} loss={loss:.4f} val_acc={val_acc:.4f}")
        if val_acc > best_val:
            best_val = val_acc
            os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
            torch.save(model.state_dict(), args.out)
            print("Saved best model to", args.out)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-path", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--epochs", type=int, default=20)
    args = parser.parse_args()
    main(args)
