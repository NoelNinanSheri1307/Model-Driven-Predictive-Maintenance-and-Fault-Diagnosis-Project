import torch
import torch.nn as nn
from torchvision import models

def get_resnet18_classifier():
    # Load pretrained ResNet18
    model = models.resnet18(pretrained=True)
    
    # Modify final layer for binary classification
    # Input: Image -> ResNet18 -> Fully Connected Layer -> Sigmoid
    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_ftrs, 1),
        nn.Sigmoid()
    )
    
    return model
