import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest
from sklearn.decomposition import PCA

df = pd.read_csv("results/audio_features.csv")

X = df.drop(["label","machine_id"],axis=1)

model = IsolationForest(contamination=0.1)

pred = model.fit_predict(X)

df["anomaly"] = pred

pca = PCA(n_components=2)

X_pca = pca.fit_transform(X)

plt.figure(figsize=(8,6))

plt.scatter(X_pca[:,0],X_pca[:,1],
            c=df["anomaly"],
            cmap="coolwarm")

plt.title("Anomaly Detection Visualization")

plt.savefig("graphs/anomaly_detection.png")

print("Anomaly detection complete")