import os

pages_dir = r"c:\Users\PARAS\Desktop\LEARN NOVA\nova-next\src\pages_old"

def fix_use_client(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.split('\n')
    use_client_idx = -1
    for i, line in enumerate(lines):
        # Find exact 'use client' or "use client" directives
        if line.strip() in ['"use client";', "'use client';", '"use client"', "'use client'"]:
            use_client_idx = i
            break

    if use_client_idx > 0:
        # Move it to the very top
        line_to_move = lines.pop(use_client_idx)
        lines.insert(0, line_to_move)
        with open(path, "w", encoding="utf-8") as f:
            f.write('\n'.join(lines))
        return True
    return False

modified = 0
for root, _, files in os.walk(pages_dir):
    for fn in files:
        if fn.endswith(('.tsx', '.jsx', '.ts', '.js')):
            if fix_use_client(os.path.join(root, fn)):
                modified += 1

print(f"Propagated use client to exact file peaks in {modified} Next.js files.")
