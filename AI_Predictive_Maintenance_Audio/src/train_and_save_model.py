import os
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest

def main():
    print("Loading extracted features...")
    csv_path = "../results/audio_features.csv"
    if not os.path.exists(csv_path):
        csv_path = "results/audio_features.csv" # try root if run from there
        
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found. Please extract features first.")
        return

    df = pd.read_csv(csv_path)

    print("Dropping labels and identifiers for unsupervised training...")
    X = df.drop(["label", "machine_id"], axis=1)

    print("Training Isolation Forest... (contamination=0.1)")
    model = IsolationForest(contamination=0.1, random_state=42)
    model.fit(X)

    output_dir = "../models"
    if not os.path.exists(output_dir):
        output_dir = "models"
        
    os.makedirs(output_dir, exist_ok=True)
    
    model_path = os.path.join(output_dir, "audio_anomaly_model.pkl")
    joblib.dump(model, model_path)
    
    print(f"Model successfully saved to {model_path}")

if __name__ == "__main__":
    main()
