# AI Predictive Maintenance Suite

A research-grade, unified Predictive Maintenance Suite integrating three diagnostic modalities:
1.  **Video Anomaly Detection**: Deep learning-based real-time analysis of machine operation video frames.
2.  **Audio Anomaly Detection**: Acoustic analysis using unsupervised Isolation Forests trained on extracted MFCC (Mel-Frequency Cepstral Coefficients) features.
3.  **Remaining Useful Life (RUL) Prediction**: Profile-aware Remaining Useful Life estimation of NASA Turbofan Engines using Gradient Boosted Trees (XGBoost).

All modules expose RESTful APIs using **FastAPI** and are visualized within a unified **Vite + React + Tailwind CSS** frontend dashboard.

---

## Workspace Structure

The project is structured as follows:

```text
AI_Predictive_Maintenance_Project/
├── aipro/                              # Main workspace
│   ├── interface/
│   │   ├── backend/                    # FastAPI services
│   │   │   ├── main.py                 # Video API (Port 8000)
│   │   │   └── rul_backend.py          # RUL API (Port 8002)
│   │   └── frontend/                   # React dashboard (Vite + Tailwind)
│   ├── ipad_anomaly_detection/         # Video Anomaly DL models & training
│   ├── run_system.ps1                  # Orchestrator script to start all services
│   └── update_paths.py                 # Path calibration script
│
├── AI_Predictive_Maintenance_Audio/    # Audio maintenance module
│   ├── api/
│   │   └── main.py                     # Audio API (Port 8001)
│   ├── models/                         # Audio model weights (.pkl)
│   └── src/                            # Feature extraction and training scripts
│
└── datasets/                           # Data workspace
    ├── IPAD Video Dataset/             # Video dataset sequences
    ├── Sound_Dataset/                  # Audio recordings (.wav)
    └── RUL_project/                    # NASA Turbofan RUL code and datasets
```

---

## Port Allocation

*   **Port 5173 / 3000**: Main Frontend (Vite)
*   **Port 8000**: Video Anomaly Backend (FastAPI)
*   **Port 8001**: Audio Anomaly Backend (FastAPI)
*   **Port 8002**: Remaining Useful Life Backend (FastAPI)

---

## Setup & Dependencies

### Python Environment & Version Compatibility
This project requires **Python 3.10**. 
> [!IMPORTANT]
> The deep learning models require matched versions of PyTorch and Torchvision. If they are mismatched, you will encounter `RuntimeError: operator torchvision::nms does not exist`.

The verified, compatible versions are:
*   **PyTorch**: `2.13.0`
*   **Torchvision**: `0.28.0`

Install requirements globally or in your virtual environment:
```bash
pip install torch==2.13.0 torchvision==0.28.0
pip install fastapi uvicorn python-multipart librosa pandas scikit-learn joblib xgboost opencv-python matplotlib seaborn tqdm
```

If you wish to use GPU acceleration with your NVIDIA graphics card:
```bash
pip install torch==2.13.0 torchvision==0.28.0 --index-url https://download.pytorch.org/whl/cu126
```

### Frontend Environment
Navigate to the frontend directory and install dependencies:
```bash
cd aipro/interface/frontend
npm install
```

---

## How to Launch the Suite

To spin up all backend services and open the frontend dashboard automatically, run the unified orchestrator script from the root workspace:

```powershell
cd aipro
.\run_system.ps1
```

The script will launch separate terminal instances for each FastAPI backend on ports `8000`, `8001`, and `8002`, and start the Vite dev server for the dashboard.
