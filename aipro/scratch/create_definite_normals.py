import cv2
import os
import glob
import numpy as np

def create_integrity_video(frames_dir, output_path, fps=10):
    images = sorted(glob.glob(os.path.join(frames_dir, "*.jpg")), 
                    key=lambda x: int(os.path.splitext(os.path.basename(x))[0]))
    
    if not images: return False
    frame = cv2.imread(images[0])
    size = (frame.shape[1], frame.shape[0])
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'MJPG'), fps, size)

    print(f"Stitching {len(images)} frames for {os.path.basename(output_path)}...")
    for img_path in images:
        out.write(cv2.imread(img_path))
    out.release()
    print(f"Created: {output_path}")
    return True

DATASET_ROOT = r"E:\AI_Predictive_Maintenance_Project\datasets\IPAD_dataset"
OUTPUT_DIR = r"c:\Users\VICTUS\aipro\test_samples"

# We want 3 specific complex machines
machines = ['S05', 'S07', 'S09']

for m in machines:
    label_dir = os.path.join(DATASET_ROOT, m, 'test_label')
    found = False
    # Look for a sequence with NO anomaly (sum == 0)
    for f in sorted(os.listdir(label_dir)):
        if f.endswith('.npy'):
            lbl = np.load(os.path.join(label_dir, f))
            if np.sum(lbl) == 0:
                seq_id = f.split('.')[0]
                # Check padded folder names
                for pad in [f"{int(seq_id):02}", f"{int(seq_id):03}"]:
                    frames_path = os.path.join(DATASET_ROOT, m, 'testing', 'frames', pad)
                    if os.path.exists(frames_path):
                        if create_integrity_video(frames_path, os.path.join(OUTPUT_DIR, f"DEFINITE_NORMAL_{m}.avi")):
                            found = True
                            break
        if found: break
print("--- BATCH COMPLETE ---")
