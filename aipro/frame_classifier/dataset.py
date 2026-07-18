import os
import glob
import numpy as np
import torch
from torch.utils.data import Dataset
from PIL import Image
from torchvision import transforms

class FrameDataset(Dataset):
    def __init__(self, root_dir, split='train', transform=None, balanced=True):
        self.root_dir = root_dir
        self.transform = transform
        self.samples = []
        
        # Load R01 training frames (always normal = 0)
        train_frames_root = os.path.join(root_dir, 'training', 'frames')
        for seq_folder in os.listdir(train_frames_root):
            seq_path = os.path.join(train_frames_root, seq_folder)
            if not os.path.isdir(seq_path): continue
            for frame_file in os.listdir(seq_path):
                if frame_file.endswith('.jpg'):
                    self.samples.append((os.path.join(seq_path, frame_file), 0))
        
        # Load R01 testing frames (labels from .npy)
        test_frames_root = os.path.join(root_dir, 'testing', 'frames')
        test_labels_root = os.path.join(root_dir, 'test_label')
        
        for npy_file in os.listdir(test_labels_root):
            if not npy_file.endswith('.npy'): continue
            seq_id = os.path.splitext(npy_file)[0]
            # Mapping: 001.npy -> testing/frames/01 or testing/frames/001?
            # User output for dir testing/frames showed '01', '02', ...
            # 001.npy should map to '01'.
            seq_folder = seq_id[-2:] if len(seq_id) >= 2 else seq_id.zfill(2)
            seq_path = os.path.join(test_frames_root, seq_folder)
            
            if not os.path.exists(seq_path):
                # Try 1-based index but padded to 3 if that's what test_label uses
                # Actually, seq_folder list showed '01', '02'...
                continue
                
            labels = np.load(os.path.join(test_labels_root, npy_file))
            # Frames are 000.jpg, 001.jpg...
            frame_files = sorted([f for f in os.listdir(seq_path) if f.endswith('.jpg')])
            
            for i, frame_file in enumerate(frame_files):
                if i < len(labels):
                    label = int(labels[i])
                    self.samples.append((os.path.join(seq_path, frame_file), label))

        # Balanced sampling if requested
        if balanced:
            normals = [s for s in self.samples if s[1] == 0]
            anomalies = [s for s in self.samples if s[1] == 1]
            
            num_anomalies = len(anomalies)
            if num_anomalies > 0:
                # Undersample normals
                np.random.seed(42)
                indices = np.random.choice(len(normals), num_anomalies, replace=False)
                sampled_normals = [normals[i] for i in indices]
                self.samples = sampled_normals + anomalies
            
        print(f"Dataset loaded: {len(self.samples)} samples (Normals: {len([s for s in self.samples if s[1]==0])}, Anomalies: {len([s for s in self.samples if s[1]==1])})")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        image = Image.open(img_path).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
        
        return image, torch.tensor(label, dtype=torch.float32)

def get_transforms():
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
