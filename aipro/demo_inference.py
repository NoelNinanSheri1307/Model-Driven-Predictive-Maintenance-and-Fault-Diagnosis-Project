import torch
import torch.nn as nn
from torchvision import transforms
import numpy as np
import os
import tqdm
import matplotlib.pyplot as plt
from datetime import datetime

# Import project modules
from ipad_anomaly_detection.dataset.dataset_loader import IPADLoader, get_frame
from ipad_anomaly_detection.models.cnn_encoder import get_cnn_encoder
from ipad_anomaly_detection.models.bilstm_attention import get_bilstm_attention
from ipad_anomaly_detection.classifiers.xgboost_model import XGBoostClassifier
from ipad_anomaly_detection.evaluation.visualize_results import plot_anomaly_scores

# --- Configuration ---
DATASET_PATH = r"E:\AI_Predictive_Maintenance_Project\datasets\IPAD_dataset"
CHECKPOINT_DIR = r"ipad_anomaly_detection\checkpoints"
SEQUENCE_LENGTH = 16
STRIDE = 10 
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
TARGET_SEQ_ID = "S06_07" # This sequence contains actual anomalies for demonstration

def run_demo():
    print(f"\n{'='*60}")
    print(f"IPAD ANOMALY DETECTION ")
    print(f"{'='*60}")
    print(f"Target Sequence: {TARGET_SEQ_ID}")
    print(f"Hardware Acceleration: {DEVICE.type.upper()}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    # 1. Initialize Dataset
    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    print("[1/4] Scanning Dataset...")
    test_loader_raw = IPADLoader(DATASET_PATH, mode='testing', transform=transform)
    
    # Extract the target sample
    sample = None
    for s in test_loader_raw:
        if s['seq_id'] == TARGET_SEQ_ID:
            sample = s
            break
            
    if not sample:
        print(f"❌ Error: Targeted sequence {TARGET_SEQ_ID} not found.")
        return

    # 2. Load Trained Weight Intelligence
    print("[2/4] Loading Trained Model Weights (30hr Knowledge)...")
    cnn_encoder = get_cnn_encoder().to(DEVICE)
    bilstm_attn = get_bilstm_attention().to(DEVICE)
    xgb_clf = XGBoostClassifier()

    try:
        cnn_encoder.load_state_dict(torch.load(os.path.join(CHECKPOINT_DIR, "cnn_encoder.pth"), map_location=DEVICE))
        bilstm_attn.load_state_dict(torch.load(os.path.join(CHECKPOINT_DIR, "bilstm_attn.pth"), map_location=DEVICE))
        xgb_clf.load_model(os.path.join(CHECKPOINT_DIR, "final_xgboost_model.json"))
        
        cnn_encoder.eval()
        bilstm_attn.eval()
        print("Models Loaded Successfully.")
    except Exception as e:
        print(f"Error loading weights: {e}")
        return

    # 3. Fast Inference Execution
    print(f"\n[3/4] Processing Sequence ({len(sample['frame_paths'])} frames)...")
    
    all_scores = []
    all_labels = []
    
    with torch.no_grad():
        frame_cache = [get_frame(p, transform=transform) for p in tqdm.tqdm(sample['frame_paths'], desc="Loading Frames", ascii=True)]
        
        print("\n--- LIVE DETECTION LOG ---")
        for s in range(0, len(frame_cache) - SEQUENCE_LENGTH + 1, STRIDE):
            # Windowing
            win = torch.stack(frame_cache[s:s+SEQUENCE_LENGTH]).unsqueeze(0).to(DEVICE)
            b, seq, c, h, wi = win.shape
            
            # Deep Learning Feature Extraction
            feat = cnn_encoder(win.view(b * seq, c, h, wi)).view(b, seq, -1)
            emb, attn_weights = bilstm_attn(feat)
            
            # XGBoost Decision
            prob = xgb_clf.predict_proba(emb.cpu().numpy())[0]
            
            # Label from .npy for ground truth comparison
            true_label = 1 if np.any(sample['labels'][s:s+SEQUENCE_LENGTH] == 1) else 0
            
            all_scores.append(prob)
            all_labels.append(true_label)
            
            # Log updates
            status = "!!! ANOMALY !!!" if prob > 0.5 else "   NORMAL    "
            print(f"Frames [{s:03d}-{s+SEQUENCE_LENGTH:03d}] | Status: {status} | Score: {prob*100:5.1f}% | Truth: {'Yes' if true_label==1 else 'No'}")

    # 4. Generate Visualization and Results
    print(f"\n[4/4] Finalizing Results...")
    
    # Replicate scores over the stride to match frame count for plotting
    plot_scores = np.repeat(all_scores, STRIDE)
    plot_labels = np.repeat(all_labels, STRIDE)
    
    # Trim to match actual frame count if needed
    plot_scores = plot_scores[:len(sample['frame_paths'])]
    plot_labels = plot_labels[:len(sample['frame_paths'])]
    
    result_path = f"ipad_anomaly_detection/results/demo_timeline_{TARGET_SEQ_ID}.png"
    plot_anomaly_scores(plot_scores, plot_labels, save_path=result_path)
    
    # Calculate simple accuracy for the demo
    preds = [1 if p > 0.5 else 0 for p in all_scores]
    correct = sum([1 for p, t in zip(preds, all_labels) if p == t])
    accuracy = (correct / len(all_labels)) * 100

    print(f"\n{'='*60}")
    print(f"DEMO SUMMARY")
    print(f"{'='*60}")
    print(f"Total Segments Analyzed: {len(all_labels)}")
    print(f"Anomalies Detected: {sum(preds)}")
    print(f"Accuracy: {accuracy:.2f}%")
    print(f"Timeline Chart Saved: {result_path}")
    print(f"{'='*60}\n")
    print("Demo execution complete. Ready for presentation.")

if __name__ == "__main__":
    run_demo()
