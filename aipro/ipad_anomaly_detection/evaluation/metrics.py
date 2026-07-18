from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
import numpy as np

def compute_metrics(y_true, y_pred, y_probs=None):
    """
    Computes common classification metrics.
    """
    metrics = {
        'accuracy': accuracy_score(y_true, y_pred),
        'precision': precision_score(y_true, y_pred, zero_division=0),
        'recall': recall_score(y_true, y_pred, zero_division=0),
        'f1': f1_score(y_true, y_pred, zero_division=0)
    }
    
    if y_probs is not None:
        try:
            metrics['roc_auc'] = roc_auc_score(y_true, y_probs)
        except ValueError:
            metrics['roc_auc'] = 0.0
            
    metrics['confusion_matrix'] = confusion_matrix(y_true, y_pred)
    
    return metrics

def print_metrics(metrics):
    """Prints metrics to console."""
    print("\n--- Evaluation Metrics ---")
    print(f"Accuracy:  {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall:    {metrics['recall']:.4f}")
    print(f"F1 Score:  {metrics['f1']:.4f}")
    if 'roc_auc' in metrics:
        print(f"ROC-AUC:   {metrics['roc_auc']:.4f}")
    print("Confusion Matrix:")
    print(metrics['confusion_matrix'])
    print("--------------------------\n")
