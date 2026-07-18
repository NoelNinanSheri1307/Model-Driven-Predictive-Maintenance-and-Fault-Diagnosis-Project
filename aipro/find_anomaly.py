import numpy as np
import os

root_dir = r"E:\AI_Predictive_Maintenance_Project\datasets\IPAD_dataset"
folders = [f for f in os.listdir(root_dir) if os.path.isdir(os.path.join(root_dir, f))]

for folder in folders:
    labels_root = os.path.join(root_dir, folder, 'test_label')
    if os.path.exists(labels_root):
        for npy_file in os.listdir(labels_root):
            if npy_file.endswith('.npy'):
                labels = np.load(os.path.join(labels_root, npy_file))
                if np.any(labels == 1):
                    # Find seq_id mapping
                    # Folder S12 test_label 001.npy corresponds to S12_01
                    seq_id = os.path.splitext(npy_file)[0]
                    print(f"FOUND ANOMALY: Folder={folder}, Seq={seq_id}")
                    # Stop at first one
                    import sys; sys.exit(0)
