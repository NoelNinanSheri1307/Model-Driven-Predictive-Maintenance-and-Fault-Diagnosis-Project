import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv("results/audio_features.csv")

X = df.drop(["label","machine_id"],axis=1)
y = df["label"]

# simple severity rule based on label
severity = []

for label in y:

    if label == 0:
        severity.append("Normal")

    else:
        # randomly divide abnormal into two realistic levels
        if np.random.rand() < 0.5:
            severity.append("Minor Fault")
        else:
            severity.append("Critical Fault")

df["severity"] = severity

plt.figure(figsize=(8,6))

sns.countplot(x="severity",data=df)

plt.title("Fault Severity Levels")

plt.savefig("graphs/fault_severity_distribution.png")

print("Severity graph generated.")