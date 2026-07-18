# IPAD Video Anomaly Detection System

A research-grade implementation of a Video Anomaly Detection system using the Industrial Process Anomaly Detection (IPAD) dataset.

## System Architecture

The pipeline follows a hybrid Deep Learning and Gradient Boosting approach:

1.  **CNN Encoder**: A lightweight feature extractor that processes individual frames (256x256x3) into 512-dimensional feature vectors.
2.  **BiLSTM**: A Bidirectional Long Short-Term Memory network that captures temporal dependencies across a sliding window of 16 frames.
3.  **Attention Layer**: A temporal attention mechanism that assigns importance weights to frames within a window, producing a unified window embedding.
4.  **XGBoost Classifier**: A high-performance Gradient Boosting model that performs the final binary classification (Normal vs Anomaly) based on the attention-weighted embeddings.

## Project Structure

```text
ipad_anomaly_detection/
├── dataset/
│   ├── dataset_loader.py    # Dynamic scanner for Rxx/Sxx structure
│   └── window_generator.py  # Sliding window generation logic
├── models/
│   ├── cnn_encoder.py       # DL Feature Extractor
│   └── bilstm_attention.py  # Temporal & Attention modules
├── classifiers/
│   └── xgboost_model.py     # Gradient Boosting classifier
├── training/
│   └── train_model1.py      # Main training & evaluation script
├── evaluation/
│   ├── metrics.py           # AUC, F1, Accuracy metrics
│   └── visualize_results.py # Plotting & logging
└── results/                 # Output plots and metrics
```

## Setup & Usage

### 1. Requirements
Install the necessary Python packages. 

> [!IMPORTANT]
> Ensure PyTorch and Torchvision versions are matched (e.g. PyTorch `2.13.0` and Torchvision `0.28.0`) to avoid operator registration errors like `RuntimeError: operator torchvision::nms does not exist`.

```bash
pip install torch==2.13.0 torchvision==0.28.0
pip install opencv-python xgboost scikit-learn matplotlib seaborn tqdm
```

### 2. Dataset Path
The dataset is expected at:
`C:\Users\VICTUS\Downloads\IPAD Video Dataset\IPAD_dataset`

If the path differs, update `DATASET_PATH` in `training/train_model1.py`.

### 3. Training & Evaluation
Run the main script from the root directory:
```bash
python -m ipad_anomaly_detection.training.train_model1
```

## Performance & Monitoring
- **Sliding Window**: 16 frames length, 5 frames stride.
- **Hardware**: Optimized for NVIDIA RTX 2050 (Batch Size 8).
- **GPU Acceleration**: Automatically enabled if CUDA is available.
- **Output**: Training curves, Confusion Matrix, and Anomaly Score timelines are saved in the `results/` folder.

## Key Features
- **Dynamic Loading**: Automatically scans all device folders and sequence IDs.
- **Attention Mapping**: Identifies which frames in an anomaly window are most significant.
- **Hybrid Learning**: Combines the representation power of CNNs/LSTMs with the robust classification of XGBoost.
```

Machines 
Conveyor: R01 & S01
Automatic lifter: R02 & S02
Forklift Truck: R03 & S03
Manual Cutter: R04 & S04
90 degree and 180 degree conveyor :S05 & S06
Z lifter and Box Sorter: S07 & S08
Mechanical Gripper and Standing Crane: S09 & S10
Automatic Cutter and Drilling Machine:S11 &S12
