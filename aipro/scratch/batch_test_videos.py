import cv2
import os
import glob

def create_integrity_video(frames_dir, output_path, fps=10):
    images = sorted(glob.glob(os.path.join(frames_dir, "*.jpg")), 
                    key=lambda x: int(os.path.splitext(os.path.basename(x))[0]))
    
    if not images:
        # Try finding double digit folders
        return

    frame = cv2.imread(images[0])
    size = (frame.shape[1], frame.shape[0])
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'MJPG'), fps, size)

    print(f"Stitching {len(images)} frames for {os.path.basename(output_path)}...")
    for img_path in images:
        img = cv2.imread(img_path)
        out.write(img)
    
    out.release()
    print(f"Success: {output_path}")

DATASET_ROOT = r"E:\AI_Predictive_Maintenance_Project\datasets\IPAD_dataset"
OUTPUT_DIR = r"c:\Users\VICTUS\aipro\test_samples"

# 1. R02_03 (Lifter)
create_integrity_video(os.path.join(DATASET_ROOT, "R02", "testing", "frames", "03"), os.path.join(OUTPUT_DIR, "INTEGRITY_ANOMALY_R02_03.avi"))

# 2. R03_01 (Forklift)
create_integrity_video(os.path.join(DATASET_ROOT, "R03", "testing", "frames", "01"), os.path.join(OUTPUT_DIR, "INTEGRITY_ANOMALY_R03_01.avi"))

# 3. S11_06 (Cutter)
create_integrity_video(os.path.join(DATASET_ROOT, "S11", "testing", "frames", "06"), os.path.join(OUTPUT_DIR, "INTEGRITY_ANOMALY_S11_06.avi"))
