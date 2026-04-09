import os
import re

src_dir = r"C:\Users\PARAS\Desktop\LEARN NOVA\nova-next\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # Check if uses react-router-dom
    if 'react-router-dom' not in content:
        return False

    # Replacements
    # 1. import { Link, useLocation } from 'react-router-dom'
    # We'll just carefully replace imports.
    # It's easier using regex to find used imports.
    
    imports = re.findall(r'import\s+\{([^}]+)\}\s+from\s+[\'"]react-router-dom[\'"]', content)
    
    # Remove all react-router-dom imports
    content = re.sub(r'import\s+\{([^}]+)\}\s+from\s+[\'"]react-router-dom[\'"];?', '', content)
    
    # Find what was imported
    imported_items = []
    for imp in imports:
        items = [x.strip() for x in imp.split(',')]
        imported_items.extend(items)
        
    next_nav_imports = []
    has_link = False
    
    for item in imported_items:
        if item == 'Link':
            has_link = True
        if item == 'useNavigate':
            next_nav_imports.append('useRouter')
            # Replace useNavigate() with useRouter()
            content = content.replace('useNavigate()', 'useRouter()')
            # The variable is usually `const navigate = useNavigate()`, change it to `const router = useRouter()`
            content = content.replace('const navigate', 'const router')
            content = content.replace('navigate(', 'router.push(')
        if item == 'useLocation':
            next_nav_imports.append('usePathname')
            content = content.replace('useLocation()', 'usePathname()')
            content = content.replace('location.pathname', 'pathname')
            content = content.replace('const location = ', 'const pathname = ')

    if has_link:
        content = f"import Link from 'next/link';\n" + content
    
    if next_nav_imports:
        imports_str = ', '.join(next_nav_imports)
        content = f"import {{ {imports_str} }} from 'next/navigation';\n" + content

    # Replace <Link to=...> with <Link href=...>
    content = re.sub(r'<Link([^>]*?)\bto=', r'<Link\1href=', content)
    # Replace <NavLink to=...> with <Link href=...>
    content = re.sub(r'<NavLink([^>]*?)\bto=', r'<Link\1href=', content)
    content = content.replace('</NavLink>', '</Link>')

    # Add "use client" if there are client hooks
    if ('useRouter' in content or 'usePathname' in content) and '"use client"' not in content and "'use client'" not in content:
        content = '"use client";\n' + content

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

modified_count = 0
for root, _, files in os.walk(src_dir):
    for filename in files:
        if filename.endswith('.tsx') or filename.endswith('.ts') or filename.endswith('.jsx') or filename.endswith('.js'):
            filepath = os.path.join(root, filename)
            if process_file(filepath):
                modified_count += 1
                
print(f"Modified {modified_count} files for react-router-dom migration.")
