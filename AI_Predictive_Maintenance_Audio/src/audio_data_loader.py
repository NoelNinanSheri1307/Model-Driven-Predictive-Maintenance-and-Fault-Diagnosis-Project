import os

# Path to dataset (updated to central location)
# Dynamically resolve dataset path relative to the workspace root
AUDIO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(AUDIO_ROOT), "datasets", "Sound_Dataset", "fan"))

def scan_dataset():
    print("Scanning dataset...\n")

    for machine in os.listdir(DATASET_PATH):
        machine_path = os.path.join(DATASET_PATH, machine)

        if os.path.isdir(machine_path):
            print(f"Machine: {machine}")

            for label in ["normal", "abnormal"]:
                label_path = os.path.join(machine_path, label)

                if os.path.exists(label_path):
                    files = [f for f in os.listdir(label_path) if f.endswith(".wav")]
                    print(f"   {label}: {len(files)} files")

            print()

if __name__ == "__main__":
    scan_dataset()