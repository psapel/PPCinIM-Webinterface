import os
import json

def load_json_files(folder_path):
    json_data = []
    for filename in os.listdir(folder_path):
        if filename.endswith('.json'):
            file_path = os.path.join(folder_path, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    json_data.append(data)
            except json.JSONDecodeError as e:
                print(f"Error loading JSON from file {file_path}: {e}")
    return json_data



