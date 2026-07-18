import os
import numpy as np

root = r'E:\AI_Predictive_Maintenance_Project\datasets\IPAD_dataset'
found = []

for folder in ['S05', 'S06']:
    label_dir = os.path.join(root, folder, 'test_label')
    if os.path.exists(label_dir):
        for f in sorted(os.listdir(label_dir)):
            if f.endswith('.npy'):
                lbl = np.load(os.path.join(label_dir, f))
                if np.sum(lbl) > 100: # Significant duration
                    found.append((folder, f.split('.')[0], np.sum(lbl)))

# Sort by duration to get the most "obvious" one
found.sort(key=lambda x: x[2], reverse=True)
for item in found[:3]:
    print(f"Candidate: {item[0]} Seq: {item[1]} Anomaly Frames: {item[2]}")
