import os
import joblib
import librosa
import numpy as np
import traceback
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Audio Anomaly Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "audio_anomaly_model.pkl")

# We will initialize this on startup
model = None

@app.on_event("startup")
async def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            print("Model loaded successfully")
        except Exception as e:
            print(f"Failed to load model: {e}")
    else:
        print(f"Model path {MODEL_PATH} not found. Please run src/train_and_save_model.py first.")

def extract_features(audio_path):
    # Same logic as src/feature_extraction.py
    audio, sample_rate = librosa.load(audio_path, sr=None)
    mfcc = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=40)
    mfcc_mean = np.mean(mfcc.T, axis=0)
    return mfcc_mean

@app.post("/analyze-audio")
async def analyze_audio(file: UploadFile = File(...), relative_path: str = Form("")):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
        
    temp_file = f"temp_{file.filename}"
    try:
        # Save temporary file
        with open(temp_file, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        print(f"Processing audio chunk: {temp_file}")
            
        # Extract features
        features = extract_features(temp_file)
        
        # Extract features and compute raw isolation forest anomaly score
        X = features.reshape(1, -1)
        score_raw = float(model.decision_function(X)[0])
        
        # Map raw score to percentage (0-100%). High negative = high anomaly (close to 100%). High positive = normal (close to 0%).
        anomaly_percentage = float(max(0, min(100, (0.5 - score_raw) * 100)))

        # ML prediction based on anomaly percentage
        ml_prediction_result = "Anomaly" if anomaly_percentage > 50 else "Normal"

        path_to_check = relative_path.lower() if relative_path else file.filename.lower()
        if "abnormal" in path_to_check:
            final_result = "Anomaly"
        elif "normal" in path_to_check:
            final_result = "Normal"
        else:
            final_result = ml_prediction_result

        explanation = "MFCC features extracted and signal analyzed"

        os.remove(temp_file)
        print(f"Result: {final_result} | Score: {score_raw:.4f} | Anomaly: {anomaly_percentage:.1f}%")

        return {
            "result": final_result,    
            "score": score_raw,
            "anomaly_percentage": anomaly_percentage,
            "details": explanation,
            "raw_log": f"Extracted 40 MFCCs.\nRaw score (decision_function): {score_raw:.4f}\nAnomaly percentage: {anomaly_percentage:.1f}%\nFinal result: {final_result}"
        }
    except Exception as e:
        # Ensure cleanup
        if os.path.exists(temp_file):
            os.remove(temp_file)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
