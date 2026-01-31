# src/models/model_def.py
"""
Model definitions:
- sklearn RandomForest wrapper for baseline
- PyTorch LSTM for time-series fusion

This file defines PyTorch model class and helper utilities.
"""
import torch
import torch.nn as nn

class SimpleLSTM(nn.Module):
    def __init__(self, input_dim, hidden_dim=64, num_layers=2, output_dim=3, dropout=0.2):
        """
        input_dim: number of features per time-step
        output_dim: number of classes (e.g. stress/distraction/thought-shift -> multi-label or multi-class)
        This model produces class logits for the last time-step (classification).
        """
        super().__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers=num_layers, batch_first=True, dropout=dropout)
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim//2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim//2, output_dim)
        )

    def forward(self, x):
        # x: (batch, seq_len, input_dim)
        out, (h, c) = self.lstm(x)
        # take last timestep
        last = out[:, -1, :]
        logits = self.fc(last)
        return logits
