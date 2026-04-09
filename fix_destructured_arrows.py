import os, re
pages_dir = r"c:\Users\PARAS\Desktop\LEARN NOVA\nova-next\src\pages_old"

def fix_file(path):
    with open(path, "r", encoding="utf-8") as f: content = f.read()
    
    def repl_fix(m):
        return f"(useNavStore.getState().setNavState({m.group(1)}), router.push({m.group(2)}))"
        
    new_content, c = re.subn(r'useNavStore\.getState\(\)\.setNavState\((.*?)\);\s*router\.push\((.*?)\)', repl_fix, content)

    if new_content != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    return False

for root, _, files in os.walk(pages_dir):
    for fn in files:
        if fn.endswith(('.tsx', '.jsx', '.ts', '.js')):
            fix_file(os.path.join(root, fn))
