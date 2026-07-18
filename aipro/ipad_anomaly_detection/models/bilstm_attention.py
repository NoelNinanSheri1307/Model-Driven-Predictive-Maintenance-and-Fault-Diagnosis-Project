import torch
import torch.nn as nn
import torch.nn.functional as F

class AttentionLayer(nn.Module):
    """
    Temporal Attention Layer to focus on important frames in a sequence.
    """
    def __init__(self, feature_dim):
        super(AttentionLayer, self).__init__()
        self.attn = nn.Linear(feature_dim, 1)

    def forward(self, x):
        # x shape: (batch, seq_len, feature_dim)
        scores = self.attn(x) # (batch, seq_len, 1)
        weights = F.softmax(scores, dim=1)
        
        # Weighted sum: (batch, feature_dim)
        context = torch.sum(x * weights, dim=1)
        return context, weights

class BiLSTMAttention(nn.Module):
    """
    Temporal Learning Pipeline:
    BiLSTM (512 input, 256 hidden, 2 layers) -> Attention -> Feature Embedding
    """
    def __init__(self, input_size=512, hidden_size=256, num_layers=2):
        super(BiLSTMAttention, self).__init__()
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            bidirectional=True,
            batch_first=True
        )
        
        # BiLSTM output dimention: hidden_size * 2
        self.attention = AttentionLayer(hidden_size * 2)
        
        # Final projection to 512 as requested
        self.fc = nn.Linear(hidden_size * 2, 512)

    def forward(self, x):
        # x shape: (batch, seq_len, 512)
        lstm_out, _ = self.lstm(x) # (batch, seq_len, 512)
        
        # Apply attention over temporal dimension
        context_vector, attn_weights = self.attention(lstm_out)
        
        # Final feature embedding
        embedding = self.fc(context_vector)
        return embedding, attn_weights

def get_bilstm_attention():
    return BiLSTMAttention()
