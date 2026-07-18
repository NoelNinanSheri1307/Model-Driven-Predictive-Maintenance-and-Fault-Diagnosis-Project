import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import os
import argparse
from model import get_resnet18_classifier

def predict_frame(model, image_path, device, threshold=0.5):
    # Pre-processing
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Load and transform image
    image = Image.open(image_path).convert('RGB')
    image_tensor = transform(image).unsqueeze(0).to(device)
    
    # Inference
    model.eval()
    with torch.no_grad():
        output = model(image_tensor)
        probability = output.item()
        prediction = 1 if probability > threshold else 0
        
    return prediction, probability

def main():
    parser = argparse.ArgumentParser(description="Single-frame Anomaly Inference")
    parser.add_argument("--image_path", type=str, required=True, help="Path to the image frame")
    parser.add_argument("--model_path", type=str, default="results_r01/frame_classifier.pth", help="Path to saved .pth model")
    parser.add_argument("--threshold", type=float, default=0.5, help="Anomaly threshold")
    args = parser.parse_args()
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Load model architecture and weights
    # Note: main.py saved model.state_dict()
    model = get_resnet18_classifier()
    model.load_state_dict(torch.load(args.model_path, map_location=device))
    model.to(device)
    
    # Predict
    prediction, probability = predict_frame(model, args.image_path, device, args.threshold)
    
    # Output
    label = "ANOMALY" if prediction == 1 else "NORMAL"
    print("-" * 30)
    print(f"Frame: {os.path.basename(args.image_path)}")
    print(f"Result: {label}")
    print(f"Anomaly Probability: {probability:.4f}")
    print("-" * 30)

if __name__ == "__main__":
    main()
