import torch
import torch.nn as nn

class LightweightEncoder(nn.Module):
    """
    Lightweight CNN Encoder based on the requested pipeline:
    Conv2D -> BatchNorm -> ReLU -> MaxPool -> Conv2D -> BatchNorm -> ReLU -> GlobalAveragePooling
    Output feature size: 512
    """
    def __init__(self, output_dim=512):
        super(LightweightEncoder, self).__init__()
        
        self.encoder = nn.Sequential(
            # Block 1: 256x256 -> 128x128
            nn.Conv2d(3, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Block 2: 128x128 -> 64x64
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Block 3: 64x64 -> 32x32
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Block 4: 32x32 -> 16x16
            nn.Conv2d(256, 512, kernel_size=3, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Global Average Pooling
            nn.AdaptiveAvgPool2d((1, 1))
        )
        
    def forward(self, x):
        # x shape: (batch_size, channels, 256, 256)
        features = self.encoder(x)
        # features shape: (batch_size, 512, 1, 1)
        features = torch.flatten(features, 1)
        # Final shape: (batch_size, 512)
        return features

def get_cnn_encoder():
    return LightweightEncoder()
