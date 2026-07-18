import numpy as np
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score,
    precision_score, recall_score, f1_score,
    confusion_matrix, classification_report,
    roc_auc_score
)

def nasa_score(y_true, y_pred):
    score = 0
    for i in range(len(y_true)):
        error = y_pred[i] - y_true[i]
        if error < 0:
            score += np.exp(-error / 13.0) - 1
        else:
            score += np.exp(error / 10.0) - 1
    return score

def evaluate(model, X_test, y_test, threshold=40):
    y_pred = model.predict(X_test, verbose=0).flatten()

    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    score = nasa_score(y_test, y_pred)

    y_true_cls = (y_test <= threshold).astype(int)
    y_pred_cls = (y_pred <= threshold).astype(int)

    precision = precision_score(y_true_cls, y_pred_cls, zero_division=0)
    recall = recall_score(y_true_cls, y_pred_cls, zero_division=0)
    f1 = f1_score(y_true_cls, y_pred_cls, zero_division=0)

    y_fail_prob = 1.0 / (y_pred + 1e-6)
    try:
        roc_auc = roc_auc_score(y_true_cls, y_fail_prob)
    except:
        roc_auc = 0.5

    cm = confusion_matrix(y_true_cls, y_pred_cls)
    report = classification_report(y_true_cls, y_pred_cls, zero_division=0)

    return {
        "rmse": rmse, "mae": mae, "r2": r2, "score": score,
        "precision": precision, "recall": recall, "f1": f1,
        "roc_auc": roc_auc, "confusion_matrix": cm,
        "classification_report": report
    }