import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load model results
df = pd.read_csv("results/model_results.csv")

# =============================
# METRICS COMPARISON GRAPH
# =============================

metrics = ["Accuracy","Precision","Recall","F1 Score","ROC AUC"]

df_melt = df.melt(id_vars="Model", value_vars=metrics,
                  var_name="Metric", value_name="Score")

plt.figure(figsize=(12,6))

sns.barplot(data=df_melt, x="Model", y="Score", hue="Metric")

plt.title("Model Performance Comparison")

plt.xticks(rotation=30)

plt.savefig("graphs/model_metrics_comparison.png")

plt.show()