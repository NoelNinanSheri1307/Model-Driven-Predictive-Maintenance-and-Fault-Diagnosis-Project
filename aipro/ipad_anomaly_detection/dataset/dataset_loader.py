import os
import cv2
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

class IPADLoader(Dataset):
    """
    IPAD Dataset Loader: Loads frames and labels from device folders Rxx/Sxx.
    Training folders only contain normal frames.
    Testing folders contain normal and anomaly frames with .npy labels.
    """
    def __init__(self, root_dir, mode='training', transform=None):
        self.root_dir = root_dir
        self.mode = mode
        self.transform = transform
        self.samples = []
        self._scan_dataset()

    def _scan_dataset(self):
        """Dynamic scan of all folders in root_dir to find training/testing folders."""
        # Find Rxx and Sxx folders (R01, S01, etc.)
        all_root_folders = sorted([f for f in os.listdir(self.root_dir) if os.path.isdir(os.path.join(self.root_dir, f))])
        
        for folder in all_root_folders:
            folder_path = os.path.join(self.root_dir, folder)
            
            # Path to frames (training or testing)
            frames_root = os.path.join(folder_path, self.mode, 'frames')
            if not os.path.exists(frames_root):
                continue
            
            # Sequence folders inside frames (01, 02 or 001, 002, etc.)
            seq_folders = sorted([f for f in os.listdir(frames_root) if os.path.isdir(os.path.join(frames_root, f))])
            
            # Testing labels root
            labels_root = os.path.join(folder_path, 'test_label')
            
            for seq_id in seq_folders:
                seq_path = os.path.join(frames_root, seq_id)
                # Get all images and sort numerically (001.jpg, etc.)
                frame_files = sorted([f for f in os.listdir(seq_path) if f.lower().endswith(('.jpg', '.png', '.jpeg'))], 
                                     key=lambda x: int(os.path.splitext(x)[0]))
                
                frame_paths = [os.path.join(seq_path, f) for f in frame_files]
                if len(frame_paths) == 0: continue
                
                # For testing, load corresponding .npy labels
                labels = None
                if self.mode == 'testing':
                    # Sometimes label files are named with or without leading zeros
                    # We try common variations
                    label_candidates = [f"{seq_id}.npy", f"{int(seq_id):03}.npy", f"{int(seq_id):02}.npy"]
                    for cand in label_candidates:
                        label_file = os.path.join(labels_root, cand)
                        if os.path.exists(label_file):
                            labels = np.load(label_file)
                            break
                    
                    if labels is None:
                        # Fallback to zero labels if missing
                        # print(f"Warning: Label file for {seq_id} not found in {labels_root}")
                        labels = np.zeros(len(frame_paths), dtype=int)
                else:
                    # All training frames are normal (0)
                    labels = np.zeros(len(frame_paths), dtype=int)
                
                self.samples.append({
                    'frame_paths': frame_paths,
                    'labels': labels,
                    'seq_id': f"{folder}_{seq_id}"
                })
        print(f"Dataset Loader: Found {len(self.samples)} {self.mode} sequences.")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        return self.samples[idx]

def get_frame(path, transform=None):
    """Loads a single frame using OpenCV and transforms it to Tensor."""
    img = cv2.imread(path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    if transform:
        img = transform(img)
    else:
        # Default fallback to 256x256 tensor
        img = cv2.resize(img, (256, 256))
        img = torch.from_numpy(img.transpose(2, 0, 1)).float() / 255.0
    return img
