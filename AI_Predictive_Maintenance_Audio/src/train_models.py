import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)

from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier

from sklearn.ensemble import (
    RandomForestClassifier,
    GradientBoostingClassifier,
    ExtraTreesClassifier,
    AdaBoostClassifier
)

from imblearn.over_sampling import SMOTE

import xgboost as xgb
import lightgbm as lgb

import matplotlib.pyplot as plt
import seaborn as sns

# --------------------------------------------------
# DATASETS
# --------------------------------------------------

datasets = {
    "WITHOUT_SELECTION": "results/dataset_without_selection.csv",
    "WITH_SELECTION": "results/dataset_with_selection.csv",
    "WITHOUT_SELECTION_PCA": "results/dataset_pca.csv",
    "WITH_SELECTION_PCA": "results/dataset_selection_pca.csv"
}

machines = ["id_00","id_02","id_04","id_06"]

# --------------------------------------------------
# MODELS
# --------------------------------------------------

models = {

"LogisticRegression": LogisticRegression(max_iter=2000),

"SVM": SVC(probability=True),   # FIXED

"KNN": KNeighborsClassifier(),

"RandomForest": RandomForestClassifier(n_estimators=200),

"GradientBoosting": GradientBoostingClassifier(),

"ExtraTrees": ExtraTreesClassifier(),

"AdaBoost": AdaBoostClassifier(),

"XGBoost": xgb.XGBClassifier(eval_metric='logloss'),

"LightGBM": lgb.LGBMClassifier(),

"MLP_NeuralNet": MLPClassifier(
    hidden_layer_sizes=(128,64),
    max_iter=500
)

}

# --------------------------------------------------
# STORAGE
# --------------------------------------------------

all_results = []

# --------------------------------------------------
# RUN EXPERIMENTS
# --------------------------------------------------

for dataset_name, path in datasets.items():

    df = pd.read_csv(path)

    for machine in machines:

        data = df[df["machine_id"] == machine]

        X = data.drop(["label","machine_id"],axis=1)
        y = data["label"]

        X_train, X_test, y_train, y_test = train_test_split(
            X,y,
            test_size=0.2,
            stratify=y,
            random_state=42
        )

        # -----------------------------
        # SCALE
        # -----------------------------

        scaler = StandardScaler()

        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)

        # -----------------------------
        # SMOTE (TRAIN ONLY)
        # -----------------------------

        smote = SMOTE(random_state=42)

        X_train, y_train = smote.fit_resample(X_train, y_train)

        # -----------------------------
        # TRAIN MODELS
        # -----------------------------

        for model_name, model in models.items():

            model.fit(X_train,y_train)

            train_pred = model.predict(X_train)
            test_pred = model.predict(X_test)

            # probability for AUC
            if hasattr(model,"predict_proba"):
                probs = model.predict_proba(X_test)[:,1]
            else:
                probs = test_pred

            auc = roc_auc_score(y_test, probs)

            train_acc = accuracy_score(y_train,train_pred)
            test_acc = accuracy_score(y_test,test_pred)

            precision = precision_score(y_test,test_pred)
            recall = recall_score(y_test,test_pred)
            f1 = f1_score(y_test,test_pred)

            # -----------------------------
            # FIT STATUS
            # -----------------------------

            diff = train_acc - test_acc

            if diff < 0.02:
                fit_status = "Good Fit"
            elif diff < 0.05:
                fit_status = "Slight Overfit"
            else:
                fit_status = "Overfitting"

            all_results.append([
                machine,
                dataset_name,
                model_name,
                train_acc,
                test_acc,
                precision,
                recall,
                f1,
                auc,
                fit_status
            ])

# --------------------------------------------------
# RESULTS TABLE
# --------------------------------------------------

results = pd.DataFrame(
    all_results,
    columns=[
        "Machine",
        "Dataset",
        "Model",
        "TrainAccuracy",
        "TestAccuracy",
        "Precision",
        "Recall",
        "F1",
        "AUC",
        "FitStatus"
    ]
)

results.to_csv("results/full_experiment_results.csv",index=False)

# --------------------------------------------------
# PRINT CLEAN OUTPUT
# --------------------------------------------------

for machine in results["Machine"].unique():

    print("\n================================================")
    print(" MACHINE:",machine)
    print("================================================")

    machine_data = results[results["Machine"] == machine]

    for dataset in machine_data["Dataset"].unique():

        print("\nDataset:",dataset)

        ds = machine_data[machine_data["Dataset"] == dataset]

        ds = ds.sort_values(by="TestAccuracy",ascending=False)

        print(ds[
            ["Model","TrainAccuracy","TestAccuracy",
             "Precision","Recall","F1","AUC","FitStatus"]
        ].to_string(index=False))

print("\nResults saved to results/full_experiment_results.csv")

# --------------------------------------------------
# CONFUSION MATRIX FOR BEST MODEL
# --------------------------------------------------

best = results.sort_values("TestAccuracy",ascending=False).iloc[0]

best_machine = best["Machine"]
best_dataset = best["Dataset"]
best_model_name = best["Model"]

print("\nBest Model:",best_model_name)

df = pd.read_csv(datasets[best_dataset])

data = df[df["machine_id"] == best_machine]

X = data.drop(["label","machine_id"],axis=1)
y = data["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X,y,
    test_size=0.3,
    stratify=y,
    random_state=42
)

scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

smote = SMOTE(random_state=42)
X_train, y_train = smote.fit_resample(X_train,y_train)

model = models[best_model_name]

model.fit(X_train,y_train)

pred = model.predict(X_test)

cm = confusion_matrix(y_test,pred)

plt.figure(figsize=(5,4))

sns.heatmap(cm,annot=True,fmt="d",cmap="Blues")

plt.title("Confusion Matrix - "+best_model_name)

plt.xlabel("Predicted")
plt.ylabel("Actual")

plt.savefig("graphs/confusion_matrix.png")

plt.close()

print("Confusion matrix saved to graphs/confusion_matrix.png")