import os
import numpy as np
import matplotlib.pyplot as plt

from src.preprocessing import load_data, scale_data
from src.sequence import create_sequences, create_test_sequences
from src.train_models import train_all_models
from src.evaluate import evaluate
from generate_plots import run_all_plots

# ── Folders setup ─────────────────────────────────────────────────────────────
os.makedirs("results", exist_ok=True)
os.makedirs("results/plots", exist_ok=True)

# ── Exact published results from the base paper (CAELSTM) ────────────────────
BASE_PAPER_RESULTS = {
    "FD001": {"rmse": 14.44, "mae": 10.49, "score": 282.38},
    "FD003": {"rmse": 13.40, "mae": 10.68, "score": 264.47},
}

datasets = ["FD001", "FD003"]

# Collects results across both datasets for the final plot generation
plot_data = {}

for ds in datasets:
    print(f"\n==============================")
    print(f"RUNNING DATASET: {ds}")
    print(f"==============================")

    train_path = f"data/train_{ds}.txt"
    test_path  = f"data/test_{ds}.txt"
    rul_path   = f"data/RUL_{ds}.txt"

    # ── Data preparation ──────────────────────────────────────────────────────
    train, test = load_data(train_path, test_path, rul_path)
    train, test = scale_data(train, test)

    X_train, y_train = create_sequences(train, seq_length=30)
    X_test,  y_test  = create_test_sequences(test, seq_length=30)

    print("Train shape:", X_train.shape)
    print("Test shape (Benchmark Standard):", X_test.shape)
    input_shape = (X_train.shape[1], X_train.shape[2])

    # ── Train ─────────────────────────────────────────────────────────────────
    models, histories, training_times = train_all_models(X_train, y_train, input_shape)

    # ── Evaluate ──────────────────────────────────────────────────────────────
    results = []
    for name, model in models.items():
        metrics = evaluate(model, X_test, y_test)
        metrics["time"] = training_times[name]
        results.append((name, metrics))

    # ── Save comparative .txt results ─────────────────────────────────────────
    file_path = f"results/{ds}_results_comparative.txt"
    with open(file_path, "w") as f:
        f.write(f"DATASET: {ds}\n")
        f.write("=" * 75 + "\n\n")

        base_res = BASE_PAPER_RESULTS[ds]

        for name, m in results:
            f.write(f"PROPOSED MODEL: {name}\n")
            f.write("-" * 75 + "\n")

            f.write("REGRESSION METRICS: EXISTING VS PROPOSED\n")
            f.write(f"{'Metric':<15} | {'Existing (Base Paper)':<25} | {'Proposed (Yours)':<20} | {'Status'}\n")
            f.write("-" * 75 + "\n")

            rmse_diff   = m["rmse"]  - base_res["rmse"]
            rmse_status = f"Better by {abs(rmse_diff):.2f}" if rmse_diff < 0 else f"Worse by {rmse_diff:.2f}"
            f.write(f"{'RMSE':<15} | {base_res['rmse']:<25} | {m['rmse']:<20.2f} | {rmse_status}\n")

            mae_diff    = m["mae"]   - base_res["mae"]
            mae_status  = f"Better by {abs(mae_diff):.2f}"  if mae_diff  < 0 else f"Worse by {mae_diff:.2f}"
            f.write(f"{'MAE':<15} | {base_res['mae']:<25} | {m['mae']:<20.2f} | {mae_status}\n")

            score_diff   = m["score"]  - base_res["score"]
            score_status = f"Better by {abs(score_diff):.2f}" if score_diff < 0 else f"Worse by {score_diff:.2f}"
            f.write(f"{'NASA Score':<15} | {base_res['score']:<25} | {m['score']:<20.2f} | {score_status}\n")

            f.write(f"{'R2 Score':<15} | {'Not Reported':<25} | {m['r2']:<20.2f} | N/A\n\n")

            f.write("CLASSIFICATION METRICS (Proposed Additions for Safety Analysis):\n")
            f.write(f"  Precision          : {m['precision']:.2f}\n")
            f.write(f"  Recall             : {m['recall']:.2f}\n")
            f.write(f"  F1 Score           : {m['f1']:.2f}\n")
            f.write(f"  ROC-AUC            : {m['roc_auc']:.2f}\n\n")

            f.write("TRAINING INFO & CONFUSION MATRIX:\n")
            f.write(f"  Training Time (s)  : {m['time']:.2f}\n")
            f.write(f"  Confusion Matrix:\n")
            f.write(str(m["confusion_matrix"]) + "\n\n")
            f.write("=" * 75 + "\n\n")

    print(f"Saved comparative results: {file_path}")

    # ── Collect metrics for plotting ──────────────────────────────────────────
    # Uses the last model in results (only one model here: Optimized XGBoost)
    for name, m in results:
        plot_data[ds] = {
            # Regression
            "rmse_base":  BASE_PAPER_RESULTS[ds]["rmse"],
            "rmse_prop":  m["rmse"],
            "mae_base":   BASE_PAPER_RESULTS[ds]["mae"],
            "mae_prop":   m["mae"],
            "score_base": BASE_PAPER_RESULTS[ds]["score"],
            "score_prop": m["score"],
            "r2_prop":    m["r2"],
            # Classification
            "precision":  m["precision"],
            "recall":     m["recall"],
            "f1":         m["f1"],
            "roc_auc":    m["roc_auc"],
            # Confusion matrix (numpy 2x2 array)
            "cm":         m["confusion_matrix"],
        }

# ── Auto-generate all 6 plots after both datasets finish ─────────────────────
run_all_plots(plot_data)

print("\nFD001 and FD003 PROCESSED AND COMPARED SUCCESSFULLY!")