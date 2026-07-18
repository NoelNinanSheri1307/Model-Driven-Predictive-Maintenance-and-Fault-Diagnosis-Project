import os
import cv2
import torch
import numpy as np
from torchvision import transforms
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import uuid
import sys

# Add parent directory to sys.path to import existing ML modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# ML Imports (Restored)
try:
    from ipad_anomaly_detection.models.cnn_encoder import get_cnn_encoder
    from ipad_anomaly_detection.models.bilstm_attention import get_bilstm_attention
    from ipad_anomaly_detection.classifiers.xgboost_model import XGBoostClassifier
except ImportError:
    from ipad_anomaly_detection.models.cnn_encoder import get_cnn_encoder
    from ipad_anomaly_detection.models.bilstm_attention import get_bilstm_attention
    from ipad_anomaly_detection.classifiers.xgboost_model import XGBoostClassifier

app = FastAPI(title="IPAD Anomaly Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHECKPOINT_DIR = os.path.join(BASE_DIR, "ipad_anomaly_detection", "checkpoints")
SEQUENCE_LENGTH = 16
STRIDE = 1
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_uploads")

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

models = {}

@app.on_event("startup")
async def load_models():
    print("Loading AI Models for Video Anomaly Detection...")
    try:
        cnn_encoder = get_cnn_encoder().to(DEVICE)
        bilstm_attn = get_bilstm_attention().to(DEVICE)
        xgb_clf = XGBoostClassifier()

        cnn_encoder.load_state_dict(torch.load(os.path.join(CHECKPOINT_DIR, "cnn_encoder.pth"), map_location=DEVICE))
        bilstm_attn.load_state_dict(torch.load(os.path.join(CHECKPOINT_DIR, "bilstm_attn.pth"), map_location=DEVICE))
        xgb_clf.load_model(os.path.join(CHECKPOINT_DIR, "final_xgboost_model.json"))

        cnn_encoder.eval()
        bilstm_attn.eval()

        models["cnn"] = cnn_encoder
        models["bilstm"] = bilstm_attn
        models["xgboost"] = xgb_clf
        print("Video Models loaded successfully.")
    except Exception as e:
        print(f"FAILED TO LOAD MODELS: {e}")

@app.get("/")
async def root():
    return {"message": "IPAD Anomaly Detection Service is Online"}

@app.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
        raise HTTPException(status_code=400, detail="Unsupported video format")

    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1]
    temp_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        cap = cv2.VideoCapture(temp_path)
        frames = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(transform(frame))
        cap.release()

        if len(frames) < SEQUENCE_LENGTH:
            return {
                "result": "Inconclusive",
                "details": f"Video too short. Need {SEQUENCE_LENGTH} frames, got {len(frames)}."
            }

        all_scores = []
        cnn = models["cnn"]
        bilstm = models["bilstm"]
        xgb = models["xgboost"]

        with torch.no_grad():
            for s in range(0, len(frames) - SEQUENCE_LENGTH + 1, STRIDE):
                win = torch.stack(frames[s:s+SEQUENCE_LENGTH]).unsqueeze(0).to(DEVICE)
                b, seq, c, h, wi = win.shape
                
                feat = cnn(win.view(b * seq, c, h, wi)).view(b, seq, -1)
                emb, _ = bilstm(feat)
                probs = xgb.predict_proba(emb.cpu().numpy())[0]
                
                if isinstance(probs, np.ndarray) and len(probs) > 1:
                    result_score = float(probs[1]) 
                else:
                    result_score = float(probs)
                
                all_scores.append(result_score)

        if not all_scores:
             return {"result": "Normal", "score": 0.0, "details": "No segments processed"}

        max_score = max(all_scores)
        avg_score = sum(all_scores) / len(all_scores)
        anomaly_detected = any(s > 0.5 for s in all_scores)

        if os.path.exists(temp_path):
            os.remove(temp_path)

        return {
            "result": "Anomaly Detected" if anomaly_detected else "Normal",
            "score": round(max_score, 4),
            "average_score": round(avg_score, 4),
            "details": f"Processed {len(frames)} frames. Peak anomaly score: {max_score*100:.1f}%"
        }

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
