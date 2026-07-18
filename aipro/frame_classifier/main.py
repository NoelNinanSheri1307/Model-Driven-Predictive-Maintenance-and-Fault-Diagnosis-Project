import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
import argparse
from dataset import FrameDataset, get_transforms
from model import get_resnet18_classifier
from trainer import train_one_epoch, evaluate, plot_curves
from evaluator import final_evaluation, save_sample_predictions
import time

def main():
    parser = argparse.ArgumentParser(description="Frame-level Anomaly Classification (R01)")
    parser.add_argument("--epochs", type=int, default=10, help="Max number of epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    parser.add_argument("--data_root", type=str, default=r"E:\AI_Predictive_Maintenance_Project\datasets\IPAD_dataset\R01", help="Dataset root directory")
    parser.add_argument("--output_dir", type=str, default="results", help="Output results directory")
    args = parser.parse_args()

    # Setup output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Device setup
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # 1. Dataset Loading
    # Use training and testing folders, but we'll split them into our own train/val sets
    full_dataset = FrameDataset(args.data_root, transform=get_transforms(), balanced=True)
    
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])
    
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, pin_memory=True)
    
    # 2. Model, Loss, Optimizer
    model = get_resnet18_classifier().to(device)
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=args.lr)
    
    # 3. Training Loop
    train_losses = []
    train_accs = []
    val_losses = []
    val_accs = []
    
    print("Starting training...")
    start_time = time.time()
    
    for epoch in range(args.epochs):
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = evaluate(model, val_loader, criterion, device)
        
        train_losses.append(train_loss)
        train_accs.append(train_acc)
        val_losses.append(val_loss)
        val_accs.append(val_acc)
        
        print(f"Epoch {epoch+1}/{args.epochs} - Loss: {train_loss:.4f}, Acc: {train_acc:.4f} | Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}")
        
    training_duration = time.time() - start_time
    print(f"Training completed in {training_duration/60:.2f} minutes.")
    
    # Save training curves
    plot_curves(train_losses, train_accs, val_losses, val_accs, args.output_dir)
    
    # 4. Final Evaluation
    print("Running final evaluation...")
    final_evaluation(model, val_loader, device, args.output_dir)
    save_sample_predictions(model, val_loader, device, args.output_dir)
    
    # Save model checkpoint
    torch.save(model.state_dict(), os.path.join(args.output_dir, "frame_classifier.pth"))
    print(f"Results saved in {args.output_dir}/")

if __name__ == "__main__":
    main()
