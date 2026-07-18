import cv2
import os
import glob

def create_integrity_video(frames_dir, output_path, fps=10):
    images = sorted(glob.glob(os.path.join(frames_dir, "*.jpg")), 
                    key=lambda x: int(os.path.splitext(os.path.basename(x))[0]))
    
    if not images:
        print(f"Empty: {frames_dir}")
        return

    frame = cv2.imread(images[0])
    size = (frame.shape[1], frame.shape[0])

    # Motion JPEG preserves frame-by-frame integrity
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'MJPG'), fps, size)

    print(f"Stitching {len(images)} frames with MJPG integrity...")
    for img_path in images:
        img = cv2.imread(img_path)
        out.write(img)
    
    out.release()
    print(f"Success: {output_path}")

DATASET_ROOT = r"E:\AI_Predictive_Maintenance_Project\datasets\IPAD_dataset"
OUTPUT_DIR = r"c:\Users\VICTUS\aipro\test_samples"

# High-Integrity Demo Sample
create_integrity_video(
    os.path.join(DATASET_ROOT, "S06", "testing", "frames", "07"),
    os.path.join(OUTPUT_DIR, "INTEGRITY_ANOMALY_S06_07.avi")
)

# High-Integrity R01 Sample (Previous one)
create_integrity_video(
    os.path.join(DATASET_ROOT, "R01", "testing", "frames", "01"),
    os.path.join(OUTPUT_DIR, "INTEGRITY_ANOMALY_R01_01.avi")
)
