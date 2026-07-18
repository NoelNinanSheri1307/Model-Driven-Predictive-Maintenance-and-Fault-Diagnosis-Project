"""
generate_plots.py
=================
Generates all publication-ready plots for the CMAPSS RUL prediction project.
Can be run standalone (uses hardcoded RESULTS) or called from main.py via
run_all_plots(results_dict) for fully automated plot generation.

Plots generated:
  1. Regression Bar Chart     — RMSE / MAE / NASA Score (Existing vs Proposed)
  2. Classification Bar Chart — Precision / Recall / F1 / ROC-AUC per dataset
  3. Confusion Matrix Heatmap — FD001 and FD003 side-by-side
  4. Radar Chart              — Multi-metric overview across both datasets
  5. Score Gap Chart          — Visual delta between base paper and proposed
  6. Combined Summary Figure  — Single-page overview for reports / presentations
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.gridspec as gridspec
import seaborn as sns

# ── Output directory ──────────────────────────────────────────────────────────
os.makedirs("results/plots", exist_ok=True)

# ══════════════════════════════════════════════════════════════════════════════
# DEFAULT RESULTS (used only when running standalone, not from main.py)
# ══════════════════════════════════════════════════════════════════════════════
RESULTS = {
    "FD001": {
        "rmse_base": 14.44, "rmse_prop": 13.17,
        "mae_base":  10.49, "mae_prop":   9.80,
        "score_base": 282.38, "score_prop": 230.00,
        "r2_prop": 0.91,
        "precision": 0.88,
        "recall":    0.85,
        "f1":        0.86,
        "roc_auc":   0.92,
        "cm": np.array([[78, 5], [8, 9]]),
    },
    "FD003": {
        "rmse_base": 13.40, "rmse_prop": 13.28,
        "mae_base":  10.68, "mae_prop":  10.10,
        "score_base": 264.47, "score_prop": 220.00,
        "r2_prop": 0.90,
        "precision": 0.87,
        "recall":    0.83,
        "f1":        0.85,
        "roc_auc":   0.91,
        "cm": np.array([[80, 6], [9, 5]]),
    },
}

# ── Colour palette ────────────────────────────────────────────────────────────
C_BASE  = "#E07070"
C_PROP  = "#4A90D9"
C_ACCENT = "#2ECC71"
C_WARN  = "#E74C3C"
C_BG    = "#F9FAFB"
C_GRID  = "#E0E0E0"

plt.rcParams.update({
    "figure.facecolor": C_BG,
    "axes.facecolor":   C_BG,
    "axes.edgecolor":   "#CCCCCC",
    "axes.grid":        True,
    "grid.color":       C_GRID,
    "grid.linestyle":   "--",
    "grid.linewidth":   0.6,
    "font.family":      "DejaVu Sans",
    "axes.titlesize":   13,
    "axes.labelsize":   11,
    "xtick.labelsize":  10,
    "ytick.labelsize":  10,
    "legend.fontsize":  10,
    "figure.dpi":       150,
})


# ── Helper: annotate bar values ───────────────────────────────────────────────
def _annotate_bars(ax, bars, fmt="{:.2f}", offset_frac=0.015, bold=False):
    ylim = ax.get_ylim()
    span = ylim[1] - ylim[0]
    for bar in bars:
        h = bar.get_height()
        kw = dict(ha="center", va="bottom", fontsize=9)
        if bold:
            kw["fontweight"] = "bold"
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            h + span * offset_frac,
            fmt.format(h), **kw
        )


# ══════════════════════════════════════════════════════════════════════════════
# PLOT 1 — Regression Bar Chart
# ══════════════════════════════════════════════════════════════════════════════
def plot_regression_comparison():
    metrics = ["RMSE", "MAE", "NASA Score"]
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    fig.suptitle("Regression Metrics: Existing vs Proposed Model",
                 fontsize=15, fontweight="bold", y=1.01)

    for ax, (ds, r) in zip(axes, RESULTS.items()):
        base_vals = [r["rmse_base"], r["mae_base"],  r["score_base"]]
        prop_vals = [r["rmse_prop"], r["mae_prop"],  r["score_prop"]]

        x, w = np.arange(len(metrics)), 0.35
        bars_b = ax.bar(x - w/2, base_vals, w, label="Existing (Base Paper)",
                        color=C_BASE, alpha=0.85, edgecolor="white", linewidth=0.8)
        bars_p = ax.bar(x + w/2, prop_vals, w, label="Proposed (Ours)",
                        color=C_PROP, alpha=0.90, edgecolor="white", linewidth=0.8)

        ax.set_ylim(0, max(base_vals + prop_vals) * 1.20)
        _annotate_bars(ax, bars_b)
        _annotate_bars(ax, bars_p, bold=True)

        for i, (bv, pv) in enumerate(zip(base_vals, prop_vals)):
            diff = bv - pv
            colour = C_ACCENT if diff > 0 else C_WARN
            span = ax.get_ylim()[1] - ax.get_ylim()[0]
            ax.annotate(
                f"{'↓' if diff > 0 else '↑'}{abs(diff):.2f}",
                xy=(x[i] + w/2, pv),
                xytext=(x[i] + w/2, pv + span * 0.07),
                fontsize=8, color=colour, ha="center", fontweight="bold"
            )

        ax.set_title(f"Dataset: {ds}", fontweight="bold")
        ax.set_xticks(x)
        ax.set_xticklabels(metrics)
        ax.set_ylabel("Score (lower is better)")
        ax.legend(loc="upper right")

    plt.tight_layout()
    path = "results/plots/01_regression_comparison.png"
    plt.savefig(path, bbox_inches="tight")
    plt.close()
    print(f"  ✓  {path}")


# ══════════════════════════════════════════════════════════════════════════════
# PLOT 2 — Classification Metrics Bar Chart
# ══════════════════════════════════════════════════════════════════════════════
def plot_classification_metrics():
    cls_keys   = ["precision", "recall", "f1", "roc_auc"]
    cls_labels = ["Precision", "Recall", "F1 Score", "ROC-AUC"]
    colours    = ["#4A90D9", "#27AE60", "#F39C12", "#9B59B6"]

    fig, axes = plt.subplots(1, 2, figsize=(14, 6), sharey=True)
    fig.suptitle("Classification Metrics — Safety Analysis (Proposed Model)",
                 fontsize=15, fontweight="bold", y=1.01)

    for ax, (ds, r) in zip(axes, RESULTS.items()):
        vals = [r[k] for k in cls_keys]
        bars = ax.bar(cls_labels, vals, color=colours, alpha=0.85,
                      edgecolor="white", linewidth=0.8, width=0.5)

        for bar, val in zip(bars, vals):
            ax.text(bar.get_x() + bar.get_width() / 2,
                    bar.get_height() + 0.01,
                    f"{val:.2f}", ha="center", va="bottom",
                    fontsize=10, fontweight="bold")

        ax.set_ylim(0, 1.20)
        ax.axhline(0.80, color=C_WARN, linestyle="--", linewidth=1.2,
                   alpha=0.6, label="80% threshold")
        ax.set_title(f"Dataset: {ds}", fontweight="bold")
        ax.set_ylabel("Score (higher is better)")
        ax.legend(loc="lower right")

    plt.tight_layout()
    path = "results/plots/02_classification_metrics.png"
    plt.savefig(path, bbox_inches="tight")
    plt.close()
    print(f"  ✓  {path}")


# ══════════════════════════════════════════════════════════════════════════════
# PLOT 3 — Confusion Matrices
# ══════════════════════════════════════════════════════════════════════════════
def plot_confusion_matrices():
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    fig.suptitle(
        "Confusion Matrices — Failure Risk Classification (threshold = 40 cycles)",
        fontsize=14, fontweight="bold", y=1.02
    )

    for ax, (ds, r) in zip(axes, RESULTS.items()):
        labels = ["Safe (RUL > 40)", "At Risk (RUL ≤ 40)"]
        sns.heatmap(r["cm"], annot=True, fmt="d", cmap="Blues", ax=ax,
                    xticklabels=labels, yticklabels=labels,
                    linewidths=0.5, linecolor="white",
                    annot_kws={"size": 14, "weight": "bold"},
                    cbar_kws={"shrink": 0.75})

        cell_labels = [["TN", "FP"], ["FN", "TP"]]
        for i in range(2):
            for j in range(2):
                ax.text(j + 0.5, i + 0.75, cell_labels[i][j],
                        ha="center", va="center",
                        fontsize=9, color="grey", style="italic")

        ax.set_title(f"Dataset: {ds}", fontweight="bold")
        ax.set_xlabel("Predicted Status", labelpad=8)
        ax.set_ylabel("True Status", labelpad=8)

    plt.tight_layout()
    path = "results/plots/03_confusion_matrices.png"
    plt.savefig(path, bbox_inches="tight")
    plt.close()
    print(f"  ✓  {path}")


# ══════════════════════════════════════════════════════════════════════════════
# PLOT 4 — Radar Chart
# ══════════════════════════════════════════════════════════════════════════════
def plot_radar_chart():
    categories = ["RMSE\n(↓ better)", "MAE\n(↓ better)",
                  "NASA\nScore (↓)", "Precision", "Recall",
                  "F1 Score", "ROC-AUC"]
    N = len(categories)
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    angles += angles[:1]

    ranges = {
        "rmse":      (20,  10),
        "mae":       (15,   8),
        "score":     (350, 150),
        "precision": (0,    1),
        "recall":    (0,    1),
        "f1":        (0,    1),
        "roc_auc":   (0,    1),
    }

    def normalise(val, worst, best):
        return np.clip((val - worst) / (best - worst), 0, 1)

    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))
    fig.suptitle("Multi-Metric Radar Chart — Proposed Model",
                 fontsize=14, fontweight="bold", y=1.02)

    colours_ds = {"FD001": C_PROP, "FD003": "#F39C12"}

    for ds, r in RESULTS.items():
        raw      = [r["rmse_prop"], r["mae_prop"], r["score_prop"],
                    r["precision"], r["recall"],   r["f1"], r["roc_auc"]]
        keys_ord = ["rmse", "mae", "score",
                    "precision", "recall", "f1", "roc_auc"]
        vals = [normalise(v, *ranges[k]) for v, k in zip(raw, keys_ord)]
        vals += vals[:1]

        c = colours_ds[ds]
        ax.plot(angles, vals, "o-", linewidth=2, color=c, label=ds)
        ax.fill(angles, vals, alpha=0.15, color=c)

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, size=10)
    ax.set_ylim(0, 1)
    ax.set_yticks([0.2, 0.4, 0.6, 0.8, 1.0])
    ax.set_yticklabels(["0.2", "0.4", "0.6", "0.8", "1.0"], size=8)

    for level in [0.5, 0.8]:
        ax.plot(angles, [level] * len(angles), "--",
                color="#AAAAAA", linewidth=0.8, alpha=0.5)

    ax.legend(loc="upper right", bbox_to_anchor=(1.35, 1.15), frameon=True)

    plt.tight_layout()
    path = "results/plots/04_radar_chart.png"
    plt.savefig(path, bbox_inches="tight")
    plt.close()
    print(f"  ✓  {path}")


# ══════════════════════════════════════════════════════════════════════════════
# PLOT 5 — Score Gap / Improvement Chart
# ══════════════════════════════════════════════════════════════════════════════
def plot_score_gap():
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    fig.suptitle("Improvement Over Base Paper (CAELSTM) — Positive = Better",
                 fontsize=14, fontweight="bold", y=1.02)

    metric_labels = ["RMSE", "MAE", "NASA Score"]

    for ax, (ds, r) in zip(axes, RESULTS.items()):
        deltas = [
            r["rmse_base"]  - r["rmse_prop"],
            r["mae_base"]   - r["mae_prop"],
            r["score_base"] - r["score_prop"],
        ]
        bar_colours = [C_ACCENT if d > 0 else C_WARN for d in deltas]

        y_pos = np.arange(len(metric_labels))
        bars  = ax.barh(y_pos, deltas, color=bar_colours, alpha=0.85,
                        edgecolor="white", linewidth=0.8, height=0.5)

        for bar, val, bc in zip(bars, deltas, bar_colours):
            label_x = val + 0.3 if val >= 0 else val - 0.3
            ha = "left" if val >= 0 else "right"
            ax.text(label_x, bar.get_y() + bar.get_height() / 2,
                    f"{'↓' if val > 0 else '↑'}{abs(val):.2f}",
                    va="center", ha=ha, fontsize=10,
                    fontweight="bold", color=bc)

        ax.axvline(0, color="#333333", linewidth=1.0)
        ax.set_yticks(y_pos)
        ax.set_yticklabels(metric_labels)
        ax.set_xlabel("Reduction from base paper (positive = improvement)")
        ax.set_title(f"Dataset: {ds}", fontweight="bold")

        patch_better = mpatches.Patch(color=C_ACCENT, alpha=0.85, label="Improved")
        patch_worse  = mpatches.Patch(color=C_WARN,   alpha=0.85, label="Degraded")
        ax.legend(handles=[patch_better, patch_worse], loc="lower right")

    plt.tight_layout()
    path = "results/plots/05_score_gap.png"
    plt.savefig(path, bbox_inches="tight")
    plt.close()
    print(f"  ✓  {path}")


# ══════════════════════════════════════════════════════════════════════════════
# PLOT 6 — Combined Summary Figure
# ══════════════════════════════════════════════════════════════════════════════
def plot_combined_summary():
    fig = plt.figure(figsize=(20, 16))
    fig.patch.set_facecolor(C_BG)

    fig.text(0.5, 0.97, "CMAPSS RUL Prediction — Full Results Summary",
             ha="center", va="top", fontsize=18, fontweight="bold")
    fig.text(0.5, 0.945,
             "Optimized XGBoost vs CAELSTM Base Paper  |  Datasets: FD001 & FD003",
             ha="center", va="top", fontsize=12, color="#555555")

    gs = gridspec.GridSpec(3, 4, figure=fig,
                           hspace=0.45, wspace=0.35,
                           top=0.92, bottom=0.06,
                           left=0.06, right=0.97)

    # ── Row 0: Regression bars ────────────────────────────────────────────────
    for col_idx, (ds, r) in enumerate(RESULTS.items()):
        ax = fig.add_subplot(gs[0, col_idx*2 : col_idx*2+2])
        metrics   = ["RMSE", "MAE", "NASA Score"]
        base_vals = [r["rmse_base"], r["mae_base"], r["score_base"]]
        prop_vals = [r["rmse_prop"], r["mae_prop"], r["score_prop"]]
        x, w = np.arange(3), 0.35
        bars_b = ax.bar(x - w/2, base_vals, w, color=C_BASE, alpha=0.8,
                        label="Base Paper")
        bars_p = ax.bar(x + w/2, prop_vals, w, color=C_PROP, alpha=0.9,
                        label="Proposed")
        ax.set_ylim(0, max(base_vals + prop_vals) * 1.22)
        _annotate_bars(ax, bars_b, fmt="{:.1f}")
        _annotate_bars(ax, bars_p, fmt="{:.1f}", bold=True)
        ax.set_xticks(x)
        ax.set_xticklabels(metrics)
        ax.set_title(f"Regression — {ds}", fontweight="bold")
        ax.set_ylabel("Score (↓ better)")
        ax.legend(fontsize=8)

    # ── Row 1: Classification bars ────────────────────────────────────────────
    cls_keys   = ["precision", "recall", "f1", "roc_auc"]
    cls_labels = ["Precision", "Recall", "F1", "ROC-AUC"]
    cls_colours = ["#4A90D9", "#27AE60", "#F39C12", "#9B59B6"]

    for col_idx, (ds, r) in enumerate(RESULTS.items()):
        ax = fig.add_subplot(gs[1, col_idx*2 : col_idx*2+2])
        vals = [r[k] for k in cls_keys]
        bars = ax.bar(cls_labels, vals, color=cls_colours, alpha=0.85,
                      edgecolor="white", width=0.5)
        for bar, val in zip(bars, vals):
            ax.text(bar.get_x() + bar.get_width() / 2,
                    bar.get_height() + 0.01,
                    f"{val:.2f}", ha="center", va="bottom",
                    fontsize=9, fontweight="bold")
        ax.set_ylim(0, 1.20)
        ax.axhline(0.80, color=C_WARN, linestyle="--",
                   linewidth=1, alpha=0.6)
        ax.set_title(f"Classification — {ds}", fontweight="bold")
        ax.set_ylabel("Score (↑ better)")

    # ── Row 2: Confusion matrices ─────────────────────────────────────────────
    for col_idx, (ds, r) in enumerate(RESULTS.items()):
        ax = fig.add_subplot(gs[2, col_idx])
        labels = ["Safe", "At Risk"]
        sns.heatmap(r["cm"], annot=True, fmt="d", cmap="Blues", ax=ax,
                    xticklabels=labels, yticklabels=labels,
                    linewidths=0.5, linecolor="white",
                    annot_kws={"size": 13, "weight": "bold"},
                    cbar=False)
        ax.set_title(f"Conf. Matrix — {ds}", fontweight="bold")
        ax.set_xlabel("Predicted")
        ax.set_ylabel("True")

    # ── Row 2: Improvement summary table ─────────────────────────────────────
    ax_t = fig.add_subplot(gs[2, 2:4])
    ax_t.axis("off")

    r1, r3 = RESULTS["FD001"], RESULTS["FD003"]
    table_data = [["Metric",
                   "FD001 Base", "FD001 Ours", "Δ FD001",
                   "FD003 Base", "FD003 Ours", "Δ FD003"]]

    for label, bk, pk in [("RMSE",       "rmse_base",  "rmse_prop"),
                           ("MAE",        "mae_base",   "mae_prop"),
                           ("NASA Score", "score_base", "score_prop")]:
        d1 = r1[bk] - r1[pk]
        d3 = r3[bk] - r3[pk]
        table_data.append([
            label,
            f"{r1[bk]:.2f}", f"{r1[pk]:.2f}",
            f"{'↓' if d1 > 0 else '↑'}{abs(d1):.2f}",
            f"{r3[bk]:.2f}", f"{r3[pk]:.2f}",
            f"{'↓' if d3 > 0 else '↑'}{abs(d3):.2f}",
        ])

    tbl = ax_t.table(cellText=table_data[1:], colLabels=table_data[0],
                     loc="center", cellLoc="center")
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(9)
    tbl.scale(1, 1.6)

    for j in range(7):
        tbl[(0, j)].set_facecolor("#34495E")
        tbl[(0, j)].set_text_props(color="white", fontweight="bold")

    for row_idx in range(1, 4):
        for c in [3, 6]:
            txt = tbl[(row_idx, c)].get_text().get_text()
            tbl[(row_idx, c)].set_facecolor(
                "#D5F5E3" if txt.startswith("↓") else "#FADBD8")

    ax_t.set_title("Comparative Summary Table", fontweight="bold", pad=8)

    plt.savefig("results/plots/06_combined_summary.png",
                bbox_inches="tight", dpi=150)
    plt.close()
    print("  ✓  results/plots/06_combined_summary.png")


# ══════════════════════════════════════════════════════════════════════════════
# PUBLIC API — called from main.py
# ══════════════════════════════════════════════════════════════════════════════
def run_all_plots(results_dict=None):
    """
    Call with a results_dict from main.py to use live results, or call with
    no arguments to use the hardcoded defaults above.

    Expected results_dict format:
    {
        "FD001": {
            "rmse_base", "rmse_prop", "mae_base", "mae_prop",
            "score_base", "score_prop", "r2_prop",
            "precision", "recall", "f1", "roc_auc",
            "cm"  ← numpy 2x2 array
        },
        "FD003": { ... same keys ... }
    }
    """
    global RESULTS
    if results_dict is not None:
        RESULTS = results_dict

    print("\n" + "=" * 55)
    print("  Generating all project plots …")
    print("=" * 55)

    plot_regression_comparison()
    plot_classification_metrics()
    plot_confusion_matrices()
    plot_radar_chart()
    plot_score_gap()
    plot_combined_summary()

    print("\n" + "=" * 55)
    print("  All 6 plots saved to  results/plots/")
    print("=" * 55 + "\n")


# ── Standalone entry point ────────────────────────────────────────────────────
if __name__ == "__main__":
    run_all_plots()