# IPAD Anomaly Detection Interface

This directory contains the Interface layer (Frontend & Backend) for the existing IPAD Video Anomaly Detection pipeline.

## Structure
- `/backend`: FastAPI service that interfaces with the existing ML pipeline.
- `/frontend`: React + Vite dashboard for user interaction.

## How it Works
1. **User Uploads Video**: The frontend sends a video file to the `/analyze-video` endpoint.
2. **Preprocessing**: The backend extracts frames using OpenCV and normalizes them for the CNN.
3. **Inference**: Each frame is encoded via the CNN, processed in windows of 16 by the BiLSTM+Attention model, and finally classified by XGBoost.
4. **Results**: The backend aggregates scores and returns a detailed report (Anomaly Detected vs Normal) with confidence scores.

## How to Run
From the project root:
```powershell
powershell .\run_system.ps1
```

Or manually:
1. Backend: `cd interface/backend; python main.py`
2. Frontend: `cd interface/frontend; npm run dev`

## Requirements
- Python (FastAPI, Uvicorn, OpenCV, Torch, XGBoost)
- Node.js (for React frontend)
