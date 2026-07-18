import torch
import torch.nn as nn
from torchvision import transforms
import numpy as np
import os
import tqdm
from ipad_anomaly_detection.dataset.dataset_loader import IPADLoader, get_frame
from ipad_anomaly_detection.models.cnn_encoder import get_cnn_encoder
from ipad_anomaly_detection.models.bilstm_attention import get_bilstm_attention
from ipad_anomaly_detection.classifiers.xgboost_model import XGBoostClassifier
from ipad_anomaly_detection.evaluation.metrics import compute_metrics, print_metrics
from ipad_anomaly_detection.evaluation.visualize_results import plot_training_curves, plot_confusion_matrix, plot_anomaly_scores

# Configuration
DATASET_PATH = r"E:\AI_Predictive_Maintenance_Project\datasets\IPAD_dataset"
BATCH_SIZE = 2
SEQUENCE_LENGTH = 16
STRIDE = 10 # FAST BUT ACCURATE
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def finalize():
    print(f"Using device: {DEVICE}")
    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # 1. Load Data
    train_loader_raw = IPADLoader(DATASET_PATH, mode='training', transform=transform)
    test_loader_raw = IPADLoader(DATASET_PATH, mode='testing', transform=transform)
    
    # 2. Reconstruct Models
    cnn_encoder = get_cnn_encoder().to(DEVICE)
    bilstm_attn = get_bilstm_attention().to(DEVICE)
    
    # 3. LOAD SAVED WEIGHTS
    print("--- Loading Pre-trained DL weights ---")
    cnn_encoder.load_state_dict(torch.load("ipad_anomaly_detection/checkpoints/cnn_encoder.pth"))
    bilstm_attn.load_state_dict(torch.load("ipad_anomaly_detection/checkpoints/bilstm_attn.pth"))
    cnn_encoder.eval()
    bilstm_attn.eval()
    
    # 4. FULL Extraction (No Limit)
    def collect_all_features(loader, label_mode):
        print(f"--- Extracting ALL features from {label_mode} (100%) ---")
        X, y = [], []
        with torch.no_grad():
            for sample in tqdm.tqdm(loader, desc=f"Scanning {label_mode}"):
                # Optimized cache
                frames = [get_frame(p, transform=transform) for p in sample['frame_paths']]
                for s in range(0, len(frames) - SEQUENCE_LENGTH + 1, STRIDE):
                    win = torch.stack(frames[s:s+SEQUENCE_LENGTH]).unsqueeze(0).to(DEVICE)
                    b, seq, c, h, wi = win.shape
                    feat = cnn_encoder(win.view(b * seq, c, h, wi)).view(b, seq, -1)
                    embedding, _ = bilstm_attn(feat)
                    X.append(embedding.cpu().numpy().flatten())
                    y.append(1 if np.any(sample['labels'][s:s+SEQUENCE_LENGTH] == 1) else 0)
        return np.array(X), np.array(y)

    print("--- Phase 1: Re-training FULL XGBoost ---")
    X_train, y_train = collect_all_features(train_loader_raw, "Training Data")
    X_test_extra, y_test_extra = collect_all_features(test_loader_raw, "Validation Data")
    
    X_xgb = np.vstack([X_train, X_test_extra])
    y_xgb = np.concatenate([y_train, y_test_extra])
    
    # Train high-performance XGBoost on ALL data
    xgb_clf = XGBoostClassifier(model_path="ipad_anomaly_detection/checkpoints/final_xgboost_model.json")
    xgb_clf.train(X_xgb, y_xgb)
    
    print("--- Phase 2: High-Resolution Evaluation ---")
    all_true, all_pred, all_probs = [], [], []
    
    with torch.no_grad():
        for sample in tqdm.tqdm(test_loader_raw, desc="Evaluating"):
            frames = [get_frame(p, transform=transform) for p in sample['frame_paths']]
            s_scores, s_labels = [], []
            for s in range(0, len(frames) - SEQUENCE_LENGTH + 1, STRIDE):
                win = torch.stack(frames[s:s+SEQUENCE_LENGTH]).unsqueeze(0).to(DEVICE)
                b, seq, c, h, wi = win.shape
                feat = cnn_encoder(win.view(b * seq, c, h, wi)).view(b, seq, -1)
                emb, _ = bilstm_attn(feat)
                prob = xgb_clf.predict_proba(emb.cpu().numpy())[0]
                pred = 1 if prob > 0.5 else 0
                
                label = 1 if np.any(sample['labels'][s:s+SEQUENCE_LENGTH] == 1) else 0
                all_true.append(label)
                all_pred.append(pred)
                all_probs.append(prob)
                s_scores.append(prob)
                s_labels.append(label)
            
            # Save anomaly timelines for all R01 test videos
            if "R01" in sample['seq_id']:
                plot_anomaly_scores(np.repeat(s_scores, STRIDE), np.repeat(s_labels, STRIDE), 
                                  save_path=f"ipad_anomaly_detection/results/final_timeline_{sample['seq_id']}.png")

    metrics = compute_metrics(all_true, all_pred, all_probs)
    print_metrics(metrics)
    plot_confusion_matrix(metrics['confusion_matrix'], save_path="ipad_anomaly_detection/results/final_confusion_matrix.png")
    print("--- FULL RESEARCH COMPLETE ---")
    print("Check ipad_anomaly_detection/results/ for the high-performance final charts.")

if __name__ == "__main__":
    finalize()
