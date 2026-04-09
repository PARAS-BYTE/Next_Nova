import os, re

store_content = """import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useNavStore = create(persist((set) => ({
    navState: null,
    setNavState: (data) => set({ navState: data })
}), { name: 'nav-state', storage: createJSONStorage(() => sessionStorage) }));
"""
with open(r"c:\Users\PARAS\Desktop\LEARN NOVA\nova-next\src\store\useNavStore.ts", "w") as f:
    f.write(store_content)

pages_dir = r"c:\Users\PARAS\Desktop\LEARN NOVA\nova-next\src\pages_old"

def fix_file(path):
    with open(path, "r", encoding="utf-8") as f: content = f.read()
    
    orig = content
    
    # Destructuring replacements
    def repl_destruct(m):
        return f"const {m.group(1)} = useNavStore(s => s.navState);"
    content, c1 = re.subn(r'const\s*{\s*state\s*:\s*([^}\s]+)\s*}\s*=\s*usePathname\(\)\s*;?', repl_destruct, content)
    
    content, c2 = re.subn(r'const\s*{\s*state\s*}\s*=\s*usePathname\(\)\s*(?:;|\/\/.*)?', 'const state = useNavStore(s => s.navState);', content)
    
    # Push replacements - handled by matching everything inside the `{ state: ... }` block
    # router.push("/student/quizresult",{state:some.data})
    # We will match router.push(arg1, { state: arg2 })
    def repl_push(m):
        arg1 = m.group(1)
        arg2 = m.group(2)
        # arg2 could be something like `{ battleId }` or `id`
        return f"useNavStore.getState().setNavState({arg2}); router.push({arg1})"

    # Using a greedy match for the state argument up to the closing `})` of router.push
    content, c3 = re.subn(r'router\.push\(([^,]+),\s*{\s*state\s*:\s*(.*?)\s*}\)', repl_push, content)

    if c1 > 0 or c2 > 0 or c3 > 0:
        content = "import { useNavStore } from '@/store/useNavStore';\n" + content
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False

modified = 0
for root, _, files in os.walk(pages_dir):
    for fn in files:
        if fn.endswith(('.tsx', '.jsx', '.ts', '.js')):
            if fix_file(os.path.join(root, fn)):
                modified += 1

print(f"Patched {modified} files to map generic react router state logic gracefully onto Zustand!")
