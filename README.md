# AI Predictive Maintenance Suite &bull; Demo Branch

> [!IMPORTANT]
> **Looking for the Full Research Code?**
> This branch (`demo`) contains the **frontend-only interactive demonstration** optimized for lightweight web hosting (like Vercel). To access the complete research codebase, backend microservices, trained model weights, and datasets, switch to the **`main` branch**:
> ```bash
> git checkout main
> ```

---

## About the Demo Version

This deployment is an **interactive client-side simulation** of the unified AI Predictive Maintenance Suite. It reproduces the entire user experience, workflows, pipeline animations, and results without requiring any backend servers, GPU inference resources, or massive local datasets.

### What is Simulated on this Branch:
1.  **Video Anomaly Detection**: Simulates the 6-stage deep learning visual pipeline (*Frame Extraction &bull; ResNet CNN encoding &bull; BiLSTM sequence analysis &bull; Temporal Attention weighting &bull; XGBoost classification*) using built-in metadata profiles.
2.  **Audio Anomaly Detection**: Simulates MFCC spectral extraction and Isolation Forest outlier scoring on fan acoustic signatures.
3.  **Prognostics (Remaining Useful Life)**: Simulates sensor feature engineering, standardization, and XGBoost regression cycles for NASA Turbofan engines.

All pages, diagrams, results, and dashboards render inside **React** with smooth **Framer Motion** transitions and a custom unified design system in **Footlight MT Light** typography.

---

## How to Run the Demo Locally

Ensure you have **Node.js** installed on your system.

1.  **Navigate to the Frontend Directory**:
    ```bash
    cd aipro/interface/frontend
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Launch the Local Development Server**:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Switching to the Main Branch

To see the original backend configs, training scripts, datasets, and microservice APIs, check out the `main` branch:

```bash
# Switch to the main branch containing the full ML pipeline
git checkout main
```

### What is in the `main` branch:
*   **Deep Learning Models**: Spatial ResNet encoder and Bidirectional LSTM + Attention models in PyTorch.
*   **FastAPI Backends**: REST APIs for Video Anomaly Detection (Port 8000), Audio Anomaly Detection (Port 8001), and NASA Turbofan RUL Prediction (Port 8002).
*   **Training & Evaluation Pipelines**: TQDM-driven training loops, confusion matrix plotting, ROC-AUC calculations, and training history logs.
*   **Original Industrial Datasets**:
    *   **IPAD Dataset**: Video frames representing various machine failure and normal modes.
    *   **MIMII Dataset**: Fan acoustic profiles under varying signal-to-noise ratios.
    *   **NASA C-MAPSS Logs**: Sensory logs representing engine run-to-failure cycles (FD001 - FD004).
