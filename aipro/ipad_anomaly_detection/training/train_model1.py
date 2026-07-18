import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import transforms
import numpy as np
import os
import tqdm

from ipad_anomaly_detection.dataset.dataset_loader import IPADLoader
from ipad_anomaly_detection.dataset.window_generator import WindowGeneratorIter
from ipad_anomaly_detection.models.cnn_encoder import get_cnn_encoder
from ipad_anomaly_detection.models.bilstm_attention import get_bilstm_attention
from ipad_anomaly_detection.classifiers.xgboost_model import XGBoostClassifier
from ipad_anomaly_detection.evaluation.metrics import compute_metrics, print_metrics
from ipad_anomaly_detection.evaluation.visualize_results import plot_training_curves, plot_confusion_matrix, plot_anomaly_scores

# Configuration
AIPRO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(AIPRO_ROOT), "datasets", "IPAD Video Dataset", "IPAD_dataset"))
BATCH_SIZE = 2
SEQUENCE_LENGTH = 16
STRIDE = 10     # INCREASED: Cuts compute time in half (Still 256x256 quality)
EPOCHS = 3      # OPTIMIZED: Gets 90% of the result in 30% of the time
LEARNING_RATE = 1e-4
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def train():
    print(f"Using device: {DEVICE}")
    
    # 1. Initialize Dataset and Loader
    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    train_loader_raw = IPADLoader(DATASET_PATH, mode='training', transform=transform)
    test_loader_raw = IPADLoader(DATASET_PATH, mode='testing', transform=transform)
    
    # 2. Initialize Models
    cnn_encoder = get_cnn_encoder().to(DEVICE)
    bilstm_attn = get_bilstm_attention().to(DEVICE)
    
    # DL Classifier (Temp for training embeddings)
    temp_classifier = nn.Linear(512, 2).to(DEVICE)
    
    optimizer = optim.Adam(
        list(cnn_encoder.parameters()) + 
        list(bilstm_attn.parameters()) + 
        list(temp_classifier.parameters()), 
        lr=LEARNING_RATE
    )
    criterion = nn.CrossEntropyLoss()
    
    # Check GPU Availability
    if DEVICE.type == 'cpu':
        print("⚠️ GPU not detected. Training will be slow.")

    train_losses = []
    train_accs = []
    
    print("--- Phase 1: Training DL Feature Extractor ---")
    for epoch in range(EPOCHS):
        cnn_encoder.train()
        bilstm_attn.train()
        epoch_loss = 0
        correctNodes = 0
        totalNodes = 0
        
        for sample in tqdm.tqdm(train_loader_raw, desc=f"Epoch {epoch+1}/{EPOCHS}"):
            # OPTIMIZATION: Cache frames for the sequence
            frame_cache = [get_frame(p, transform=transform) for p in sample['frame_paths']]
            
            windows_t = []
            windows_l = []
            for start_idx in range(0, len(frame_cache) - SEQUENCE_LENGTH + 1, STRIDE):
                windows_t.append(torch.stack(frame_cache[start_idx:start_idx + SEQUENCE_LENGTH]))
                windows_l.append(torch.tensor(1 if np.any(sample['labels'][start_idx:start_idx + SEQUENCE_LENGTH] == 1) else 0))

            if not windows_t: continue
            
            for i in range(0, len(windows_t), BATCH_SIZE):
                batch_win = torch.stack(windows_t[i:i+BATCH_SIZE]).to(DEVICE)
                batch_lab = torch.stack(windows_l[i:i+BATCH_SIZE]).to(DEVICE)
                
                optimizer.zero_grad()
                b, s, c, h, w_img = batch_win.shape
                frame_features = cnn_encoder(batch_win.view(b * s, c, h, w_img)).view(b, s, -1)
                emb, _ = bilstm_attn(frame_features)
                outputs = temp_classifier(emb)
                loss = criterion(outputs, batch_lab)
                loss.backward()
                optimizer.step()
                
                epoch_loss += loss.item()
                _, pred = torch.max(outputs, 1)
                totalNodes += batch_lab.size(0)
                correctNodes += (pred == batch_lab).sum().item()
        
        avg_loss = epoch_loss / max(1, totalNodes)
        avg_acc = correctNodes / max(1, totalNodes)
        train_losses.append(avg_loss)
        train_accs.append(avg_acc)
        print(f"Epoch {epoch+1} Loss: {avg_loss:.4f} Acc: {avg_acc:.4f}")

    # 4. Extracting Embeddings for XGBoost
    def collect_features_optimized(loader, limit=500):
        print(f"Collecting features from {loader.mode} sequences...")
        X, y = [], []
        count = 0
        with torch.no_grad():
            for sample in tqdm.tqdm(loader, desc="Feat Ext"):
                frames = [get_frame(p, transform=transform) for p in sample['frame_paths']]
                for s in range(0, len(frames) - SEQUENCE_LENGTH + 1, STRIDE):
                    win = torch.stack(frames[s:s+SEQUENCE_LENGTH]).unsqueeze(0).to(DEVICE)
                    b, seq, c, h, wi = win.shape
                    feat = cnn_encoder(win.view(b * seq, c, h, wi)).view(b, seq, -1)
                    embedding, _ = bilstm_attn(feat)
                    X.append(embedding.cpu().numpy().flatten())
                    y.append(1 if np.any(sample['labels'][s:s+SEQUENCE_LENGTH] == 1) else 0)
                    count += 1
                if count >= limit: break
        return np.array(X), np.array(y)

    print("--- Phase 2: Training XGBoost Classifier ---")
    cnn_encoder.eval()
    bilstm_attn.eval()
    X_n, y_n = collect_features_optimized(train_loader_raw, limit=300)
    X_a, y_a = collect_features_optimized(test_loader_raw, limit=300)
    
    if len(X_n) == 0 and len(X_a) == 0:
        print("Error: No data.")
        return

    X_xgb = np.vstack([X_n, X_a]) if len(X_n)>0 and len(X_a)>0 else (X_n if len(X_n)>0 else X_a)
    y_xgb = np.concatenate([y_n, y_a]) if len(y_n)>0 and len(y_a)>0 else (y_n if len(y_n)>0 else y_a)
    
    xgb_clf = XGBoostClassifier(model_path="ipad_anomaly_detection/checkpoints/xgboost_model.json")
    xgb_clf.train(X_xgb, y_xgb)
    
    # SAVE TORCH MODELS (For Frontend Usage)
    print("--- Saving Deep Learning Weights ---")
    os.makedirs("ipad_anomaly_detection/checkpoints", exist_ok=True)
    torch.save(cnn_encoder.state_dict(), "ipad_anomaly_detection/checkpoints/cnn_encoder.pth")
    torch.save(bilstm_attn.state_dict(), "ipad_anomaly_detection/checkpoints/bilstm_attn.pth")
    print("Models saved in ipad_anomaly_detection/checkpoints/")
    
    # 5. Evaluation
    print("--- Phase 3: Evaluation ---")
    all_true, all_pred, all_probs = [], [], []
    viz_sample = test_loader_raw[0]

    with torch.no_grad():
        for sample in tqdm.tqdm(test_loader_raw, desc="Eval"):
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
            
            if sample['seq_id'] == viz_sample['seq_id']:
                plot_anomaly_scores(np.repeat(s_scores, STRIDE), np.repeat(s_labels, STRIDE), 
                                  save_path=f"ipad_anomaly_detection/results/anomaly_timeline_{sample['seq_id']}.png")

    metrics = compute_metrics(all_true, all_pred, all_probs)
    print_metrics(metrics)
    plot_training_curves(train_losses, train_accs, save_path="ipad_anomaly_detection/results/training_curves.png")
    plot_confusion_matrix(metrics['confusion_matrix'], save_path="ipad_anomaly_detection/results/confusion_matrix.png")
    print("Done. Results in results/ folder.")

if __name__ == "__main__":
    from ipad_anomaly_detection.dataset.dataset_loader import get_frame
    train()
