import cv2
import os
import glob

def create_video(frames_dir, output_path, fps=10):
    # Get all images and sort them numerically
    images = sorted(glob.glob(os.path.join(frames_dir, "*.jpg")), 
                    key=lambda x: int(os.path.splitext(os.path.basename(x))[0]))
    
    if not images:
        print(f"No images found in {frames_dir}")
        return

    # Read first image to get dimensions
    frame = cv2.imread(images[0])
    height, width, layers = frame.shape
    size = (width, height)

    # Initialize video writer
    # Using 'mp4v' for .mp4 format
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, size)

    print(f"Stitching {len(images)} frames into {output_path}...")
    for img_path in images:
        img = cv2.imread(img_path)
        out.write(img)
    
    out.release()
    print(f"Success! Video saved at {output_path}")

# Configuration
DATASET_ROOT = r"E:\AI_Predictive_Maintenance_Project\datasets\IPAD_dataset"
OUTPUT_DIR = r"c:\Users\VICTUS\aipro\test_samples"

# 1. Anomalous Sample: R01 Sequence 001 (Folder "01")
create_video(
    os.path.join(DATASET_ROOT, "R01", "testing", "frames", "01"),
    os.path.join(OUTPUT_DIR, "anomaly_sample_R01_01.mp4")
)

# 2. Normal Sample: R01 Sequence 009 (Folder "09")
create_video(
    os.path.join(DATASET_ROOT, "R01", "testing", "frames", "09"),
    os.path.join(OUTPUT_DIR, "normal_sample_R01_09.mp4")
)
