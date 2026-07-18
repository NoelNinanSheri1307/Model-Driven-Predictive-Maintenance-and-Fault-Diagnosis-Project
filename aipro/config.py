import os
import sys

# Get the absolute path of the directory containing config.py (which is 'aipro')
AIPRO_ROOT = os.path.dirname(os.path.abspath(__file__))

# The workspace root is the parent directory of 'aipro'
# e.g., if aipro is in E:\AI_Workspace\aipro, WORKSPACE_ROOT is E:\AI_Workspace
WORKSPACE_ROOT = os.path.dirname(AIPRO_ROOT)

# Centralized dataset paths relative to the workspace root
DATASETS_DIR = os.getenv("DATASETS_DIR", os.path.join(WORKSPACE_ROOT, "datasets"))

IPAD_DATASET_PATH = os.path.join(DATASETS_DIR, "IPAD Video Dataset", "IPAD_dataset")
RUL_PROJECT_PATH = os.path.join(DATASETS_DIR, "RUL_project")
SOUND_DATASET_PATH = os.path.join(DATASETS_DIR, "Sound_Dataset")
