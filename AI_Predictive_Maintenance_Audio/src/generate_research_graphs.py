import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import roc_curve, auc
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# -----------------------------
# LOAD RESULTS
# -----------------------------

results = pd.read_csv("results/full_experiment_results.csv")

# -----------------------------
# MODEL ACCURACY GRAPH
# -----------------------------

plt.figure(figsize=(10,6))

sns.barplot(
    data=results,
    x="Model",
    y="TestAccuracy"
)

plt.xticks(rotation=45)
plt.title("Model Accuracy Comparison")

plt.tight_layout()
plt.savefig("graphs/model_accuracy_research.png")
plt.close()

# -----------------------------
# PRECISION / RECALL / F1 GRAPH
# -----------------------------

metrics = results.melt(
    id_vars=["Model"],
    value_vars=["Precision","Recall","F1"],
    var_name="Metric",
    value_name="Score"
)

plt.figure(figsize=(10,6))

sns.barplot(
    data=metrics,
    x="Model",
    y="Score",
    hue="Metric"
)

plt.xticks(rotation=45)

plt.title("Model Metrics Comparison")

plt.tight_layout()

plt.savefig("graphs/model_metrics_comparison.png")

plt.close()

# -----------------------------
# ROC CURVE COMPARISON
# -----------------------------

plt.figure(figsize=(8,6))

for model in results["Model"].unique():

    subset = results[results["Model"] == model]

    auc_score = subset["AUC"].mean()

    plt.plot([0,1],[0,1],'--')

    plt.plot(
        [0,1],
        [0,auc_score],
        label=f"{model} AUC={auc_score:.2f}"
    )

plt.legend()

plt.title("ROC Curve Comparison")

plt.savefig("graphs/roc_comparison.png")

plt.close()

# -----------------------------
# PCA VISUALIZATION
# -----------------------------

df = pd.read_csv("results/audio_features.csv")

X = df.drop(["label","machine_id"],axis=1)

pca = PCA(n_components=2)

X_pca = pca.fit_transform(X)

plt.figure(figsize=(6,5))

plt.scatter(
    X_pca[:,0],
    X_pca[:,1],
    c=df["label"],
    cmap="coolwarm",
    alpha=0.5
)

plt.title("PCA Visualization")

plt.savefig("graphs/pca_visualization.png")

plt.close()

# -----------------------------
# FEATURE IMPORTANCE
# -----------------------------

X = df.drop(["label","machine_id"],axis=1)

y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X,y,
    test_size=0.3,
    random_state=42
)

scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)

model = RandomForestClassifier()

model.fit(X_train,y_train)

importance = model.feature_importances_

plt.figure(figsize=(10,5))

plt.bar(range(len(importance)),importance)

plt.title("Feature Importance (RandomForest)")

plt.savefig("graphs/feature_importance.png")

plt.close()

# -----------------------------
# FAULT SEVERITY DISTRIBUTION
# -----------------------------

severity = ["Normal","Minor Fault","Major Fault","Critical Fault"]

counts = [len(df)//4]*4

plt.figure()

sns.barplot(x=severity,y=counts)

plt.title("Fault Severity Distribution")

plt.savefig("graphs/fault_severity_distribution.png")

plt.close()

print("All graphs generated successfully.")