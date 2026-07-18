import os
import torch
import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import uuid
import sys

# 1. RUL PROJECT PATHS
# Dynamically resolve path relative to the workspace root
AIPRO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RUL_PROJECT_PATH = os.path.abspath(os.path.join(os.path.dirname(AIPRO_ROOT), "datasets", "RUL_project"))
sys.path.append(RUL_PROJECT_PATH)
sys.path.append(os.path.join(RUL_PROJECT_PATH, "src"))

app = FastAPI(title="NASA Universal RUL Suite")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_rul_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Dataset Registry
DATASETS = ["FD001", "FD002", "FD003", "FD004"]
models = {} # Format: { "FD001_model": xgb, "FD001_scaler": scaler, ... }

@app.on_event("startup")
async def startup_event():
    print("Initializing Universal RUL Predictive Suite...")
    from src import preprocessing as pre
    from src import sequence as seq
    from src import train_models as trn

    for ds in DATASETS:
        model_path = os.path.join(RUL_PROJECT_PATH, "models", f"xgb_{ds}_model.joblib")
        scaler_path = os.path.join(RUL_PROJECT_PATH, "models", f"{ds}_scaler.joblib")

        try:
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                print(f" Loading {ds} Intelligence...")
                models[f"{ds}_model"] = joblib.load(model_path)
                models[f"{ds}_scaler"] = joblib.load(scaler_path)
            else:
                print(f" Training {ds} from scratch (One-time pass)...")
                train_path = os.path.join(RUL_PROJECT_PATH, "data", f"train_{ds}.txt")
                test_path = os.path.join(RUL_PROJECT_PATH, "data", f"test_{ds}.txt")
                rul_path = os.path.join(RUL_PROJECT_PATH, "data", f"RUL_{ds}.txt")
                
                train, test = pre.load_data(train_path, test_path, rul_path)
                train_scaled, _, scaler = pre.scale_data(train, test)
                
                X_train, y_train = seq.create_sequences(train_scaled, seq_length=30)
                rul_res, _, _ = trn.train_all_models(X_train, y_train, None)
                
                # Capture and Save
                model = rul_res["Optimized XGBoost"]
                models[f"{ds}_model"] = model
                models[f"{ds}_scaler"] = scaler
                
                joblib.dump(model, model_path)
                joblib.dump(scaler, scaler_path)
                print(f" {ds} calibrated and saved to disk.")
        except Exception as e:
            print(f" Failed to initialize {ds} engine: {e}")

    print(" Universal RUL System Online on Port 8002.")

@app.get("/")
async def root():
    return {"message": "NASA Universal RUL Suite is active"}

@app.post("/analyze-rul")
async def analyze_rul(file: UploadFile = File(...), dataset: str = Form("FD001")):
    if not file.filename.lower().endswith(('.txt', '.csv')):
        raise HTTPException(status_code=400, detail="Invalid log format")
    
    if dataset not in DATASETS:
        raise HTTPException(status_code=400, detail="Unsupported Machine Profile")

    temp = os.path.join(UPLOAD_DIR, f"rul_{uuid.uuid4()}.txt")
    try:
        with open(temp, "wb") as b: shutil.copyfileobj(file.file, b)
        
        # Consistent parsing across all 4 sets
        cols = ["engine_id", "cycle"] + [f"op{i}" for i in range(1,4)] + [f"s{i}" for i in range(1,22)]
        user_df = pd.read_csv(temp, delim_whitespace=True, header=None).dropna(axis=1)
        user_df.columns = cols
        
        if len(user_df) < 30:
            return {"health_zone": "INCONCLUSIVE", "details": f"Data error: Need 30 cycles, found {len(user_df)}."}

        from src import sequence as seq

        # 1. Dataset-Aware Feature Engineering
        user_processed = user_df.copy()
        if dataset in ["FD001", "FD003"]:
            drop_sensors = ["s1", "s5", "s6", "s10", "s16", "s18", "s19"]
            user_processed = user_processed.drop(columns=drop_sensors)
        
        # 2. Add Dummy RUL for staging
        user_processed["RUL"] = 0 
        
        # 3. Apply profile-specific Scaler
        scaler = models[f"{dataset}_scaler"]
        features = user_processed.drop(["engine_id", "cycle", "RUL"], axis=1).columns
        user_processed[features] = scaler.transform(user_processed[features])
        
        # 4. Generate sequences
        X_user, _ = seq.create_test_sequences(user_processed, seq_length=30)
        
        # 5. Predict using profile-specific Model
        y_pred = models[f"{dataset}_model"].predict(X_user)
        final_rul = int(y_pred[0])
        
        # Health Zoning
        zone = "SAFE"
        if final_rul <= 30: zone = "CRITICAL"
        elif final_rul <= 60: zone = "WARNING"

        return {
            "health_zone": zone,
            "rul_cycles": final_rul,
            "dataset_profile": dataset,
            "details": f"Analysis complete for {dataset} profile. Unit {int(user_df.iloc[0,0])} remaining: {final_rul} cycles."
        }
    except Exception as e:
        print(f"INFERENCE ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp): os.remove(temp)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
