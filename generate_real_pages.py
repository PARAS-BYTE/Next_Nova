import os
import re

app_tsx_path = r"c:\Users\PARAS\Desktop\LEARN NOVA\Front\src\App.tsx"
next_app_dir = r"c:\Users\PARAS\Desktop\LEARN NOVA\nova-next\src\app"

with open(app_tsx_path, "r", encoding="utf-8") as f:
    content = f.read()

# Improved import parsing
imports_map = {}
for line in content.split('\n'):
    line = line.strip()
    if line.startswith('import '):
        match = re.search(r'import\s+(.*?)\s+from\s+["\']([^"\']+)["\'];?', line)
        if match:
            names_block = match.group(1).replace('{', '').replace('}', '')
            names = [n.strip() for n in names_block.split(',') if n.strip()]
            path = match.group(2)
            
            new_path = path
            if path.startswith('./pages'):
                new_path = path.replace('./pages', '@/pages_old')
            elif path.startswith('./components'):
                new_path = path.replace('./components', '@/components')
            elif path.startswith('./') or path.startswith('../'):
                new_path = path.replace('./', '@/pages_old/').replace('../', '@/pages_old/')
                
            for name in names:
                # remove "as" alias if exists: e.g. Toaster as Sonner
                if " as " in name:
                    name = name.split(" as ")[1].strip()
                imports_map[name] = (new_path, "{" not in match.group(1))

# Re-parse routes
routes = re.findall(r'<Route\s+path="([^"]+)"\s+element=\{([\s\S]*?)\}\s*/>', content)

for path, element in routes:
    if path == "*":
        continue
    
    path_cleaned = path.strip("/")
    if path_cleaned == "":
        dir_path = next_app_dir
    else:
        parts = path_cleaned.split("/")
        new_parts = []
        for p in parts:
            if p.startswith(":"):
                new_parts.append(f"[{p[1:]}]")
            else:
                new_parts.append(p)
        dir_path = os.path.join(next_app_dir, *new_parts)
    
    os.makedirs(dir_path, exist_ok=True)
    
    comp_names = re.findall(r'<([A-Z][a-zA-Z0-9_]*)', element)
    comp_names = list(set(comp_names))
    
    import_statements = ['import dynamic from "next/dynamic";']
    for c in comp_names:
        if c in imports_map:
            imp_path, is_default = imports_map[c]
            if is_default:
                import_statements.append(f'const {c} = dynamic(() => import("{imp_path}"), {{ ssr: false }});')
            else:
                import_statements.append(f'const {c} = dynamic(() => import("{imp_path}").then((mod) => mod.{c}), {{ ssr: false }});')
        elif c == "Suspense":
            import_statements.append('import { Suspense } from "react";')
            
    imports_block = "\n".join(import_statements)
    
    with open(os.path.join(dir_path, "page.tsx"), "w", encoding="utf-8") as pf:
        pf.write(f'''"use client";

{imports_block}

export default function Page() {{
  return (
    {element}
  );
}}
''')

print("Routes successfully built with imports!")
