import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os

def plot_training_curves(train_losses, train_accs, save_path=None):
    """Plots training loss and accuracy."""
    fig, ax1 = plt.subplots(figsize=(10, 6))

    color = 'tab:red'
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Loss', color=color)
    ax1.plot(train_losses, color=color, label='Loss')
    ax1.tick_params(axis='y', labelcolor=color)

    ax2 = ax1.twinx()
    color = 'tab:blue'
    ax2.set_ylabel('Accuracy', color=color)
    ax2.plot(train_accs, color=color, label='Accuracy')
    ax2.tick_params(axis='y', labelcolor=color)

    plt.title('Training Loss and Accuracy')
    fig.tight_layout()
    
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path)
    plt.close()

def plot_confusion_matrix(cm, save_path=None):
    """Plots the confusion matrix."""
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False)
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion Matrix')
    
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path)
    plt.close()

def plot_anomaly_scores(frame_scores, frame_labels, save_path=None):
    """Plots frame-level anomaly scores over time."""
    plt.figure(figsize=(15, 5))
    plt.plot(frame_scores, label='Anomaly Score', color='blue')
    plt.fill_between(range(len(frame_labels)), 0, 1, where=frame_labels == 1, 
                     color='red', alpha=0.3, label='Ground Truth Anomaly')
    plt.xlabel('Frame')
    plt.ylabel('Score')
    plt.title('Frame Anomaly Score Timeline')
    plt.legend()
    
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path)
    plt.close()

def save_detected_anomalies(frames, scores, labels, output_dir, count=5):
    """Saves example frames where anomalies were detected."""
    os.makedirs(output_dir, exist_ok=True)
    
    # Find indices where model correctly detected anomaly
    anomaly_indices = np.where((scores > 0.5) & (labels == 1))[0]
    
    if len(anomaly_indices) == 0:
        # If no correct detections, just take highest scores
        anomaly_indices = np.argsort(scores)[-count:]
    else:
        # Sample from detections
        np.random.shuffle(anomaly_indices)
        anomaly_indices = anomaly_indices[:count]
        
    for i, idx in enumerate(anomaly_indices):
        frame = frames[idx]
        plt.imshow(frame)
        plt.title(f"Anomaly Detection {i+1}\nScore: {scores[idx]:.2f} Label: {labels[idx]}")
        plt.axis('off')
        plt.savefig(os.path.join(output_dir, f"detected_anomaly_{i+1}.png"))
        plt.close()
