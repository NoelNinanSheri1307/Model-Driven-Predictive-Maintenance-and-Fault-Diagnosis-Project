import numpy as np

def create_sequences(data, seq_length=30):
    X, y = [], []
    for engine_id in data["engine_id"].unique():
        engine_data = data[data["engine_id"] == engine_id]

        values = engine_data.drop(["engine_id", "cycle", "RUL"], axis=1).values
        labels = engine_data["RUL"].values

        for i in range(len(values) - seq_length):
            X.append(values[i:i+seq_length])
            y.append(labels[i+seq_length])

    return np.array(X), np.array(y)

def create_test_sequences(data, seq_length=30):
    """OFFICIAL BENCHMARK STANDARD: Extracts ONLY the final window"""
    X, y = [], []
    for engine_id in data["engine_id"].unique():
        engine_data = data[data["engine_id"] == engine_id]
        
        if len(engine_data) >= seq_length:
            values = engine_data.drop(["engine_id", "cycle", "RUL"], axis=1).values
            labels = engine_data["RUL"].values

            X.append(values[-seq_length:])
            y.append(labels[-1])

    return np.array(X), np.array(y)