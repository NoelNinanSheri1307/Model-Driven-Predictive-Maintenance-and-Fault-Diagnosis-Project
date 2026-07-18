import os
import numpy as np

root = r'E:\AI_Predictive_Maintenance_Project\datasets\IPAD_dataset'
found = []

for folder in ['S07', 'S08']:
    label_dir = os.path.join(root, folder, 'test_label')
    if os.path.exists(label_dir):
        for f in sorted(os.listdir(label_dir)):
            if f.endswith('.npy'):
                lbl = np.load(os.path.join(label_dir, f))
                if np.sum(lbl) > 100:
                    found.append((folder, f.split('.')[0], np.sum(lbl)))

found.sort(key=lambda x: x[2], reverse=True)
for item in found[:3]:
    print(f"High-Impact Candidate: {item[0]} Seq: {item[1]} Anomaly Frames: {item[2]}")
