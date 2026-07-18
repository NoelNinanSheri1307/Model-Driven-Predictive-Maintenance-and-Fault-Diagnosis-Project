import torch
import numpy as np
import cv2
from ipad_anomaly_detection.dataset.dataset_loader import get_frame

class WindowGeneratorIter:
    """
    Generator that produces sliding windows of 16 frames with a stride of 5.
    Window label: 1 if ANY frame in window = anomaly Else 0.
    """
    def __init__(self, sequence_paths, sequence_labels, seq_id, seq_len=16, stride=5, transform=None):
        self.seq_paths = sequence_paths
        self.seq_labels = sequence_labels
        self.seq_id = seq_id
        self.seq_len = seq_len
        self.stride = stride
        self.transform = transform
        self.current_pos = 0

    def generate_windows(self):
        """Yields sliding windows for a single sequence."""
        for start_idx in range(0, len(self.seq_paths) - self.seq_len + 1, self.stride):
            end_idx = start_idx + self.seq_len
            
            # Extract window of frames
            window_paths = self.seq_paths[start_idx:end_idx]
            window_labels = self.seq_labels[start_idx:end_idx]
            
            # Load frames and stack to tensor (16, 3, 256, 256)
            frames = []
            for path in window_paths:
                frames.append(get_frame(path, transform=self.transform))
            
            window_tensor = torch.stack(frames, dim=0)
            
            # Anomaly label: 1 if ANY frame in window is anomaly (1)
            window_label = torch.tensor(1 if np.any(window_labels == 1) else 0, dtype=torch.long)
            
            yield window_tensor, window_label, self.seq_id
