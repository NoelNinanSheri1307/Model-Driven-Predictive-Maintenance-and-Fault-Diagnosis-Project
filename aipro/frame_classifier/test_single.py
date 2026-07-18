import os
import torch
import numpy as np
from PIL import Image
from torchvision import transforms
import argparse
from model import get_resnet18_classifier

def get_label(image_path, root_dir):
    """
    Tries to find the ground truth label for a given frame.
    - If in training/frames -> Label 0 (Normal)
    - If in testing/frames -> Find matching .npy in test_label
    """
    abs_path = os.path.abspath(image_path)
    
    # 1. Check if it's in Training (known to be all normal)
    if 'training' in abs_path.lower():
        return 0, "TrainingSet (All Normal)"

    # 2. Check if it's in Testing
    if 'testing' in abs_path.lower() or 'test_label' in abs_path.lower():
        # Path format usually: .../testing/frames/01/045.jpg
        parts = abs_path.replace('\\', '/').split('/')
        try:
            # 2.a Find sequence ID (directory name like '01', '02'...)
            seq_folder = parts[-2]
            seq_id_int = int(seq_folder)
            
            # 2.b Find frame index (image name like '045.jpg')
            frame_file = parts[-1]
            frame_idx = int(frame_file.split('.')[0])
            
            # 2.c Load NPY file (C:\...\R01\test_label\001.npy)
            # Find root dir if not provided
            if not root_dir:
                # Find the index of 'R01' or similar in parts
                # Or assume it's parent of 'testing'
                if 'testing' in parts:
                    idx = parts.index('testing')
                    root_dir = "/".join(parts[:idx])
            
            npy_path = os.path.join(root_dir, 'test_label', f"{seq_id_int:03d}.npy")
            
            if os.path.exists(npy_path):
                labels = np.load(npy_path)
                if frame_idx < len(labels):
                    return int(labels[frame_idx]), f"TestLabel ({os.path.basename(npy_path)}: {frame_idx})"
                else:
                    return None, f"Frame index {frame_idx} out of range in {npy_path}"
            else:
                return None, f"Label file not found: {npy_path}"
                
        except Exception as e:
            return None, f"Could not parse path for label: {e}"
            
    return None, "Not in R01 dataset structure (Automatic label lookup unavailable)"

def main():
    parser = argparse.ArgumentParser(description="Test Single Frame with Ground Truth Lookup")
    parser.add_argument("--image_path", type=str, required=True, help="Path to the frame (.jpg)")
    parser.add_argument("--model_path", type=str, default="frame_classifier/results_r01/frame_classifier.pth", help="Path to model weights")
    parser.add_argument("--data_root", type=str, default=None, help="Root directory (e.g. .../R01 or .../R02). If None, we infer from image_path.")
    parser.add_argument("--threshold", type=float, default=0.5, help="Anomaly threshold")
    args = parser.parse_args()

    # Automatically infer data_root if not provided
    if args.data_root is None:
        abs_img = os.path.abspath(args.image_path).replace('\\', '/')
        # Find where 'testing' or 'training' occurs in path
        if 'testing' in abs_img:
            args.data_root = abs_img.split('/testing')[0]
        elif 'training' in abs_img:
            args.data_root = abs_img.split('/training')[0]
        else:
            print("Warning: Could not infer data_root. Provide it with --data_root if label lookup fails.")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # 1. Load Model
    # Try a few locations for convenience
    model_locations = [
        args.model_path,
        os.path.join(os.getcwd(), args.model_path),
        os.path.join(os.path.dirname(__file__), "results_r01/frame_classifier.pth")
    ]
    
    found_model = None
    for loc in model_locations:
        if os.path.exists(loc):
            found_model = loc
            break
            
    if not found_model:
        print(f"Error: Model not found. Checked: {model_locations}")
        return
    
    model = get_resnet18_classifier()
    model.load_state_dict(torch.load(found_model, map_location=device))
    model.to(device)
    model.eval()

    # 2. Preprocess
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    try:
        image = Image.open(args.image_path).convert('RGB')
        image_tensor = transform(image).unsqueeze(0).to(device)
    except Exception as e:
        print(f"Error loading image: {e}")
        return

    # 3. Inference
    with torch.no_grad():
        output = model(image_tensor)
        probability = output.item()
        prediction = 1 if probability > args.threshold else 0

    # 4. Actual Label Lookup
    actual_label, source = get_label(args.image_path, args.data_root)

    # 5. Show Results
    print("\n" + "="*45)
    print("      FRAME CLASSIFIER INFERENCE      ")
    print("="*45)
    print(f"Frame Path:  {os.path.basename(args.image_path)}")
    print(f"Location:    {args.image_path}")
    print("-" * 45)
    
    # Predicted
    pred_text = "ANOMALY" if prediction == 1 else "NORMAL"
    print(f"Predicted:   {pred_text}")
    print(f"Probability: {probability:.4%}")
    print("-" * 45)
    
    # Actual
    if actual_label is not None:
        actual_text = "ANOMALY" if actual_label == 1 else "NORMAL"
        status = "CORRECT" if actual_label == prediction else "INCORRECT"
        color = "√" if status == "CORRECT" else "X"
        
        print(f"Actual:      {actual_text} ({source})")
        print(f"Result:      [{status}] {color}")
    else:
        print(f"Actual:      Unknown ({source})")
    print("=" * 45 + "\n")

if __name__ == "__main__":
    main()
