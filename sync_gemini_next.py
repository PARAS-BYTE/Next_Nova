import os

nova_dir = r"c:\Users\PARAS\Desktop\LEARN NOVA\nova-next\src"

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content.replace('gemini-1.5-flash', 'gemini-flash-latest')

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

modified_count = 0
for root, dirs, files in os.walk(nova_dir):
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
        
    for filename in files:
        if filename.endswith(('.ts', '.js', '.tsx', '.jsx')):
            filepath = os.path.join(root, filename)
            if fix_file(filepath):
                modified_count += 1

print(f"Success! Scaled {modified_count} nova-next files onto gemini-flash-latest compatibility map.")
