import os
import librosa
import numpy as np
import pandas as pd

# Dynamically resolve dataset path relative to the workspace root
AUDIO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(AUDIO_ROOT), "datasets", "Sound_Dataset", "fan"))

features = []
labels = []
machines = []

def extract_features(file_path):
    
    audio, sample_rate = librosa.load(file_path, sr=None)
    
    mfcc = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=40)
    
    mfcc_mean = np.mean(mfcc.T, axis=0)
    
    return mfcc_mean


def process_dataset():

    print("Extracting MFCC features...\n")

    for machine in os.listdir(DATASET_PATH):

        machine_path = os.path.join(DATASET_PATH, machine)

        if os.path.isdir(machine_path):

            for label in ["normal", "abnormal"]:

                label_path = os.path.join(machine_path, label)

                for file in os.listdir(label_path):

                    if file.endswith(".wav"):

                        file_path = os.path.join(label_path, file)

                        mfcc = extract_features(file_path)

                        features.append(mfcc)

                        labels.append(0 if label == "normal" else 1)

                        machines.append(machine)


    df = pd.DataFrame(features)

    df["label"] = labels

    df["machine_id"] = machines

    df.to_csv("results/audio_features.csv", index=False)

    print("Feature extraction completed")
    print("Saved to results/audio_features.csv")


if __name__ == "__main__":
    process_dataset()