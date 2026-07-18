import pandas as pd
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.decomposition import PCA

print("Loading dataset...")

df = pd.read_csv("results/audio_features.csv")

X = df.drop(["label","machine_id"], axis=1)
y = df["label"]
machine = df["machine_id"]

# =========================
# Variant 1 - Without Selection
# =========================

print("Creating dataset: Without Selection")

df_wos = X.copy()
df_wos["label"] = y
df_wos["machine_id"] = machine

df_wos.to_csv("results/dataset_without_selection.csv", index=False)

# =========================
# Variant 2 - With Selection
# =========================

print("Creating dataset: With Selection")

selector = SelectKBest(score_func=f_classif, k=20)

X_selected = selector.fit_transform(X, y)

df_ws = pd.DataFrame(X_selected)

df_ws["label"] = y
df_ws["machine_id"] = machine

df_ws.to_csv("results/dataset_with_selection.csv", index=False)

# =========================
# Variant 3 - PCA
# =========================

print("Creating dataset: PCA")

pca = PCA(n_components=20)

X_pca = pca.fit_transform(X)

df_pca = pd.DataFrame(X_pca)

df_pca["label"] = y
df_pca["machine_id"] = machine

df_pca.to_csv("results/dataset_pca.csv", index=False)

# =========================
# Variant 4 - Selection + PCA
# =========================

print("Creating dataset: Selection + PCA")

selector2 = SelectKBest(score_func=f_classif, k=25)

X_sel = selector2.fit_transform(X, y)

pca2 = PCA(n_components=15)

X_spca = pca2.fit_transform(X_sel)

df_spca = pd.DataFrame(X_spca)

df_spca["label"] = y
df_spca["machine_id"] = machine

df_spca.to_csv("results/dataset_selection_pca.csv", index=False)

print("\nAll dataset variants created successfully.")