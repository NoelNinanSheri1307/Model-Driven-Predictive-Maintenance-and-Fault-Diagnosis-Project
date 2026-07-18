import torch
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve, precision_recall_fscore_support
import os

def final_evaluation(model, dataloader, device, output_dir):
    model.eval()
    all_labels = []
    all_preds = []
    all_probs = []
    
    with torch.no_grad():
        for images, labels in dataloader:
            images = images.to(device)
            outputs = model(images)
            
            all_labels.extend(labels.cpu().numpy())
            all_probs.extend(outputs.cpu().numpy())
            all_preds.extend((outputs > 0.5).cpu().numpy().flatten().astype(int))
            
    all_labels = np.array(all_labels)
    all_probs = np.array(all_probs).flatten()
    all_preds = np.array(all_preds)
    
    # 1. Metrics
    precision, recall, f1, _ = precision_recall_fscore_support(all_labels, all_preds, average='binary')
    auc = roc_auc_score(all_labels, all_probs)
    acc = (all_preds == all_labels).mean()
    
    with open(os.path.join(output_dir, 'metrics.txt'), 'w') as f:
        f.write(f"Final Accuracy: {acc:.4f}\n")
        f.write(f"Final Precision: {precision:.4f}\n")
        f.write(f"Final Recall: {recall:.4f}\n")
        f.write(f"Final F1 Score: {f1:.4f}\n")
        f.write(f"Final ROC-AUC: {auc:.4f}\n")
        f.write("-" * 30 + "\n")
        f.write(classification_report(all_labels, all_preds))
        
    print(f"Final Accuracy: {acc:.4f}")
    print(f"Final F1 Score: {f1:.4f}")
    print(f"Final ROC-AUC: {auc:.4f}")
    
    # 2. Confusion Matrix
    cm = confusion_matrix(all_labels, all_preds)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Normal', 'Anomaly'], yticklabels=['Normal', 'Anomaly'])
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion Matrix')
    plt.savefig(os.path.join(output_dir, 'confusion_matrix.png'))
    plt.close()
    
    # 3. ROC Curve
    fpr, tpr, _ = roc_curve(all_labels, all_probs)
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (area = {auc:.2f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic')
    plt.legend(loc="lower right")
    plt.savefig(os.path.join(output_dir, 'roc_curve.png'))
    plt.close()
    
    # 4. Probability Histogram
    plt.figure(figsize=(8, 6))
    plt.hist(all_probs[all_labels == 0], bins=50, alpha=0.5, label='Normal', color='blue')
    plt.hist(all_probs[all_labels == 1], bins=50, alpha=0.5, label='Anomaly', color='red')
    plt.xlabel('Anomaly Probability')
    plt.ylabel('Count')
    plt.title('Probability Histogram')
    plt.legend()
    plt.savefig(os.path.join(output_dir, 'probability_histogram.png'))
    plt.close()
    
    return acc, f1, auc

def save_sample_predictions(model, dataloader, device, output_dir, num_samples=10):
    model.eval()
    images_to_show = []
    actual_labels = []
    pred_probs = []
    
    with torch.no_grad():
        for images, labels in dataloader:
            images = images.to(device)
            outputs = model(images)
            
            images_to_show.extend(images.cpu())
            actual_labels.extend(labels.cpu().numpy())
            pred_probs.extend(outputs.cpu().numpy().flatten())
            
            if len(images_to_show) >= num_samples:
                break
                
    plt.figure(figsize=(15, 6))
    for i in range(num_samples):
        img = images_to_show[i].permute(1, 2, 0).numpy()
        # Unnormalize for visualization
        img = img * np.array([0.229, 0.224, 0.225]) + np.array([0.485, 0.456, 0.406])
        img = np.clip(img, 0, 1)
        
        plt.subplot(2, 5, i + 1)
        plt.imshow(img)
        title = f"Act: {int(actual_labels[i])}, Pred: {pred_probs[i]:.2f}"
        plt.title(title, color=("green" if (actual_labels[i] == (pred_probs[i] > 0.5)) else "red"))
        plt.axis('off')
        
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'sample_predictions.png'))
    plt.close()
