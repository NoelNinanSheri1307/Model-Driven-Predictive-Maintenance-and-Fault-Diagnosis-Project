import cv2
import os
import glob
import numpy as np

def create_integrity_video(frames_dir, output_path, fps=10):
    images = sorted(glob.glob(os.path.join(frames_dir, "*.jpg")), 
                    key=lambda x: int(os.path.splitext(os.path.basename(x))[0]))
    
    if not images: return
    frame = cv2.imread(images[0])
    size = (frame.shape[1], frame.shape[0])
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'MJPG'), fps, size)

    print(f"Stitching {len(images)} frames for {os.path.basename(output_path)}...")
    for img_path in images:
        out.write(cv2.imread(img_path))
    out.release()
    print(f"Created: {output_path}")

DATASET_ROOT = r"E:\AI_Predictive_Maintenance_Project\datasets\IPAD_dataset"
OUTPUT_DIR = r"c:\Users\VICTUS\aipro\test_samples"

categories = ['R01', 'R02', 'R03', 'S06', 'S11']

print("--- GENERATING NORMAL REFERENCE SUITE ---")
for cat in categories:
    label_dir = os.path.join(DATASET_ROOT, cat, 'test_label')
    found = False
    for f in sorted(os.listdir(label_dir)):
        if f.endswith('.npy'):
            lbl = np.load(os.path.join(label_dir, f))
            if not np.any(lbl == 1):
                # Map 001.npy to folder 01 or 001
                seq_id_num = int(f.split('.')[0])
                # Check both common folder naming styles
                cand1 = f"{seq_id_num:02}"
                cand2 = f"{seq_id_num:03}"
                
                for cand in [cand1, cand2]:
                    frames_path = os.path.join(DATASET_ROOT, cat, 'testing', 'frames', cand)
                    if os.path.exists(frames_path):
                        output_name = f"NORMAL_REFERENCE_{cat}.avi"
                        create_integrity_video(frames_path, os.path.join(OUTPUT_DIR, output_name))
                        found = True
                        break
        if found: break
print("--- ALL REFERENCE VIDEOS READY ---")
