import os
import re

models_dir = r"c:\Users\PARAS\Desktop\LEARN NOVA\nova-next\src\Models"

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    
    # Remove `next` argument from pre-save signatures
    new_content = re.sub(r'\.pre\([\'"]save[\'"],\s*async\s*function\s*\(\s*next\s*\)', '.pre("save", async function ()', new_content)
    new_content = re.sub(r'\.pre\([\'"]save[\'"],\s*function\s*\(\s*next\s*\)', '.pre("save", function ()', new_content)
    
    # Remove `return next();` logic
    new_content = re.sub(r'return\s+next\(\)\s*;?', 'return;', new_content)
    
    # Remove strict `next()` invocations
    new_content = re.sub(r'\n(\s*)next\(\)\s*;?', '', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

modified = 0
for file in os.listdir(models_dir):
    if file.endswith('.js') or file.endswith('.ts'):
        if fix_file(os.path.join(models_dir, file)):
            modified += 1

print(f"Modified {modified} model files for Mongoose 8 compatibility.")
