import os
import glob

# Paths to replace
replacements = {
    r"E:\AI_Predictive_Maintenance_Project\datasets\IPAD_dataset": r"E:\AI_Predictive_Maintenance_Project\datasets\IPAD_dataset",
    r"E:\\AI_Predictive_Maintenance_Project\\datasets\\IPAD_dataset": r"E:\\AI_Predictive_Maintenance_Project\\datasets\\IPAD_dataset",
    r"E:\AI_Predictive_Maintenance_Project\datasets\RUL_project": r"E:\AI_Predictive_Maintenance_Project\datasets\RUL_project",
    r"E:\\AI_Predictive_Maintenance_Project\\datasets\\RUL_project": r"E:\\AI_Predictive_Maintenance_Project\\datasets\\RUL_project"
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    new_content = content
    for old_path, new_path in replacements.items():
        # Replace normal strings
        new_content = new_content.replace(old_path, new_path)
        # Replace paths where forward slashes might be used instead of backslashes
        new_content = new_content.replace(old_path.replace("\\", "/"), new_path.replace("\\", "/"))
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated paths in: {filepath}")

if __name__ == "__main__":
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Process all python files
    for root, dirs, files in os.walk(root_dir):
        if "node_modules" in root or "__pycache__" in root or ".git" in root:
            continue
        for file in files:
            if file.endswith(".py"):
                process_file(os.path.join(root, file))
    
    print("Done updating paths!")
