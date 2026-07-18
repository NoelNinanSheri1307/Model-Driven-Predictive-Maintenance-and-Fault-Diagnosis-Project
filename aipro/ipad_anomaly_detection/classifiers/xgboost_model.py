import xgboost as xgb
import numpy as np
import os

class XGBoostClassifier:
    """
    XGBoost Binary Classifier for final anomaly prediction.
    Trains on feature vectors from the BiLSTM+Attention pipeline.
    """
    def __init__(self, model_path=None):
        self.model = xgb.XGBClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            objective='binary:logistic',
            use_label_encoder=False,
            eval_metric='logloss',
            random_state=42
        )
        self.model_path = model_path

    def train(self, X, y):
        """X: (N, 512), y: (N,)"""
        print(f"Training XGBoost on {len(X)} samples...")
        self.model.fit(X, y)
        if self.model_path:
             # Ensure directory exists
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            self.model.save_model(self.model_path)

    def predict(self, X):
        """X: (N, 512)"""
        return self.model.predict(X)

    def predict_proba(self, X):
        """X: (N, 512) -> Returns probabilities for anomaly class (1)"""
        return self.model.predict_proba(X)[:, 1]

    def load_model(self, path):
        if os.path.exists(path):
            self.model.load_model(path)
        else:
            print(f"Warning: Model path {path} does not exist.")
