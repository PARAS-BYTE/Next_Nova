import os
import re

src_dir = r"c:\Users\PARAS\Desktop\LEARN NOVA\nova-next\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace http://localhost:5000 with nothing, 
    # so that "http://localhost:5000/api/..." becomes "/api/..."
    
    new_content = content.replace('http://localhost:5000', '')
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

modified_count = 0
for root, _, files in os.walk(src_dir):
    for filename in files:
        if filename.endswith(('.tsx', '.ts', '.jsx', '.js')):
            filepath = os.path.join(root, filename)
            if process_file(filepath):
                modified_count += 1

print(f"Modified {modified_count} files for API URL migration.")
