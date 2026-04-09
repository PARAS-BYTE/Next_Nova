import os
import re

src_dir = r"c:\Users\PARAS\Desktop\LEARN NOVA\nova-next\src"

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace experimental gemini-2.5-flash with stable gemini-1.5-flash
    new_content = content.replace("gemini-2.5-flash", "gemini-1.5-flash")

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
            if fix_file(filepath):
                modified_count += 1

print(f"Modified {modified_count} files to fix Gemini model API.")
